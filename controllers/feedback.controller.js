const Feedback = require('../models/feedback.model');

// List all feedback
exports.listAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user').populate('course');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Retrieve specific feedback
exports.getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.feedbackId);
        if (!feedback) return res.status(404).send('Feedback not found');
        res.json(feedback);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.feedbackId, { status: req.body.status }, { new: true });
        if (!feedback) return res.status(404).send('Feedback not found');
        res.json(feedback);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndRemove(req.params.feedbackId);
        if (!feedback) return res.status(404).send('Feedback not found');
        res.send('Feedback deleted successfully');
    } catch (error) {
        res.status(500).send(error);
    }
};

// List feedback by specific user
exports.listFeedbackByUser = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.params.userId }).populate('user').populate('course');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).send(error);
    }
};

// List feedback for a specific course
exports.listFeedbackByCourse = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ course: req.params.courseId }).populate('user').populate('course');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Post new feedback
exports.createFeedback = async (req, res) => {
    try {
        const { content, category, status, user, course } = req.body;
        const newFeedback = new Feedback({
            content,
            category,
            status,
            user,
            course
        });
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(500).send(error);
    }
};
