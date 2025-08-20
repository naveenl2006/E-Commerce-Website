const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Prevent admin email signup
        if (email === process.env.ADMIN_EMAIL) {
            return res.status(400).json({ message: 'This email is reserved for admin use' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, password, phone });
        await user.save();

        const token = generateToken(user._id);
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Prevent regular login for admin email
        if (email === process.env.ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Please use admin login portal' });
        }

        const user = await User.findOne({ email, isAdmin: false });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if credentials match environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Find or create admin user in database
            let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
            
            if (!adminUser) {
                adminUser = new User({
                    name: process.env.ADMIN_NAME,
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                    isAdmin: true,
                    phone: '+1234567890'
                });
                await adminUser.save();
            }

            const token = generateToken(adminUser._id);

            return res.json({
                message: 'Admin login successful',
                token,
                user: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    isAdmin: adminUser.isAdmin
                }
            });
        }

        // If not matching env credentials, check database
        const user = await User.findOne({ email, isAdmin: true });
        if (!user) {
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get admin info
exports.getAdminInfo = async (req, res) => {
    try {
        res.json({
            adminEmail: process.env.ADMIN_EMAIL,
            setupComplete: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
