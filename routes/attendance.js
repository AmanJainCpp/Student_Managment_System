const express = require('express'); 
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes for attendance functionality
router.get('/', authMiddleware.isTeacher, attendanceController.getAttendancePage); // Main attendance page
router.post('/mark', authMiddleware.isTeacher, attendanceController.markAttendance); // Mark attendance
router.get('/student/:studentId', authMiddleware.isTeacher, attendanceController.viewStudentAttendance); // View individual student's attendance

// Report routes
router.get('/report', authMiddleware.isTeacher, attendanceController.getReportForm); // Route to get the report generation form
router.post('/report/generate', authMiddleware.isTeacher, attendanceController.generateReport); // Route to generate the PDF report
router.post('/report/export', authMiddleware.isTeacher, attendanceController.exportReportAsCSV); // Route to export report as CSV

module.exports = router;
