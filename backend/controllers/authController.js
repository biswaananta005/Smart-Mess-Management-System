const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smart_mess_jwt_secret_key_2026_biswa_ananta', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, roomNumber, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
        data: null
      });
    }

    if (role === 'student' && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required for student registration',
        data: null
      });
    }

    if (rollNumber) {
      const rollExists = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'Roll number is already registered',
          data: null
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      rollNumber: rollNumber ? rollNumber.toUpperCase() : undefined,
      roomNumber,
      department
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        roomNumber: user.roomNumber,
        department: user.department,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginInput = identifier || email;

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email / Student ID and Password',
        data: null
      });
    }

    const cleanInput = loginInput.trim();
    // Search user by email (case-insensitive) OR student roll number (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: cleanInput.toLowerCase() },
        { rollNumber: cleanInput.toUpperCase() }
      ]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email/Student ID or Password',
        data: null
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        roomNumber: user.roomNumber,
        department: user.department,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = { registerUser, loginUser, getMe };
