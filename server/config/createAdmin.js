const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const admin = new User({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isAdmin: true,
            phone: '+1234567890'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log(`Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
