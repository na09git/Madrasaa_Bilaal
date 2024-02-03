const express = require('express')
const router = express.Router()
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin } = require('../middleware/auth')

const News = require('../models/News')


// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadnews');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

// @desc    Show create page
// @route   GET /news/create
router.get('/create', ensureAuth, ensureAdmin, (req, res) => {
    res.render('news/create')
})


// @desc Process add News  form with image upload
// @route POST /news
router.post('/', ensureAuth, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        if (!file || file.length === 0) {
            const error = new Error('Please choose files');
            error.httpStatusCode = 400;
            throw error;
        }

        const img = fs.readFileSync(file.path);
        const encode_image = img.toString('base64');

        const newUpload = new News({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/news');
            console.log("New News with image/upload is Successfully  Broadcasted !");

        } catch (error) {
            if (error.name === 'MongoError' && error.code === 11000) {
                return res.status(400).json({ error: `Duplicate ${file.originalname}. File Already exists! ` });
            }
            return res.status(500).json({ error: error.message || `Cannot Upload ${file.originalname} Something Missing!` });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Internal Server Error' });
    }
});



// @desc    Show all news
// @route   GET /news
router.get('/', async (req, res) => {
    try {
        const news = await News.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean()

        res.render('news/index', {
            news,
        })
        console.log("News/index rendered");
        console.log("You can now see All News Here !");
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Show single news
// @route   GET /news/:id
router.get('/:id', async (req, res) => {
    try {
        let news = await News.findById(req.params.id)
            .populate('user')
            .lean()

        res.render('news/show', {
            news,
        })
        console.log("You can now see the news details");

    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc    Show edit page
// @route   GET /news/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const news = await News.findOne({ _id: req.params.id }).lean()

        if (!news) {
            return res.render('error/404')
        }

        if (news.user != req.user.id) {
            res.redirect('/news')
        } else {
            res.render('news/edit', {
                news,
            })
            console.log("You are in news edit page & can Edit this news");
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})



// @desc Show Update page
// @route POST /news/:id
router.post('/:id', ensureAuth, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        let news = await News.findById(req.params.id).lean();

        if (!news) {
            console.log('News not found');
            return res.render('error/404');
        }

        if (String(news.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/news');
        }

        const file = req.file;
        const existingImage = news.imageBase64;

        let updatedFields = req.body;

        if (file) {
            const img = fs.readFileSync(file.path);
            const encode_image = img.toString('base64');
            updatedFields = {
                ...updatedFields,
                contentType: file.mimetype,
                imageBase64: encode_image,
            };
        } else {
            updatedFields = {
                ...updatedFields,
                contentType: news.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        news = await News.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('News updated successfully');
        res.redirect('/news');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});




// @desc    Delete news
// @route   DELETE /news/:id
router.delete('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let news = await News.findById(req.params.id).lean()

        if (!news) {
            return res.render('error/404')
        }

        if (news.user != req.user.id) {
            res.redirect('/newspage')
        } else {
            await News.deleteOne({ _id: req.params.id })
            res.redirect('/newspage')
        }
        console.log("News Deleted Successfully !");

    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    User news
// @route   GET /news/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const news = await News.find({ user: req.params.userId, })
            .populate('user')
            .lean()

        res.render('news/index', {
            news,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Search news by title
//@route GET /news/search/:query
router.get('/search/:query', async (req, res) => {
    try {
        const news = await News.find({ title: new RegExp(req.query.query, 'i'), })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('news/index', {
            news,
        })
        console.log("Search is working !");
    } catch (err) {
        console.log(err)
        res.render('error/404')
    }
})


module.exports = router
