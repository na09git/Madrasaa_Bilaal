const express = require('express')
const { ensureAuth, ensureAdminOrWorker } = require('../middleware/auth')
const mongoose = require('mongoose');
const router = express.Router()

const Problem = require('../models/Problem')

// @desc    Show addproblem page
// @route   GET /problem/addproblem
router.get('/addproblem', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('problem/addproblem', { title: "Problem Page" })
})


// @desc    Process add problem form
// @route   POST /problems
router.post('/', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        console.log('Received data:', req.body);

        req.body.user = req.user.id;
        await Problem.create(req.body);
        res.redirect('/problems');
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }

});


// @desc    Show all problem
// @route   GET /problem
router.get('/', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const problem = await Problem.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean()

        res.render('problem/index', {
            problem,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Show single problem
// @route   GET /problem/:id
router.get('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let problem = await Problem.findById(req.params.id)
            .populate('user')
            .lean()

        if (!problem) {
            return res.render('error/404')
        } else {
            res.render('problem/show', {
                problem,
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})


// @desc    Show edit page
// @route   GET /problem/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const problem = await Problem.findOne({
            _id: req.params.id,
        }).lean()

        if (!problem) {
            return res.render('error/404')
        } else {
            res.render('problem/edit', {
                problem,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    Update problem
// @route   PUT /problem/:id
router.post('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let problem = await Problem.findById(req.params.id).lean()

        if (!problem) {
            return res.render('error/404')
        }

        if (problem.user != req.user.id) {
            res.redirect('/problems')
        } else {
            problem = await Problem.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/problems')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    Delete problem
// @route   DELETE /problem/:id
router.delete('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let problem = await Problem.findById(req.params.id).lean();

        if (!problem) {
            return res.render('error/404');
        }

        if (problem.user != req.user.id) {
            res.redirect('/problem');
        } else {
            await Problem.deleteOne({ _id: req.params.id });
            res.redirect('/problems');
        }
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});

// @desc    User problem
// @route   GET /problem/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const problem = await Problem.find({
            user: req.params.userId,
            case: 'Normal',
        })
            .populate('user')
            .lean();

        res.render('problem/index', { problem });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

//@desc Search problem by title
//@route GET /problem/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const problem = await Problem.find({ name: new RegExp(req.params.query, 'i'), case: 'Normal' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('problem/index', { problem });
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});

module.exports = router;
