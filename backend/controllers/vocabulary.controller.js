import Vocabulary from '../models/vocabulary.model.js';
import wanakana from 'wanakana';
import * as JConjugator from "@surreptus/japanese-conjugator";

const { inflect, Inflection } = JConjugator;


export const getVocabularyDetail = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOne({ _id: req.params.vocabularyId });
    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    let conjugations = null;

    // Kiểm tra xem từ này có phải động từ không (dựa vào partOfSpeech)
    const isVerb = vocabulary.sense[0].partOfSpeech[0].startsWith('v');

    if (isVerb) {
      // Lấy từ gốc (ưu tiên kanji, fallback kana)
      const baseForm = vocabulary.kanji[0]?.text || vocabulary.kana[0]?.text;

      // Hàm an toàn: nếu lỗi thì trả về baseForm
      const safeInflect = (form) => {
        try {
          return inflect(baseForm, form);
        } catch (e) {
          return null; // lỗi → bỏ qua
        }
      };

      // Thử chia các dạng
      conjugations = {
        dictionary: safeInflect(Inflection.NonPast),
        polite: safeInflect(Inflection.NonPastPolite),
        past: safeInflect(Inflection.Past),
        pastPolite: safeInflect(Inflection.PastPolite),
        teForm: safeInflect(Inflection.Te),
        potential: safeInflect(Inflection.Potential),
        passive: safeInflect(Inflection.Passive),
        causative: safeInflect(Inflection.Causative),
        causativePassive: safeInflect(Inflection.CausativePassive),
        imperative: safeInflect(Inflection.Imperative)
      };

      // Nếu tất cả đều null → coi như không chia được → trả null
      if (Object.values(conjugations).every(v => v === null)) {
        conjugations = null;
      }
    }

    res.json({
      ...vocabulary.toObject(),
      conjugations
    });

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



function findAndReplaceWord(example, searchForms, kanaForms) {
  let foundText = null;

  for (const form of searchForms) {
    if (form && example.jp.includes(form)) {
      foundText = form;
      break;
    }
  }

  // Nếu chưa tìm thấy → fallback qua kana
  if (!foundText) {
    for (const k of kanaForms) {
      if (k.text && example.jp.includes(k.text)) {
        foundText = k.text;
        break;
      }
    }
  }

  if (!foundText) return null;

  const content = example.jp.replace(foundText, " ________ ") + ` (${example.en[0]})`;
  return { content, foundText };
}

function findWordInExample(example, searchForms, kanaForms) {
  // Tìm theo kanji / base forms
  for (const form of searchForms) {
    if (form && example.jp.includes(form)) {
      return form;
    }
  }

  // Nếu chưa tìm thấy, fallback qua kana
  for (const k of kanaForms) {
    if (k.text && example.jp.includes(k.text)) {
      return k.text;
    }
  }

  // Không tìm thấy
  return null;
}


/** helper: generate conjugations in fixed order (may return null for unsupported forms) */
function generateConjugations(verb) {
  const forms = [
    Inflection.NonPast,       // 辞書形 (base/dictionary)
    Inflection.NonPastPolite, // ます形
    Inflection.Past,          // た形
    Inflection.PastPolite,    // ました
    Inflection.Te,            // て形
    Inflection.Potential,     // 可能形
    Inflection.Passive,       // 受身形
    Inflection.Causative,     // 使役形
    Inflection.CausativePassive,
    Inflection.Imperative
  ];

  return forms.map(f => {
    try { return inflect(verb, f); }
    catch (e) { return null; }
  });
}

