import express from 'express';
import * as vocabularyController from '../controllers/vocabulary.controller.js';

const router = express.Router();

router.post('/findVocabulary', vocabularyController.findVocabulary); //for kanji

router.get('/filter', vocabularyController.filterVocabulary);

router.get('/:id', vocabularyController.getVocabularyDetail);

export default router;
