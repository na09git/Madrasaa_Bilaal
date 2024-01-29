const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

const Worker = require('../models/Worker');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadworker');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show add worker page
// @route GET /worker/addworker
router.get('/addworker', ensureAuth, ensureAdmin, (req, res) => {
    res.render('worker/addworker', { title: 'Worker Page' });
});


// @desc Process add worker form with image upload
// @route POST /worker
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

        const newUpload = new Worker({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/workers');
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


// @desc Show all workers
// @route GET /worker/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const worker = await Worker.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('worker/index', {
            worker,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single worker
// @route   GET /worker/:id
router.get('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let worker = await Worker.findById(req.params.id)
            .populate('user')
            .lean()

        if (!worker) {
            return res.render('error/404')
        }

        if (worker.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('worker/show', {
                worker,
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /worker/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).lean();

        if (!worker) {
            return res.render('error/404');
        }

        if (worker.user.toString() !== req.user.id) {
            return res.redirect('/workers');
        }

        res.render('worker/edit', { worker });
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /worker/:id
router.post('/:id', ensureAuth, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        let worker = await Worker.findById(req.params.id).lean();

        if (!worker) {
            console.log('worker not found');
            return res.render('error/404');
        }

        if (String(worker.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/workers');
        }

        const file = req.file;
        const existingImage = worker.imageBase64;

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
                contentType: worker.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        worker = await Worker.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('worker updated successfully');
        res.redirect('/workers');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc Delete worker
// @route DELETE /worker/:id
router.delete('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let worker = await Worker.findById(req.params.id).lean();

        if (!worker) {
            return res.render('error/404');
        }

        if (worker.user != req.user.id) {
            res.redirect('/workers');
        } else {
            await Worker.deleteOne({ _id: req.params.id });
            res.redirect('/workers');
        }
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User worker
// @route GET /worker/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const worker = await Worker.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('worker/index', {
            worker,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search worker by title
//@route GET /worker/search/:query
router.get('/search/:query', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const worker = await Worker.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('worker/index', { worker });
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;