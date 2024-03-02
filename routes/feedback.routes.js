const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const auth = require("../middlewares/auth");
const { authorize } = require("../utils/role");
router.use(auth);

router.get('/feedback', authorize("instructor"), feedbackController.listAllFeedback);
router.get('/feedback/:feedbackId', authorize("instructor"), feedbackController.getFeedback);
router.patch('/feedback/:feedbackId', authorize("student"), feedbackController.updateFeedbackStatus);
router.delete('/feedback/:feedbackId', authorize("student"), feedbackController.deleteFeedback);
router.get('/feedback/user/:userId', authorize("instructor"), feedbackController.listFeedbackByUser);
router.get('/feedback/course/:courseId', authorize("instructor"), feedbackController.listFeedbackByCourse);
router.post('/feedback', authorize("student"), feedbackController.createFeedback);

module.exports = router;
