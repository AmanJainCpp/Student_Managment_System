const db = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { Parser } = require('json2csv');

// Ensure the reports directory exists
const reportsDir = path.join(__dirname, '../public/reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}

// Get attendance page for a specific class or student list
exports.getAttendancePage = (req, res) => {
    const fetchStudents = 'SELECT * FROM students';
    const fetchSubjects = 'SELECT * FROM subjects';

    db.query(fetchStudents, (err, students) => {
        if (err) {
            console.error('Error fetching students:', err.message);
            return res.status(500).send('Could not fetch students. Please try again later.');
        }

        db.query(fetchSubjects, (err, subjects) => {
            if (err) {
                console.error('Error fetching subjects:', err.message);
                return res.status(500).send('Could not fetch subjects. Please try again later.');
            }
            res.render('attendance', { students, subjects });
        });
    });
};

// Mark attendance for students
exports.markAttendance = (req, res) => {
    const { attendanceData, subjectId } = req.body;

    if (!attendanceData || typeof attendanceData !== 'object' || !subjectId) {
        console.error('Invalid attendance data or subjectId');
        return res.status(400).send('Invalid attendance data or subjectId');
    }

    const promises = [];
    for (const key in attendanceData) {
        const record = attendanceData[key];
        promises.push(
            new Promise((resolve, reject) => {
                db.query(
                    'INSERT INTO attendance (student_id, user_id, subject_id, date, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
                    [record.studentId, req.session.user.id, subjectId, record.date, record.status, record.status],
                    (err) => {
                        if (err) {
                            console.error('Error inserting attendance record:', err);
                            return reject(err);
                        }
                        resolve();
                    }
                );
            })
        );
    }

    Promise.all(promises)
        .then(() => res.redirect('/teacher/dashboard'))
        .catch(() => res.status(500).send('Error marking attendance'));
};

// View attendance records for a specific student
exports.viewStudentAttendance = (req, res) => {
    const studentId = req.params.studentId;
    db.query(
        'SELECT * FROM attendance WHERE student_id = ?',
        [studentId],
        (err, attendanceRecords) => {
            if (err) {
                console.error('Error fetching attendance records:', err);
                return res.status(500).send('Could not fetch attendance records. Please try again later.');
            }

            if (!Array.isArray(attendanceRecords)) {
                console.error('Expected an array but got:', attendanceRecords);
                return res.status(500).send('Unexpected error occurred while fetching attendance records.');
            }

            res.render('viewAttendance', { attendanceRecords });
        }
    );
};

// Get report generation form
exports.getReportForm = (req, res) => {
    const subjectSql = 'SELECT * FROM subjects';
    db.query(subjectSql, (err, subjects) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            return res.status(500).send('Could not fetch subjects. Please try again later.');
        }
        res.render('generateReport', { subjects });
    });
};

// Generate attendance report for a class or a specific period
exports.generateReport = (req, res) => {
    const { startDate, endDate, subjectId } = req.body;

    const sql = `
        SELECT a.date, s.id AS student_id, s.name AS student_name, u.username AS faculty_name, a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON a.user_id = u.id
        WHERE a.date BETWEEN ? AND ? AND a.subject_id = ?
        ORDER BY a.date, s.name
    `;

    db.query(sql, [startDate, endDate, subjectId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance data:', err);
            return res.status(500).send('Error fetching attendance data');
        }

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).send('No attendance records found for this date range.');
        }

        // Create PDF
        const doc = new PDFDocument(); // Changed to PDFDocument constructor
        let filename = `Attendance_Report_${startDate}_to_${endDate}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Attendance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`From: ${moment(startDate).format('YYYY-MM-DD')} To: ${moment(endDate).format('YYYY-MM-DD')}`);
        doc.moveDown();

        // Add table header
        doc.text('Date          | Student ID | Student Name       | Faculty Name  | Status', {
            underline: true,
        });
        doc.moveDown();

        // Add attendance data
        results.forEach(row => {
            const formattedDate = moment(row.date).format('YYYY-MM-DD');
            doc.text(`${formattedDate} | ${row.student_id} | ${row.student_name} | ${row.faculty_name} | ${row.status}`);
        });

        doc.end();
    });
};

// Export report as CSV
exports.exportReportAsCSV = (req, res) => {
    const reportData = JSON.parse(req.body.reportData);

    const csvParser = new Parser();
    
    try {
        const csv = csvParser.parse(reportData);
        const filePath = path.join(reportsDir, 'attendance_report.csv');
        fs.writeFileSync(filePath, csv);

        res.download(filePath, 'attendance_report.csv', (err) => {
            if (err) {
                console.error('Error downloading CSV file:', err);
                return res.status(500).send('Could not download CSV file. Please try again later.');
            }
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting CSV file:', err);
                }
            });
        });
    } catch (err) {
        console.error('Error exporting report as CSV:', err);
        return res.status(500).send('Could not export report as CSV. Please try again later.');
    }
};
