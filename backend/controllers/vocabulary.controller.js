import Vocabulary from '../models/vocabulary.model.js';
import wanakana from 'wanakana';

export const getVocabularyDetail = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOne({ id: req.params.id });
    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }
    res.json(vocabulary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// escape regex special chars
const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const filterVocabulary = async (req, res) => {
  try {
    const { writing, meaning } = req.query;
    let filter = {};

    // condition for writing (kanji OR kana)
    const orFilters = [];

    if (writing && String(writing).trim() !== '') {
      const raw = String(writing).trim(); //for hira/kata/romaji
      const safe = escapeRegex(raw); // for kanji

      const hira = wanakana.toHiragana(raw);
      const kata = wanakana.toKatakana(raw);

      orFilters.push({ 'kanji.text': { $regex: safe, $options: 'i' } });

      orFilters.push({ 'kana.text': { $regex: escapeRegex(hira), $options: 'i' } });
      orFilters.push({ 'kana.text': { $regex: escapeRegex(kata), $options: 'i' } });
    }

    const meaningCond = (meaning && String(meaning).trim() !== '')
      ? { 'sense.gloss.text': { $regex: escapeRegex(String(meaning).trim()), $options: 'i' } }
      : null;

    if (orFilters.length > 0 && meaningCond) {
      // both writing (kanji/kana) AND meaning must match
      filter = {
        $and: [
          { $or: orFilters },
          meaningCond
        ]
      };
    } else if (orFilters.length > 0) {
      // only writing
      filter = { $or: orFilters };
    } else if (meaningCond) {
      // only meaning
      filter = meaningCond;
    } else {
      return res.status(400).json({ error: 'Please provide writing or meaning query' });
    }

    const results = await Vocabulary.find(filter).limit(100);

    if (!results.length) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};