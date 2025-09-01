import mongoose from 'mongoose';
import { connectDB } from './mongodb.js';
import Kanji from '../models/kanji.model.js';
import fs from 'fs';
import path from 'path';


export const importKanji = async () => {
  await connectDB();

  const data = JSON.parse(fs.readFileSync(path.resolve('../data/combined_data.json'), 'utf-8'));
  try {
    await Kanji.insertMany(data, { ordered: false });
    console.log('Import completed!');
  } catch (err) {
    console.error('Import error:', err);
  }

  mongoose.disconnect();
};