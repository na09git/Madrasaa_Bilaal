const express = require('express')
const passport = require('passport')
const router = express.Router()

// @route   GET /privacy
router.get('/', (req, res) => {
    try {
        res.render('privacy/index')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router