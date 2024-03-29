// quiz.routes.js
const express = require("express");
const quizController = require("../controllers/quiz.controller");
const auth = require("../middlewares/auth");
const { authorize } = require("../utils/role");

const router = new express.Router();

router.use(auth);
router.post(
    "/courses/:courseId/quizzes",
    authorize("instructor"),
    quizController.createQuiz
);
router.get("/courses/:courseId/quizzes", quizController.getQuizzesByCourse);
router.post(
    "/quizzes/:quizId/attempt",
    authorize("student"),
    quizController.attemptQuiz
);
// New route to get a detailed quiz attempt
router.get(
    "/quizzes/:quizId/attempt",
    authorize("student"),
    quizController.getQuizAttemptDetails
);

module.exports = router;
