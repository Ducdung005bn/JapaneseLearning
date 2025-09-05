import mongoose from 'mongoose';
import { connectDB } from './mongodb.js';
import Kanji from '../models/kanji.model.js';
import fs from 'fs';
import path from 'path';


export const importKanji = async () => {
  await connectDB();

  const data = JSON.parse(fs.readFileSync(path.resolve('../data/combined_data.json'), 'utf-8'));

  const preparedData = data.map(kanji => {
    if (kanji.han_viet && kanji.han_viet.length > 0) {
      kanji.han_viet = kanji.han_viet.map(hv => ({
        ...hv,
        reading_no_diacritics: hv.reading_no_diacritics
          ? hv.reading_no_diacritics
          : hv.reading.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }));
    }
    return kanji;
  });

  try {
    await Kanji.insertMany(preparedData, { ordered: false });
    console.log('Import completed!');
  } catch (err) {
    console.error('Import error:', err);
  }


  mongoose.disconnect();
};