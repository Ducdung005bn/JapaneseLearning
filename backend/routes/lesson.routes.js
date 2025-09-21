import express from 'express';
import { authorize, allowSelfOrAdmin } from '../middlewares/auth.middleware.js';
import * as lessonController from '../controllers/lesson.controller.js';

const router = express.Router();

router.post('/:id', authorize, allowSelfOrAdmin, lessonController.createLesson);

router.get('/:id', authorize, allowSelfOrAdmin, lessonController.getLessons);

router.get('/:id/:lessonId', authorize, allowSelfOrAdmin, lessonController.getLessonById);

router.post('/:id/:lessonId/question', authorize, allowSelfOrAdmin, lessonController.createQuestion);

router.post('/:id/:lessonId/parent-question', authorize, allowSelfOrAdmin, lessonController.createParentQuestion);

router.put('/:id/:lessonId/question/:questionId', authorize, allowSelfOrAdmin, lessonController.updateQuestion);

router.delete('/:id/:lessonId/question/:questionId', authorize, allowSelfOrAdmin, lessonController.deleteQuestion);

router.post('/:id/:lessonId/:parentQuestionId', authorize, allowSelfOrAdmin, lessonController.addQuestionToParentQuestion);

router.delete('/:id/:lessonId/:parentQuestionId/:questionId', authorize, allowSelfOrAdmin, lessonController.removeQuestionFromParentQuestion);

router.put('/:id/:lessonId/:parentQuestionId/:questionId', authorize, allowSelfOrAdmin, lessonController.updateQuestionInParentQuestion);

router.patch('/:id/:lessonId/:parentQuestionId', authorize, allowSelfOrAdmin, lessonController.updateContentInParentQuestion);



export default router;
