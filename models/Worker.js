const mongoose = require('mongoose')
const multer = require('multer');

const WorkerSchema = new mongoose.Schema({
    name:
    {
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
    position: {
        type: String,
        default: 'Teacher',
        enum: ['Teacher', 'Manager', 'Ustaz', 'Cleaner', 'Security', 'Driver', 'Cashier', 'Director', 'IT-Technician'],
    },
    salary: {
        type: String,
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

module.exports = mongoose.model('Worker', WorkerSchema)
