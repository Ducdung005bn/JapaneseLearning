import Kanji from '../models/kanji.model.js';
import wanakana from 'wanakana'; //hiragana katakana conversion

export const getAllKanji = async (req, res) => {
  try {
    const kanjiList = await Kanji.find();
    res.json(kanjiList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getKanjiDetail = async (req, res) => {
  try {
    const kanji = await Kanji.findOne({ kanji: req.params.character });
    if (!kanji) return res.status(404).json({ error: 'Kanji not found' });
    res.json(kanji);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const filterKanji = async (req, res) => {
  try {
    const { han_viet, children, on_readings, kun_readings } = req.query;

    // Tạo filter trống
    let filter = {};

    // Tìm theo Hán-Việt / Heisig
    if (han_viet) {
      const regex = { $regex: han_viet, $options: 'i' };
      filter.$or = [
        { 'han_viet.reading': regex },
        { heisig_en: regex }
      ];
    }

    // Tìm theo bộ thủ (trong children.part)
    if (children) {
      filter['children.part'] = children;
    }

    if (on_readings) {
      const onKatakana = wanakana.toKatakana(on_readings);
      filter.on_readings = { $regex: onKatakana, $options: 'i' };
    }

    if (kun_readings) {
      const kunHiragana = wanakana.toHiragana(kun_readings);
      filter.kun_readings = { $regex: kunHiragana, $options: 'i' };
    }


    // Thực hiện tìm kiếm
    const results = await Kanji.find(filter);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

