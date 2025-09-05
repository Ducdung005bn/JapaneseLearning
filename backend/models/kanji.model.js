import mongoose from 'mongoose';

const kanjiSchema = new mongoose.Schema({
  kanji: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
        validator: v => v.length === 1,
        message: props => `${props.value} is not a single kanji character`
    }
  },
  heisig_en: { type: String, required: true, unique: true },
  jlpt: {type: Number, enum: [1, 2, 3, 4, 5], default: null },
  grade: { type: Number, required: true, min: 1, max: 8 },
  kun_readings: [String],
  on_readings: [String],
  name_readings: [String],
  english_meanings: [String],
  strokes: { type: Number, required: true },
  d: { type: [String], required: true },
  children: [{
    part: { type: String },
    children: [],
    _id: false }],
  six_principles: { type: String },
  han_viet: [{
    reading: { type: String, required: true },
    reading_no_diacritics:  { type: String, required: true },
    common_meanings: [String],
    cited_meanings: [String],
    thieu_chuu_meanings: [String],
    tran_van_chanh_meanings: [String],
    nguyen_quoc_hung_meanings: [String],
    compounds: [String],
    _id: false
  }]
});

const Kanji = mongoose.model('Kanji', kanjiSchema);

export default Kanji;

