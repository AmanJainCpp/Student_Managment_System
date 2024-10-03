const db = require('../config/db');
const pdf = require('pdfkit');
const moment = require('moment');
const { Parser } = require('json2csv'); // For CSV export

// Teacher dashboard view
exports.getTeacherDashboard = (req, res) => {
    const userId = req.session.user.id; // Fetch user ID from session
    // Fetch students assigned to this user
    db.query('SELECT * FROM students', (err, students) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).send('Error fetching students');
        }
        res.render('teacherDashboard', { students });
    });
};

// View a list of assigned students
exports.getAssignedStudents = (req, res) => {
    db.query('SELECT * FROM students', (err, students) => {
        if (err) {
            console.error('Error fetching assigned students:', err);
            return res.status(500).send('Error fetching assigned students');
        }
        res.render('teacherStudents', { students });
    });
};

// Update teacher profile information
exports.updateProfile = (req, res) => {
    const userId = req.session.user.id; // Fetch user ID from session
    const { name, email } = req.body;

    db.query(
        'UPDATE users SET username = ?, email = ? WHERE id = ? AND role = "teacher"',
        [name, email, userId], // Use userId instead of teacherId
        (err) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).send('Error updating profile');
            }
            res.redirect('/teacher/profile');
        }
    );
};

// View profile information
exports.viewProfile = (req, res) => {
    const userId = req.session.user.id; // Fetch user ID from session
    db.query('SELECT * FROM users WHERE id = ? AND role = "teacher"', [userId], (err, user) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).send('Error fetching profile');
        }
        res.render('teacherProfile', { user });
    });
};

// Get report generation form
// Get report generation form
exports.getReportForm = (req, res) => {
    const subjectSql = 'SELECT * FROM subjects'; // Adjust the SQL query as per your schema
    db.query(subjectSql, (err, subjects) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            return res.status(500).send('Error fetching subjects');
        }
        console.log('Fetched Subjects:', subjects); // Log the subjects to check if they are fetched
        res.render('generateReport', { subjects }); // Pass subjects to the view
    });
};


// Function to generate attendance report (PDF)
exports.generateReport = (req, res) => {
    const { startDate, endDate, subjectId } = req.body;

    const sql = `
        SELECT a.date, s.id AS student_id, s.name AS student_name, u.username AS faculty_name, a.status, sub.name AS subject_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN subjects sub ON a.subject_id = sub.id
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

        // Create the PDF
        const doc = new pdf();
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

        doc.end(); // End the PDF generation
    });
};

// Function to export report as CSV
exports.exportReportAsCSV = (req, res) => {
    const { startDate, endDate, subjectId } = req.body;

    const sql = `
        SELECT a.date, s.id AS student_id, s.name AS student_name, u.username AS faculty_name, a.status, sub.name AS subject_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.date BETWEEN ? AND ? AND a.subject_id = ?
        ORDER BY a.date, s.name
    `;

    db.query(sql, [startDate, endDate, subjectId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance data for CSV:', err);
            return res.status(500).send('Error fetching attendance data for CSV');
        }

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).send('No attendance records found for this date range.');
        }

        // Convert JSON data to CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(results);

        // Set CSV headers
        res.header('Content-Type', 'text/csv');
        res.attachment(`Attendance_Report_${startDate}_to_${endDate}.csv`);
        res.send(csv);
    });
};
