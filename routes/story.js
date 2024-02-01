const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story')


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadstory');
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });


// @desc    Show add page
// @route   GET /story/add
// Inside your '/story/add' route
router.get('/add', ensureAuth, (req, res) => {
  console.log('Reached /story/add route');
  res.render('story/add');

});


// @desc Process add story form with image upload
// @route POST /story
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file || file.length === 0) {
      const error = new Error('Please choose image ');
      error.httpStatusCode = 400;
      throw error;
    }

    const img = fs.readFileSync(file.path);
    const encode_image = img.toString('base64');

    const newUpload = new Story({
      ...req.body,
      user: req.user.id,
      contentType: file.mimetype,
      imageBase64: encode_image,
    });

    try {
      await newUpload.save();
      res.redirect('/story');
      console.log("New story with image/upload is Posted");

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


// @desc Show all story
// @route GET /story/index
router.get('/', async (req, res) => {
  try {
    const story = await Story.find({ status: 'Public' })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    res.render('story/index', {
      story,
    });
    console.log("You can now see All story Here !");
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});


// @desc    Show single story
// @route   GET /story/:id
router.get('/:id', async (req, res) => {
  try {
    let story = await Story.findById(req.params.id)
      .populate('user')
      .lean()


    res.render('story/show', {
      story,
    })

    console.log("You can now see the story details");
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})




// @desc Show edit page
// @route GET /story/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render('error/404');
    }

    if (story.user.toString() !== req.user.id) {
      return res.redirect('/story');
    } else {
      res.render('story/edit', {
        story,
      });
    }
    console.log("You are in storie/edit page & can Edit this story info");
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc Show Update page
// @route POST /story/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      console.log('Story not found');
      return res.render('error/404');
    }

    if (String(story.user) !== req.user.id) {
      console.log('User not authorized');
      return res.redirect('/story');
    }

    const file = req.file;
    const existingImage = story.imageBase64;

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
        contentType: story.contentType,
        imageBase64: existingImage,
      };
    }

    // Use await here
    story = await Story.findOneAndUpdate(
      { _id: req.params.id },
      updatedFields,
      { new: true, runValidators: true }
    );

    console.log('Story updated successfully');
    res.redirect('/story');
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});


// @desc Delete story
// @route DELETE /story/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render('error/404');
    }

    if (story.user != req.user.id) {
      res.redirect('/story');
    } else {
      await Story.deleteOne({ _id: req.params.id });
      res.redirect('/story');
    }
    console.log("Story Deleted Successfully !");

  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc User story
// @route GET /story/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const story = await Story.find({
      user: req.params.userId,
    }).populate('user').lean();

    res.render('story/index', {
      story,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});



//@desc Search story by title
//@route GET /story/search/:query
router.get('/search/:query', async (req, res) => {
  try {
    const story = await Story.find({ title: new RegExp(req.query.query, 'i') })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('story/index', { story });
    console.log("Search is working !");
  } catch (err) {
    console.log(err);
    res.render('error/404');
  }
});


module.exports = router