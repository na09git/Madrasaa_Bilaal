const express = require('express')
const passport = require('passport')
const router = express.Router()
const path = require('path')
const nodemailer = require('nodemailer');


const Email = require('../models/Email')


// @route   GET contact
router.get('/', (req, res) => {
    try {
        res.render('contact/index')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})



// for contact receivingEmailAddress
const receivingEmailAddress = 'niletech1513@gmail.com';
// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// POST endpoint for handling contact form submissions
router.post('/', (req, res) => {
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