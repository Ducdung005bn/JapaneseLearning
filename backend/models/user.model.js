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
    fullName: { type: String, trim: true, required: true },
    avatar: String,
    biography: { type: String, trim: true, maxlength: 300 },
    gender: { type: String, enum: ['male', 'female', 'other'],required: true },
    dateOfBirth: { type: Date, required: true },
    jlptLevel: { type: Number, enum: [1, 2, 3, 4, 5, 0], required: true },
    startDate: { type: Date, default: Date.now, required: true }
  },
  // tự học
  selfStudyLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
  classes: [{
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    role: { type: String, enum: ['teacher','student'], required: true }
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

export default mongoose.model('User', userSchema);
