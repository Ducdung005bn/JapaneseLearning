import Vocabulary from '../models/vocabulary.model.js';
import wanakana from 'wanakana';

export const getVocabularyDetail = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOne({ _id: req.params.id });
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

    const orFilters = [];

    if (writing && String(writing).trim() !== '') {
      const raw = String(writing).trim();
      const safe = escapeRegex(raw);

      const hira = wanakana.toHiragana(raw);
      const kata = wanakana.toKatakana(raw);

      orFilters.push({ 'kanji.text': { $regex: safe, $options: 'i' } });
      orFilters.push({ 'kana.text': { $regex: escapeRegex(hira), $options: 'i' } });
      orFilters.push({ 'kana.text': { $regex: escapeRegex(kata), $options: 'i' } });
    }

    const meaningCond =
      meaning && String(meaning).trim() !== ''
        ? { 'sense.gloss.text': { $regex: escapeRegex(String(meaning).trim()), $options: 'i' } }
        : null;

    if (orFilters.length > 0 && meaningCond) {
      filter = { $and: [{ $or: orFilters }, meaningCond] };
    } else if (orFilters.length > 0) {
      filter = { $or: orFilters };
    } else if (meaningCond) {
      filter = meaningCond;
    } else {
      return res.status(400).json({ error: 'Please provide writing or meaning query' });
    }

    let results = await Vocabulary.find(filter).lean(); // dùng lean() để có object thuần

    if (!results.length) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Lọc dữ liệu trước khi trả về
    results = results
      .map(v => {
        const filteredKanji = (v.kanji || []).filter(k => k.common);
        const filteredKana = (v.kana || []).filter(k => k.common);

        const filteredSense = (v.sense || []).map(s => ({
          ...s,
          gloss: s.gloss.slice(0, 1) // chỉ giữ 1 nghĩa đầu tiên
        }));

        return {
          ...v,
          kanji: filteredKanji,
          kana: filteredKana,
          sense: filteredSense
        };
      })
      // Chỉ giữ các mục còn ít nhất 1 kanji hoặc kana sau khi lọc
      .filter(v => (v.kanji.length > 0 || v.kana.length > 0));

    if (!results.length) {
      return res.status(404).json({ message: 'No common vocabulary found' });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
