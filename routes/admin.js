const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Student management routes
router.get('/students', adminController.getStudents);
router.get('/students/add', adminController.getAddStudentForm);
router.post('/students/add', adminController.addStudent);
router.get('/students/edit/:id', adminController.getEditStudentForm);
router.post('/students/edit/:id', adminController.updateStudent);
router.post('/students/delete', adminController.deleteStudent);

// Faculty management routes
router.get('/faculty', adminController.getFaculty);
router.get('/faculty/add', adminController.getAddFacultyForm);
router.post('/faculty/add', adminController.addFaculty);
router.get('/faculty/edit/:id', adminController.getEditFacultyForm);
router.post('/faculty/edit/:id', adminController.updateFaculty);
router.post('/faculty/delete', adminController.deleteFaculty);

module.exports = router;
