const express = require('express')
const passport = require('passport')
const router = express.Router()
const path = require('path')
const nodemailer = require('nodemailer');

// @route   GET contact
router.get('/', (req, res) => {
    try {
        res.render('success/index')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router