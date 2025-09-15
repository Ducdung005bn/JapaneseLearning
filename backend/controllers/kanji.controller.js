import Kanji from '../models/kanji.model.js';
import Vocabulary from '../models/vocabulary.model.js';
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
    console.log("hello");
    const kanji = await Kanji.findOne({ kanji: req.params.character });
    if (!kanji) return res.status(404).json({ error: 'Kanji not found' });

    // 1. Lọc từ vựng chứa chữ kanji và common=true
    const vocabularyList = await Vocabulary.find(
      { 'kanji.text': { $regex: kanji.kanji } }
    );

    // For example: //{ kanji: '架空', readings: [ 'かくう', 'がくう' ] }
    const words = mapKanaPerMatchedKanji(vocabularyList, kanji.kanji);

    const kanji_words = classifyWords(words, kanji.kanji, kanji.kun_readings, kanji.on_readings);

    let filter = {};
    filter['children.part'] = kanji.kanji;
    const radicalKanjis = await Kanji.find(filter).select("kanji -_id");

    res.json({kanji, kanji_words, radicalKanjis});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const filterKanji = async (req, res) => {
  try {
    const { kanji, han_viet, children, on_readings, kun_readings } = req.query;

    // Tạo filter trống
    let filter = {};

    if (kanji) {
      filter.kanji = { $regex: kanji, $options: 'i' };
    }

    // Tìm theo Hán-Việt / Heisig
    if (han_viet) {
      const regex = { $regex: han_viet, $options: 'i' };
      filter.$or = [
        { 'han_viet.reading': regex },
        { 'han_viet.reading_no_diacritics': regex },
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
    const results = await Kanji.find(filter).select("kanji han_viet.reading heisig_en on_readings kun_readings -_id");

    if (results.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
  function expand(word) {
    const first = word[0]; // ký tự đầu
    const rest = word.slice(1); // phần còn lại
    const results = [word];

    if (dakutenMap[first]) results.push(dakutenMap[first] + rest);
    if (handakutenMap[first]) results.push(handakutenMap[first] + rest);

    return results;
  }

  // Biến onForms sang expandedOnForms
  const expandedOnForms = [];
  for (const on of onForms) {
    const variants = expand(on);
    for (const v of variants) {
      if (!expandedOnForms.includes(v)) { // tránh trùng
        expandedOnForms.push(v);
      }
    }
  }

  const expandedKunForms = [];
  for (const kun of kunForms) {
    const variants = expand(kun.reading);
    for (const v of variants) {
      const k = {kanji: kun.kanji, reading: v};
      if (!expandedKunForms.some(item => item.kanji === k.kanji && item.reading === k.reading)) {
        expandedKunForms.push(k);
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
      for (const kun of expandedKunForms) {
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



