import mongoose from 'mongoose';
import crypto from 'crypto';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fill-in', 'flashcard', 'multiple-choice', 'match', 'drag-drop'],
    required: true
  },
  previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // version trước đó nếu đây là bản chỉnh sửa
  content: { type: String, required: true }, // nội dung câu hỏi
  
  // fill-in and flashcard
  correctAnswers: [String], 

  // multiple-choice
  answers: [{ 
    _id: false,          
    answer: String,         
    isCorrect: Boolean     
  }],

  // match
  leftItems: [String],
  rightItems: [String],  

  // drag-drop
  dragItems: [String],    // các item để kéo, theo thứ tự đáp án đúng
  distractors: [String],  // câu trả lời gây nhiễu

  // other information
  explanation: String,
  timeLimit: { type: Number, default: 30 }, // giây
  points: { type: Number, default: 1 },
}, { timestamps: true });

const parentQuestionSchema = new mongoose.Schema({
  previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'parentQuestion' }, // version trước đó nếu đây là bản chỉnh sửa
  content: [ {
      _id: false,
      text: { type: String, required: true },  // nội dung hiện tại
      version: { type: Date, default: Date.now } // ngày cập nhật cuối
    } ],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

// Index để tìm kiếm theo nội dung
questionSchema.index({ content: 'text' });

export const Question = mongoose.model('Question', questionSchema);
export const ParentQuestion = mongoose.model('ParentQuestion', parentQuestionSchema);
