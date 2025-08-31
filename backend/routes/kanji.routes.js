import express from 'express';
import * as kanjiController from '../controllers/kanji.controller.js';

const router = express.Router();

router.get('/', kanjiController.getAllKanji);

router.get('/filter', kanjiController.filterKanji);

router.get('/:character', kanjiController.getKanjiDetail);

export default router;
