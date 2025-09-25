import express from 'express';
import {authorize, allowSelfOrAdmin, allowAdminOnly} from '../middlewares/auth.middleware.js';
import * as vocabularyController from '../controllers/vocabulary.controller.js';

const router = express.Router();

router.get('/filter', vocabularyController.filterVocabulary);

router.get('/:vocabularyId', vocabularyController.getVocabularyDetail);

router.get('/:id/:vocabularyId/:type', authorize, allowSelfOrAdmin, vocabularyController.recommendQuiz);


// router.get('/', vocabularyController.getAllVocabulary);

export default router;
