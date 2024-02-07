const express = require('express')
const passport = require('passport')
const router = express.Router()

const User = require('../models/User')

// @route   GET /home
router.get('/home', (req, res) => {
  try {
    const user = req.user;
    console.log('User:', req.user);
    res.render('home/index', {
      user: req.user, // Pass the user to the template
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @route   GET /home
router.get('/', (req, res) => {
  try {
    res.render('home/index')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = router