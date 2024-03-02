const Attendance = require('../models/attendance.model');

exports.recordAttendance = async (req, res) => {
    try {
        const { course, session, attendees, absentees } = req.body;
        const newAttendance = new Attendance({ course, session, attendees, absentees });
        await newAttendance.save();
        res.status(201).send(newAttendance);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAttendanceRecords = async (req, res) => {
    try {
        const { courseId } = req.params;
        const records = await Attendance.find({ course: courseId }).populate('attendees absentees', 'name');
        res.status(200).send(records);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getUserAttendanceRecords = async (req, res) => {
    try {
        const { userId } = req.params;
        const attendanceRecords = await Attendance.find({
            $or: [
                { attendees: userId },
                { absentees: userId }
            ]
        }).populate('course', 'name').exec(); // Populate course details or adjust as needed

        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(400).send({ message: "Error fetching attendance records", error: error.message });
    }
};
