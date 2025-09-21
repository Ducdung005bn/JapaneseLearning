import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.development.local' });
import authRoutes from './routes/auth.routes.js';
import vocabularyRoutes from './routes/vocabulary.routes.js';
import kanjiRoutes from './routes/kanji.routes.js';
import userRoutes from './routes/user.routes.js';
import lessonRoutes from  './routes/lesson.routes.js';
import { connectDB } from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import {importKanji} from './database/import-kanji.js';
import {importVocabulary} from './database/import-vocabulary.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
// app.use(arcjetMiddleware);
app.use(cors());

app.use('/auth', authRoutes);
app.use('/vocabulary', vocabularyRoutes);
app.use('/kanji', kanjiRoutes);
app.use('/user', userRoutes);
app.use('/lesson', lessonRoutes);


app.use(errorMiddleware);

app.listen(process.env.PORT, async () => {
  console.log(`API is running on http://localhost:${process.env.PORT}`);

  await connectDB(); //session commitTransaction() vào DB đang chạy
  //await importKanji();
  //await importVocabulary();
  
});