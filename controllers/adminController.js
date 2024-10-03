const db = require('../config/db');
const bcrypt = require('bcrypt');

// Dashboard handler
exports.getDashboard = (req, res) => {
    const totalStudents = 100; 
    const activeStudents = 80; 
    const inactiveStudents = 20; 
    const latestUpdates = [
        { message: 'New student added', date: '2024-10-03' },
        { message: 'Attendance report generated', date: '2024-10-04' },
    ];

    // Fetch total faculty for the overview
    const facultySql = 'SELECT COUNT(*) AS totalFaculty FROM faculty';
    db.query(facultySql, (err, facultyResult) => {
        if (err) {
            console.error('Error fetching faculty count:', err);
            return res.status(500).send('Error fetching dashboard data');
        }
        const totalFaculty = facultyResult[0].totalFaculty;

        res.render('dashboard', {
            user: req.session.user, 
            totalStudents,
            activeStudents,
            inactiveStudents,
            totalFaculty, // Include total faculty in the dashboard
            latestUpdates,
        });
    });
};

// Student management
exports.getStudents = (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).send('Error fetching students');
        }
        res.render('students', { students: results });
    });
};

exports.getAddStudentForm = (req, res) => {
    res.render('addStudent');
};

exports.addStudent = (req, res) => {
    const { id, name, email } = req.body;
    const sql = 'INSERT INTO students (id, name, email) VALUES (?, ?, ?)';
    db.query(sql, [id, name, email], (err) => {
        if (err) {
            console.error('Error adding student:', err);
            return res.status(500).send('Error adding student');
        }
        res.redirect('/admin/students');
    });
};

exports.getEditStudentForm = (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).send('Error fetching student');
        }
        if (results.length === 0) {
            return res.status(404).send('Student not found');
        }
        res.render('editStudent', { student: results[0] });
    });
};

exports.updateStudent = (req, res) => {
    const studentId = req.params.id;
    const { name, email } = req.body;
    const sql = 'UPDATE students SET name = ?, email = ? WHERE id = ?';
    db.query(sql, [name, email, studentId], (err) => {
        if (err) {
            console.error('Error updating student:', err);
            return res.status(500).send('Error updating student');
        }
        res.redirect('/admin/students');
    });
};

exports.deleteStudent = (req, res) => {
    const studentId = req.body.id; // Get student ID from request body
    const sql = 'DELETE FROM students WHERE id = ?'; // SQL query to delete the student
    db.query(sql, [studentId], (err) => {
        if (err) {
            console.error('Error deleting student:', err); // Log any errors
            return res.status(500).send('Error deleting student'); // Send error response
        }
        res.redirect('/admin/students'); // Redirect to students page after deletion
    });
};


// Faculty management
exports.getFaculty = (req, res) => {
    const sql = 'SELECT * FROM faculty';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching faculty:', err);
            return res.status(500).send('Error fetching faculty');
        }
        res.render('faculty', { faculty: results });
    });
};

exports.getAddFacultyForm = (req, res) => {
    res.render('addFaculty');
};

exports.addFaculty = async (req, res) => {
    const { facultyId, name, username, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the faculty member into the faculty table
        const facultySql = 'INSERT INTO faculty (faculty_id, name, username, email) VALUES (?, ?, ?, ?)';
        await db.query(facultySql, [facultyId, name, username, email]);

        // Insert the same information into the users table
        const userSql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await db.query(userSql, [username, hashedPassword, 'teacher']);

        res.redirect('/admin/faculty');
    } catch (err) {
        console.error('Error adding faculty:', err);
        return res.status(500).send('Error adding faculty');
    }
};

exports.getEditFacultyForm = (req, res) => {
    const facultyId = req.params.id;
    const sql = 'SELECT * FROM faculty WHERE faculty_id = ?';
    db.query(sql, [facultyId], (err, results) => {
        if (err) {
            console.error('Error fetching faculty:', err);
            return res.status(500).send('Error fetching faculty');
        }
        if (results.length === 0) {
            return res.status(404).send('Faculty not found');
        }
        res.render('editFaculty', { faculty: results[0] });
    });
};

exports.updateFaculty = async (req, res) => {
    const facultyId = req.params.id;
    const { name, username, email, password } = req.body;
    let sql;
    const params = [name, username, email, facultyId];

    // If a new password is provided, hash it and update it
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = 'UPDATE faculty SET name = ?, username = ?, email = ?, password = ? WHERE faculty_id = ?';
        params.unshift(hashedPassword); // Add hashed password to the beginning of the params
    } else {
        sql = 'UPDATE faculty SET name = ?, username = ?, email = ? WHERE faculty_id = ?';
    }

    db.query(sql, params, (err) => {
        if (err) {
            console.error('Error updating faculty:', err);
            return res.status(500).send('Error updating faculty');
        }
        res.redirect('/admin/faculty');
    });
};

exports.deleteFaculty = (req, res) => {
    const facultyId = req.body.id;
    const sql = 'DELETE FROM faculty WHERE faculty_id = ?';
    db.query(sql, [facultyId], (err) => {
        if (err) {
            console.error('Error deleting faculty:', err);
            return res.status(500).send('Error deleting faculty');
        }
        res.redirect('/admin/faculty');
    });
};
