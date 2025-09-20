import express from 'express';
import * as vocabularyController from '../controllers/vocabulary.controller.js';

const router = express.Router();

router.get('/filter', vocabularyController.filterVocabulary);

router.get('/:id', vocabularyController.getVocabularyDetail);

// router.get('/', vocabularyController.getAllVocabulary);

export default router;
