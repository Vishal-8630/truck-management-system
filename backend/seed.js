import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const existingUser = await User.findOne({ username: 'admin' });
        if (existingUser) {
            console.log('User already exists');
            process.exit();
        }

        const dummyUser = await User.create({
            fullname: 'Admin User',
            username: 'admin',
            email: 'admin@example.com',
            password: 'adminpassword123',
            isAdmin: true,
            isVerified: true
        });

        console.log('Dummy user created successfully');
        console.log('Username: admin');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
