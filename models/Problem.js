const mongoose = require('mongoose')

const ProblemSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    grade: {
        type: String,
        default: '1',
        enum: ['kg-1', 'kg-2', 'kg-3', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    case: {
        type: String,
        default: 'Normal',
        enum: ['Normal', 'Worst'],
    },
    body: {
        type: String,
        required: true,
        trim: true,
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

module.exports = mongoose.model('Problem', ProblemSchema)
