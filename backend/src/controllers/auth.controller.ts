
import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';
if (JWT_SECRET === 'your_default_jwt_secret') {
  console.warn('Warning: Using default JWT secret. Please set a JWT_SECRET environment variable.');
}

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, studentId } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  if (role === 'student' && !studentId) {
    return res.status(400).json({ message: 'Student ID is required for student role.' });
  }

  try {
    // Check if user or studentId already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    if (role === 'student') {
        const existingStudentId = await User.findOne({ where: { studentId } });
        if (existingStudentId) {
            return res.status(400).json({ message: 'This Student ID is already registered.' });
        }
    }

    // Hash the password is now handled by the model hook, but we pass the plain password
    const newUser = await User.create({
      name,
      email,
      password, // Pass plain password to be hashed by hook
      role,
      studentId: role === 'student' ? studentId : null,
    });

    // Don't send password hash in response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
    };

    res.status(201).json({ message: 'User registered successfully.', user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};


export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // User is authenticated, create a token
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Send token and user info back
        res.status(200).json({
            message: "Logged in successfully.",
            token,
            user: payload
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};
