// student Schema
const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
    },
    grade: {
        type: String,
        default: '1',
        enum: ['kg-1', 'kg-2', 'kg-3', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    status: {
        type: String,
        default: 'Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    gender: {
        type: String,
        default: 'M',
        enum: ['M', 'F'],
    },
    imageBase64: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Student', StudentSchema)
