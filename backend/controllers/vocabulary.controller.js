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

export async function findVocabulary(req, res) {
  try {
    const { kanji: targetKanji, on_readings = [], kun_readings = [] } = req.body;

    if (!targetKanji) return res.status(400).json({ error: 'Kanji is required' });

    // 1. Lọc từ vựng chứa chữ kanji và common=true
    const vocabularyList = await Vocabulary.find({
      $or: [
        { 'kanji.text': { $regex: targetKanji } },
        { 'kana.text': { $regex: targetKanji } }
      ]
    });
  
    // For example: //{ kanji: '架空', readings: [ 'かくう', 'がくう' ] }
    const words = mapKanaPerMatchedKanji(vocabularyList, targetKanji);

    const result = classifyWords(words, targetKanji, kun_readings, on_readings)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

function mapKanaPerMatchedKanji(vocabularyList, targetKanji) {
  const results = [];

  for (const vocab of vocabularyList) {
    const matchedKanji = vocab.kanji.filter(k => k.text.includes(targetKanji));
    if (matchedKanji.length === 0) continue;

    // Khởi tạo map: matchedKanji -> Set (dùng Set để tránh trùng)
    const kanjiMap = new Map();
    for (const k of matchedKanji) kanjiMap.set(k.text, new Set());

    // Duyệt từng kana (chỉ xét kana.common)
    for (const kanaEntry of vocab.kana) {

      const reading = kanaEntry.text;

      if (kanaEntry.appliesToKanji.includes('*')) {
        // áp dụng cho tất cả matchedKanji
        for (const k of matchedKanji) kanjiMap.get(k.text).add(reading);
      } else {
        for (const k of matchedKanji) {
          if (kanaEntry.appliesToKanji.includes(k.text)) kanjiMap.get(k.text).add(reading);
        }
      }
    }

    for (const [kanjiText, setOfReadings] of kanjiMap.entries()) {
      results.push({
        kanji: kanjiText,
        readings: Array.from(setOfReadings)   // Convert Set to Array
      });
    }
  }

  return results;
}

function classifyWords(words, targetKanji, kun_readings, on_readings) {
  const kunForms = kun_readings.map(kun => {   
    let reading;
    let kanji;

    if (kun.includes(".")) {
      // Nếu có ., tách phần trước và phần sau
      const parts = kun.split(".");
      kanji = targetKanji + parts[1];
      reading = parts[0] + parts[1];           
    } else {
      kanji = targetKanji; 
      reading = kun; 
    }

    return { kanji: kanji, reading: reading };
  });
  
  const onForms = on_readings.map(r => (wanakana.toHiragana(r).replace(/[-.]/g, "")));

  // map tenten (dakuten)
  const dakutenMap = {
    "か":"が", "き":"ぎ", "く":"ぐ", "け":"げ", "こ":"ご",
    "さ":"ざ", "し":"じ", "す":"ず", "せ":"ぜ", "そ":"ぞ",
    "た":"だ", "ち":"ぢ", "つ":"づ", "て":"で", "と":"ど",
    "は":"ば", "ひ":"び", "ふ":"ぶ", "へ":"べ", "ほ":"ぼ"
  };

  // map maru (handakuten)
  const handakutenMap = {
    "は":"ぱ", "ひ":"ぴ", "ふ":"ぷ", "へ":"ぺ", "ほ":"ぽ"
  };

  // Hàm mở rộng 1 âm On
  function expandOn(word) {
    const first = word[0]; // ký tự đầu
    const rest = word.slice(1); // phần còn lại
    const results = [word]; // luôn chứa bản gốc

    if (dakutenMap[first]) results.push(dakutenMap[first] + rest);
    if (handakutenMap[first]) results.push(handakutenMap[first] + rest);

    return results;
  }

  // Biến onForms sang expandedOnForms
  const expandedOnForms = [];
  for (const on of onForms) {
    const variants = expandOn(on);
    for (const v of variants) {
      if (!expandedOnForms.includes(v)) { // tránh trùng
        expandedOnForms.push(v);
      }
    }
  }

  const kun_words = [];
  const on_words = [];
  const the_other_words = [];

  for (const w of words) {
    for (const r of w.readings) {
      let classified = false;

      // 1. Kiểm tra On
      const idx = w.kanji.indexOf(targetKanji);
      for (const on of expandedOnForms) {
        if (r.includes(on)) {
          if (idx === 0 && r.startsWith(on)) {
            on_words.push({ kanji: w.kanji, reading: r });
            classified = true;
            break;
          } else if (idx === w.kanji.length - 1 && r.endsWith(on)) {
            on_words.push({ kanji: w.kanji, reading: r });
            classified = true;
            break;
          } else if (idx > 0 && idx < w.kanji.length - 1) { // targetKanji ở giữa
            on_words.push({ kanji: w.kanji, reading: r });
            classified = true;
            break;
          }
        }
      }
      if (classified) continue;

      // 2. Kiểm tra Kun
      for (const kun of kunForms) {
        if (!w.kanji.includes(kun.kanji)) 
          continue;

        if (r.includes(kun.reading)) {
          kun_words.push({ kanji: w.kanji, reading: r });
          classified = true;
          break;
        }

        if (kun.reading.startsWith("-") && r.endsWith(kun.reading.slice(1))) {
          kun_words.push({ kanji: w.kanji, reading: r });
          classified = true;
          break;
        }

        if (kun.reading.endsWith("-") && r.startsWith(kun.reading.slice(0, -1))) {
          kun_words.push({ kanji: w.kanji, reading: r });
          classified = true;
          break;
        }
      }
      if (classified) continue;

      // 3. Nếu không thuộc on/kun
      the_other_words.push({ kanji: w.kanji, reading: r });
    }
  }


  return { kun_words, on_words, the_other_words };
}

