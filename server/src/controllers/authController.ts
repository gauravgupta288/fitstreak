import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';
import { isStreakBroken, getSystemDateString } from '../utils/date';

const JWT_SECRET = process.env.JWT_SECRET || 'fitstreak_secret_key_12345';

// Generate Token helper
const generateToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please add all fields' });
      return;
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: '',
      xp: 0,
      level: 1,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastWorkoutDate: user.lastWorkoutDate,
        xp: user.xp,
        level: user.level,
        token: generateToken(user._id.toString(), user.email),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please include email and password' });
      return;
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check and update streak if broken
    const clientDate = (req.headers['x-client-date'] as string) || getSystemDateString();
    if (user.lastWorkoutDate && isStreakBroken(clientDate, user.lastWorkoutDate)) {
      user.currentStreak = 0;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastWorkoutDate: user.lastWorkoutDate,
      xp: user.xp,
      level: user.level,
      token: generateToken(user._id.toString(), user.email),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if streak was broken since last login
    const clientDate = (req.headers['x-client-date'] as string) || getSystemDateString();
    if (user.lastWorkoutDate && isStreakBroken(clientDate, user.lastWorkoutDate)) {
      user.currentStreak = 0;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update user profile details (height, weight, name)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, height, weight } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (height !== undefined) user.height = height === null || height === '' ? undefined : Number(height);
    if (weight !== undefined) user.weight = weight === null || weight === '' ? undefined : Number(weight);

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
