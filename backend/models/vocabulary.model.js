import mongoose from 'mongoose';

const { Schema } = mongoose;

// Gloss item: ví dụ { lang: "eng", type: null, text: "to run around" }
const glossSchema = new Schema({
  lang: { type: String, required: true }, 
  type: { type: String, default: null },
  text: { type: String, required: true }
}, { _id: false });

// Kanji form: { common: true, text: "走り回る", tags: [] }
const kanjiFormSchema = new Schema({
  common: { type: Boolean, default: false },
  text: { type: String },
  tags: { type: [String], default: [] }
}, { _id: false });

// Kana form: { common: true, text: "はしりまわる", tags: [], appliesToKanji: ["*"] }
const kanaFormSchema = new Schema({
  common: { type: Boolean, default: false },
  text: { type: String, required: true },
  tags: { type: [String], default: [] },
  appliesToKanji: { type: [String], default: ["*"] }
}, { _id: false });

// Sense schema: contains arrays and metadata
const senseSchema = new Schema({
  partOfSpeech: { type: [String], default: [] },     // e.g. ["v1","vi"]
  appliesToKanji: { type: [String], default: ["*"] },
  appliesToKana: { type: [String], default: ["*"] },
  related: { type: [[String]], default: [] },        // array of arrays (as in JMDict)
  antonym: { type: [String], default: [] },
  field: { type: [String], default: [] },
  dialect: { type: [String], default: [] },
  misc: { type: [String], default: [] },
  info: { type: [String], default: [] },
  languageSource: { type: [String], default: [] },
  gloss: { type: [glossSchema], default: [] }
}, { _id: false });

/**
 * Main entry schema
 */
const vocabularySchema = new Schema({
  id: { type: String, required: true, unique: true }, // id từ nguồn (string)
  kanji: { type: [kanjiFormSchema], default: [] },
  kana: { type: [kanaFormSchema], default: [] },
  sense: { type: [senseSchema], default: [] },
});

vocabularySchema.index({ 'kanji.text': 1 });

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);
export default Vocabulary;
