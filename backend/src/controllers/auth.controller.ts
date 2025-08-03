import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt'; // Import bcrypt for hashing

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new user with a hardcoded role of 'student'.
    const newUser = await User.create({
      name,
      email,
      passwordHash, // Use passwordHash instead of password
      role: 'student',
    });

    // Don't send password hash in response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    res.status(201).json({ message: 'User registered successfully as a student.', user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};