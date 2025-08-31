import mongoose from 'mongoose';
import crypto from 'crypto';

const lessonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, trim: true, maxlength: 300 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  shuffleQuestions: { type: Boolean, default: false },
  history: [{   
    startedAt: Date,
    completedAt: Date,
    answers: [], //lesson được lấy hết theo id của question tại startedAt
    score: Number
    //vấn đề đang làm thì dừng lần sau làm tiếp: completedAt: null, answers của câu nào chưa trả lời thì là null
    //khi thêm, xóa, sửa, tạo ra question mới, để không ảnh hưởng câu hỏi được lưu trong history
  }]
}, { timestamps: true });

// Index để tìm kiếm theo tên
lessonSchema.index({ name: 'text' });

// Middleware tự động sinh code và đảm bảo không trùng
lessonSchema.pre('validate', async function(next) {
  if (this.code) return next(); // đã có code thì không sinh

  const Lesson = mongoose.model('Lesson'); // để gọi model
  let unique = false;
  let newCode;

  while (!unique) {
    // tạo 6 ký tự ngẫu nhiên chữ + số, thêm 'L' ở đầu
    newCode = 'L' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const existing = await Lesson.findOne({ code: newCode });
    if (!existing) unique = true;
  }

  this.code = newCode;
  next();
});

const lessonForClassSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true }, // lesson gốc
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
  startDate: Date,       // ngày mở bài
  endDate: Date,         // ngày kết thúc bài
  maxAttempts: { type: Number, default: 1 }, // số lần làm tối đa
}, { timestamps: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);
export const LessonForClass = mongoose.model('LessonForClass', lessonForClassSchema);
