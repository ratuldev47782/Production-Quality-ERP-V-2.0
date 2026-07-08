const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get current user route
router.get('/me', authController.getCurrentUser);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;