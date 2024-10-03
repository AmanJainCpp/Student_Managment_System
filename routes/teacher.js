const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

// Teacher-specific routes
router.get('/dashboard', authMiddleware.isTeacher, teacherController.getTeacherDashboard); // Teacher dashboard
router.get('/students', authMiddleware.isTeacher, teacherController.getAssignedStudents); // View assigned students
router.get('/profile', authMiddleware.isTeacher, teacherController.viewProfile); // View teacher profile
router.post('/profile/update', authMiddleware.isTeacher, teacherController.updateProfile); // Update teacher profile

module.exports = router;
