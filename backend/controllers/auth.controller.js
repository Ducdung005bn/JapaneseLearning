import mongoose from 'mongoose';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendVerificationEmail } from '../utils/send-email.js';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

// Initialize Redis client from REDIS_URL if provided. Otherwise use an in-memory fallback.
let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  // simple in-memory store with EX support (seconds)
  const store = new Map();
  redis = {
    set: async (key, value, mode, seconds) => {
      store.set(key, String(value));
      if (mode === 'EX' && typeof seconds === 'number') {
        setTimeout(() => store.delete(key), seconds * 1000);
      }
      return 'OK';
    },
    get: async (key) => {
      return store.has(key) ? store.get(key) : null;
    }
  };
}

const saveCode = async (email, code) => {
    await redis.set(`verify:${email}`, code, 'EX', 60); // 1 phút
};

const checkCode = async (email, code) => {
    const savedCode = await redis.get(`verify:${email}`);
    return savedCode === code;
};

export const sendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: 'Invalid email' });

        const existingUser = await User.findOne({ email });
        if (existingUser) 
            return res.status(400).json({ message: 'Email already registered' });

        const code = Math.floor(100000 + Math.random() * 900000); // 6 chữ số
        
        // Lưu code vào Redis
        await saveCode(email, code);

        await sendVerificationEmail(email, code);

        res.json({ message: 'Verification code sent' });
    } catch (error) {
        next(error);
    }
}

export const verifyCode = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const isValid = await checkCode(email, code);
        if (!isValid) return res.status(400).json({ message: 'Invalid or expired code' });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

// thư mục lưu avatar
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // tối đa 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpg, .jpeg, .png, .webp formats are allowed"));
    }
    cb(null, true);
  },
}).single("avatar"); // name phải trùng với formData.append("avatar", file)


export const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, fullName, gender, dateOfBirth, jlptLevel, biography } = req.body;

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }

    if (!fullName || fullName.trim() === '') {
      throw new Error('fullName is required and must be a non-empty string');
    }

    if (!['male','female','other'].includes(gender)) {
      throw new Error('gender must be one of "male", "female", "other"');
    }

    if (isNaN(new Date(dateOfBirth).getTime())) {
      throw new Error('dateOfBirth must be a valid date');
    }

    if (![0,1,2,3,4,5].includes(Number(jlptLevel))) {
      throw new Error('jlptLevel must be a number between 0 and 5');
    }

    // nếu có upload ảnh
    let avatarPath = null;
    if (req.file) {
      avatarPath = "/uploads/avatars/" + req.file.filename;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const personalInformation = {
      fullName,
      gender,
      dateOfBirth,
      jlptLevel,
      biography: biography || "",
      avatar: avatarPath,
    };

    const user = new User({ email, password: hashedPassword, personalInformation });
    await user.save({ session });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'User created successfully', user, token });

  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error('Abort failed:', abortErr);
    }
    session.endSession();
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: 'Invalid email' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Email not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    next(error);
  }
};


export const logout = async (req, res, next) => {
    
};