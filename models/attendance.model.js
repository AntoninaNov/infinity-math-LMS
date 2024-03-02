const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    session: { type: Date, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    absentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
