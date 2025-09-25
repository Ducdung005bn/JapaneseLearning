import express from 'express';
import { authorize, allowSelfOrAdmin } from '../middlewares/auth.middleware.js';
import * as quizController from '../controllers/quiz.controller.js';

const router = express.Router();

router.post('/:id/:lessonId/start', authorize, allowSelfOrAdmin, quizController.startQuiz);

router.get('/:id/:lessonId/next/question', authorize, allowSelfOrAdmin, quizController.getNextQuestion);

router.post('/:id/:lessonId/:questionId', authorize, allowSelfOrAdmin, quizController.submitAnswer);




export default router;

