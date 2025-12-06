const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });

    const token = generateToken(user._id);
    res.status(201).json({ _id: user._id, email: user.email, token });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and if the password matches
    if (user && (await user.matchPassword(password))) {
      // Generate a token if credentials are valid
      const token = generateToken(user._id);
      
      // Send response with user details and token
      return res.status(200).json({
        _id: user._id,
        email: user.email,
        token,
      });
    }

    // If credentials are invalid, send error response
    return res.status(400).json({ message: 'Invalid email or password' });
  } catch (error) {
    // Handle unexpected errors
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Error logging in' });
  }
};
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, loginUser };
