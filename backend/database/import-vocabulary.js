import mongoose from 'mongoose';
import { connectDB } from './mongodb.js';
import Vocabulary from '../models/vocabulary.model.js';
import fs from 'fs';
import path from 'path';

export const importVocabulary = async () => {
  await connectDB();

  const dataPath = path.resolve('../data/jmdict-with-examples.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  try {
    await Vocabulary.insertMany(data.words, { ordered: false }); // <-- Lấy từ data.words
    console.log('Import completed!');
  } catch (err) {
    console.error('Import error:', err);
  }

  mongoose.disconnect();
};
