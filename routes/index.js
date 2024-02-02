const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const User = require('../models/User')

const Story = require('../models/Story')
const News = require('../models/News')
const Student = require('../models/Student')
const Problem = require('../models/Problem')
const Worker = require('../models/Worker')



// @desc    Login/Landing page
// @route   GET /login
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})


// @desc    home
// @route   GET /home
router.get('/home', ensureAuth, async (req, res) => {
  try {
    res.render('home')
    console.log("You are in home Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    homeadmin
// @route   GET /homeadmin
router.get('/homeadmin', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    res.render('homeadmin')
    console.log("You are in homeAdmin Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    homeworker
// @route   GET /homeworker
router.get('/homeworker', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    res.render('homeworker')
    console.log("You are in homeWorker Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    stories
// @route   GET /stories
router.get('/stories', ensureAuth, async (req, res) => {
  try {
    const story = await Story.find({ user: req.user.id }).lean()
    res.render('stories', {
      name: req.user.firstName,
      story,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    News
// @route   GET /news
router.get('/newspage', ensureAuth, async (req, res) => {
  try {
    const news = await News.find({ user: req.user.id }).lean()
    res.render('newspage', {
      name: req.user.firstName,
      news,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    Student
// @route   GET /student
router.get('/students', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const student = await Student.find({ user: req.user.id }).lean()
    res.render('students', {
      name: req.user.firstName,
      student,
    })
    console.log("Dear Admin, You can see all Student here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    Worker
// @route   GET /worker
router.get('/workers', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const worker = await Worker.find({ user: req.user.id }).lean()
    res.render('workers', {
      name: req.user.firstName,
      worker,
    })
    console.log("Dear Admin, You can see all Worker here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    Problem
// @route   GET /problem
router.get('/problems', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    const problem = await Problem.find({ user: req.user.id }).lean()
    res.render('problems', {
      name: req.user.firstName,
      problem,
    })
    console.log("Dear Admin, You can see all Student Problem here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    works
// @route   GET /work
router.get('/works', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    const works = await Works.find({ user: req.user.id }).lean()
    res.render('works', {
      name: req.user.firstName,
      problem,
    })
    console.log("Dear Admin, You can see all Student Problem here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



module.exports = router