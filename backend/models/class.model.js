import mongoose from 'mongoose';
import crypto from 'crypto';

const classSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 300 },
  settings: {
    allowSelfJoin: { type: Boolean, default: false },
    requireApprovalOnJoin: { type: Boolean, default: true }
  },
  pendingJoinRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, default: Date.now },
    message: String
  }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  announcements: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    attachments: [String]
  }]
}, { timestamps: true });

// Index để tìm kiếm theo tên
classSchema.index({ name: 'text' });

// Middleware tự động sinh code và đảm bảo không trùng
classSchema.pre('validate', async function(next) {
  if (this.code) return next(); // đã có code thì không sinh

  const Class = mongoose.model('Class'); // để gọi model
  let unique = false;
  let newCode;

  while (!unique) {
    // tạo 6 ký tự ngẫu nhiên chữ + số, thêm 'C' ở đầu
    newCode = 'C' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const existing = await Class.findOne({ code: newCode });
    if (!existing) unique = true;
  }

  this.code = newCode;
  next();
});

export default mongoose.model('Class', classSchema);
