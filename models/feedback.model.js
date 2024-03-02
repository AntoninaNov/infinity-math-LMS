const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    content: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'course content', 'platform usability'
    status: { type: String, default: 'pending' }, // e.g., 'pending', 'reviewed', 'addressed'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
