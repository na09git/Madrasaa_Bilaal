const express = require('express')
const passport = require('passport')
const router = express.Router()

// @route   GET /amirdetail
router.get('/', (req, res) => {
    try {
        res.render('vission-and-mission/index')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router