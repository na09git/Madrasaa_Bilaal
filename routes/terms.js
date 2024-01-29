const express = require('express')
const passport = require('passport')
const router = express.Router()

// @route   GET /contact
router.get('/terms', (req, res) => {
    try {
        res.render('terms')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router