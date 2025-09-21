import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true },
  password: { 
    type: String, 
    required: true, 
    trim: true,
  }, 
  personalInformation: {
    name: { type: String, trim: true, required: true },
    picture: String,
    biography: { type: String, trim: true, maxlength: 300 },
    startDate: { type: Date, default: Date.now, required: true }
  },
  // tự học
  lessons: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    history: [{
      startedAt: Date,
      completedAt: Date,
      assignment: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answer: mongoose.Schema.Types.Mixed // String, Array, Object tùy loại question
      }],
      score: Number
    }]
  }],

  // tuỳ chọn: cài đặt thông báo
  notificationPrefs: {
    emailAnnouncements: { type: Boolean, default: true },
    emailAssignments:   { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true }
}, 
{ timestamps: true });

userSchema.index({ email: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
