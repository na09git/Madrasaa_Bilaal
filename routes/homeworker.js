const express = require('express')
const passport = require('passport')
const { ensureAdminOrWorker } = require('../middleware/auth')
const router = express.Router()


// @route   GET /home
router.get('/homeworker', ensureAdminOrWorker, (req, res) => {
  try {

    const user = req.user;

    res.render('homeworker', {
      layout: false,
      user: req.user, // Pass the user to the template
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



module.exports = router