export const recommendQuiz = async (req, res) => {
  try {
    const { type } = req.params;
    const vocabulary = await Vocabulary.findOne(
      { _id: req.params.vocabularyId },
      "kanji kana sense examples"
    ).lean();
    if (!vocabulary) return res.status(404).json({ error: "Vocabulary not found" });

    // --- root POS (chỉ lấy partOfSpeech đầu tiên của sense đầu tiên) ---
    const rootFirstPOS = vocabulary.sense?.[0]?.partOfSpeech?.[0] || null;
    const isVerb = !!(rootFirstPOS && rootFirstPOS.startsWith("v"));

    // --- build searchForms (kanji base + conjugations nếu là verb) ---
    let searchForms = (vocabulary.kanji || []).map(k => k.text).filter(Boolean);
    if (isVerb) {
      const rootBase = vocabulary.kanji?.[0]?.text || vocabulary.kana?.[0]?.text;
      if (rootBase) {
        const rootConjs = generateConjugations(rootBase);
        // thêm tất cả dạng (loại null)
        searchForms = searchForms.concat(rootConjs.filter(Boolean));
      }
    }

    // ====== chuẩn bị distractor base pool (chỉ base forms) ======
    let distractorBasePool = [];
    if (type === "multiple-choice") {
      const filtered = await Vocabulary.aggregate([
        { $match: {
            _id: { $ne: vocabulary._id },
            "sense.0.partOfSpeech.0": rootFirstPOS
        }},
        { $sample: { size: 3 } }, // random 3 từ ngay trong DB
        { $project: { kanji: 1, kana: 1 } }
      ]);
      
      let basePool = [];
      for (const v of filtered) {
        if (v.kanji?.[0]?.text) basePool.push(v.kanji[0].text);
        else if (v.kana?.[0]?.text) basePool.push(v.kana[0].text);
      }

      distractorBasePool = basePool.filter(word => !searchForms.includes(word));
    }

    if (type === "match") {
      // Match: lấy hết examples, trả về leftItems = jp, rightItems = en
      const leftItems = [];
      const rightItems = [];

      (vocabulary.examples || []).forEach(ex => {
        const matchedForm = findWordInExample(ex, searchForms, vocabulary.kana);
        if (matchedForm && ex.jp && ex.en) {
          leftItems.push(ex.jp);
          rightItems.push(ex.en[0]);
        }
      });

      // shuffle right items
      const shuffledRightItems = rightItems.slice().sort(() => Math.random() - 0.5);

      return res.json({
        questions: [{
          type,
          content: "Match the Japanese sentences with their English meanings:",
          leftItems,
          rightItems,
          shuffledRightItems
        }]
      });

    }


    // ====== Sinh câu hỏi (per-example) ======
    const results = (vocabulary.examples || []).map(example => {
      const match = findAndReplaceWord(example, searchForms, vocabulary.kana);
      if (!match) return null;

      if (type === "fill-in" || type === "flashcard") {
        return {
          type,
          content: match.content,
          correctAnswers: [match.foundText],
        };
      }

      if (type === "multiple-choice") {
        // For each example, if verb -> compute matchedIndex on root conjugations
        let finalDistractors = [];
        if (isVerb && distractorBasePool.length > 0) {
          const rootBase = vocabulary.kanji?.[0]?.text || vocabulary.kana?.[0]?.text;
          const rootConjs = rootBase ? generateConjugations(rootBase) : [];
          // matchedForm is the exact string that matched in this example
          const matchedForm = match.foundText;
          // find index in rootConjs that equals matchedForm
          const matchedIndex = rootConjs.findIndex(x => x === matchedForm);

          // For each base distractor, conjugate to matchedIndex if available
          finalDistractors = distractorBasePool.slice() // copy
            .map(base => {
              if (matchedIndex >= 0) {
                const forms = generateConjugations(base);
                return forms[matchedIndex] || base; // fallback to base if cannot conjugate
              }
              return base;
            });
        } else {
          finalDistractors = distractorBasePool.slice();
        }

        // pick up to 3 random distractors
        const chosen = finalDistractors.sort(() => Math.random() - 0.5).slice(0, 3);

        const answers = [
          { answer: match.foundText, isCorrect: true },
          ...chosen.map(d => ({ answer: d, isCorrect: false })),
        ];

        // Shuffle answers
        answers.sort(() => Math.random() - 0.5);

        return {
          type,
          content: match.content,
          answers,
        };
      }

      return null;
    }).filter(Boolean);

    res.json({ questions: results });

  } catch (err) {
    console.error("recommendQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

