import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject']
    },
    message: {
        type: String,
        required: [true, 'Please provide a message']
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Replied'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
