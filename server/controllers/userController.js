const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Add this import for password hashing

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const existingItem = user.cart.find(
            item => item.product.toString() === productId && 
                   item.size === size && 
                   item.color === color
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity, size, color });
        }

        await user.save();
        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('cart.product');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.cart = user.cart.filter(item => item._id.toString() !== itemId);
        await user.save();
        
        res.json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        
        res.json({ message: 'Item added to wishlist successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        
        res.json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ADD THESE MISSING FUNCTIONS:

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India'
            },
            createdAt: user.createdAt,
            preferences: user.preferences || {
                emailNotifications: true,
                smsNotifications: false,
                orderUpdates: true,
                promotionalEmails: true,
                newsletter: true
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        // Check if email is being changed and if it already exists
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: req.user.userId } 
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name, email, phone, address },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error while changing password' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update preferences
        user.preferences = {
            emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : user.preferences?.emailNotifications || true,
            smsNotifications: req.body.smsNotifications !== undefined ? req.body.smsNotifications : user.preferences?.smsNotifications || false,
            orderUpdates: req.body.orderUpdates !== undefined ? req.body.orderUpdates : user.preferences?.orderUpdates || true,
            promotionalEmails: req.body.promotionalEmails !== undefined ? req.body.promotionalEmails : user.preferences?.promotionalEmails || true,
            newsletter: req.body.newsletter !== undefined ? req.body.newsletter : user.preferences?.newsletter || true
        };
        
        await user.save();

        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: 'Server error while updating preferences' });
    }
};

// ADD DELETE ACCOUNT FUNCTION (for the danger zone)
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error while deleting account' });
    }
};
