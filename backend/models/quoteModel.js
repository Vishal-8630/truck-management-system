import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please provide pickup location']
    },
    dropLocation: {
        type: String,
        required: [true, 'Please provide drop location']
    },
    cargoType: {
        type: String,
        required: [true, 'Please specify cargo type']
    },
    weight: {
        type: String,
        required: [true, 'Please specify weight']
    },
    truckType: {
        type: String,
        required: [true, 'Please select truck type']
    },
    pickupDate: {
        type: Date,
        required: [true, 'Please select a pickup date']
    },
    message: String,
    status: {
        type: String,
        enum: ['Pending', 'Quoted', 'Booked', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;
