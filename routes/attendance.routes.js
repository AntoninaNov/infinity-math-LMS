const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const auth = require("../middlewares/auth");
const { authorize } = require("../utils/role");
router.use(auth);

router.post('/api/courses/:courseId/attendance', authorize("instructor"), attendanceController.recordAttendance);
router.get('/api/courses/:courseId/attendance', authorize("instructor"), attendanceController.getAttendanceRecords);
router.get('/api/users/:userId/attendance', attendanceController.getUserAttendanceRecords);

module.exports = router;
