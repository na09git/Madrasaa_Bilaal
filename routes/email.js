const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path')
const nodemailer = require('nodemailer');


// for contact receivingEmailAddress
const receivingEmailAddress = 'niletech1513@gmail.com';
// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'niletech1513@gmail.com', // Replace with your Gmail username
    pass: 'niletech0915137219?' // Replace with your Gmail password
  }
});

// POST endpoint for handling contact form submissions
router.post('/email', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Log the form data for debugging
  console.log('Received form submission:', { name, email, subject, message });


  // Email message configuration
  const mailOptions = {
    from: email,
    to: receivingEmailAddress,
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

module.exports = router