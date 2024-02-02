const express = require('express')
const router = express.Router()
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin } = require('../middleware/auth')

const Works = require('../models/Works')


// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadsworks');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

// @desc    Show create page
// @route   GET /works/create
router.get('/create', ensureAuth, ensureAdmin, (req, res) => {
    res.render('works/create')
})


// @desc Process add works  form with image upload
// @route POST /works
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

        const newUpload = new Works({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/works');
            console.log("New Works with image/upload is Successfully  Broadcasted !");

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



// @desc    Show all works
// @route   GET /works
router.get('/', async (req, res) => {
    try {
        const works = await Works.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean()

        res.render('works/index', {
            works,
        })
        console.log("works/index rendered");
        console.log("You can now see All works Here !");
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Show single works
// @route   GET /works/:id
router.get('/:id', async (req, res) => {
    try {
        let works = await Works.findById(req.params.id)
            .populate('user')
            .lean()

        res.render('works/show', {
            works,
        })
        console.log("You can now see the works details");

    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc    Show edit page
// @route   GET /works/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const works = await Works.findOne({ _id: req.params.id }).lean()

        if (!works) {
            return res.render('error/404')
        }

        if (works.user != req.user.id) {
            res.redirect('/works')
        } else {
            res.render('works/edit', {
                works,
            })
            console.log("You are in works edit page & can Edit this works");
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})



// @desc Show Update page
// @route POST /works/:id
router.post('/:id', ensureAuth, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        let works = await Works.findById(req.params.id).lean();

        if (!works) {
            console.log('works not found');
            return res.render('error/404');
        }

        if (String(works.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/workss');
        }

        const file = req.file;
        const existingImage = works.imageBase64;

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
                contentType: works.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        works = await Works.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('works updated successfully');
        res.redirect('/works');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});




// @desc    Delete works
// @route   DELETE /works/:id
router.delete('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let works = await Works.findById(req.params.id).lean()

        if (!works) {
            return res.render('error/404')
        }

        if (works.user != req.user.id) {
            res.redirect('/workspage')
        } else {
            await Works.deleteOne({ _id: req.params.id })
            res.redirect('/workspage')
        }
        console.log("works Deleted Successfully !");

    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    User works
// @route   GET /works/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const works = await Works.find({ user: req.params.userId, })
            .populate('user')
            .lean()

        res.render('works/index', {
            works,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Search works by title
//@route GET /works/search/:query
router.get('/search/:query', async (req, res) => {
    try {
        const works = await Works.find({ title: new RegExp(req.query.query, 'i'), })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('works/index', {
            works,
        })
        console.log("Search is working !");
    } catch (err) {
        console.log(err)
        res.render('error/404')
    }
})


module.exports = router
