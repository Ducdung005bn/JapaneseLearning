import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 300 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  parentQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParentQuestion' }],
  shuffleQuestions: { type: Boolean, default: false }
}, { timestamps: true });

// Index để tìm kiếm theo tên
lessonSchema.index({ name: 'text' });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;

