const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
  imageBase64: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Public',
    enum: ['Public', 'Private'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model('Story', StorySchema)
