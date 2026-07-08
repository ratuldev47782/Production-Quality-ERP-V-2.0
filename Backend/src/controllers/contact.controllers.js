const Contact = require('../models/contact.model');

const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // MongoDB তে save করো
    const newContact = await Contact.create({ name, email, message });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newContact,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { submitContact };