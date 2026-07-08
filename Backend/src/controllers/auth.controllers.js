const User = require('../models/user.model');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, password, factory, floor, role } = req.body;

    // Validate required fields
    if (!username || !password || !factory || !floor || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Create new user (password stored as plain text as requested)
    const user = await User.create({
      username,
      password,
      factory,
      floor,
      role,
    });

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      username: user.username,
      factory: user.factory,
      floor: user.floor,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Check password (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      username: user.username,
      factory: user.factory,
      floor: user.floor,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        factory: user.factory,
        floor: user.floor,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Logout (client-side will clear localStorage)
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};