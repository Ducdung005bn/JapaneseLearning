import express from 'express';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

import authRoutes from './routes/auth.routes.js';
import vocabularyRoutes from './routes/vocabulary.routes.js';
import kanjiRoutes from './routes/kanji.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use('/auth', authRoutes);
app.use('/vocabulary', vocabularyRoutes);
app.use('/kanji', kanjiRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(process.env.PORT, () => {
  console.log(`API is running on http://localhost:${process.env.PORT}`);
});
