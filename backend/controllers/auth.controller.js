import mongoose from 'mongoose';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/send-email.js';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });


const redis = new Redis();

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

export const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, personalInformation } = req.body;

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }

    if (personalInformation['fullName'].trim() === '') {
        throw new Error('fullName is required and must be a non-empty string');
    }

    if (!['male','female','other'].includes(personalInformation['gender'])) {
        throw new Error('gender must be one of "male", "female", "other"');
    }

    if (isNaN(new Date(personalInformation['dateOfBirth']).getTime())) {
        throw new Error('dateOfBirth must be a valid date');
    }

    if (![0,1,2,3,4,5].includes(Number(personalInformation['jlptLevel']))) {
        throw new Error('jlptLevel must be a number between 0 and 5');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, personalInformation });
    await user.save({ session });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

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