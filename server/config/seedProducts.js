const mongoose = require('mongoose');
const Product = require('../models/Product');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();

const sampleProducts = [
    {
        name: "Boys Athletic T-Shirt",
        description: "Comfortable moisture-wicking athletic t-shirt perfect for sports and casual wear",
        price: 25.99,
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Blue", "Red", "Black", "White"],
        image: "https://via.placeholder.com/400x400/0080ff/ffffff?text=Athletic+T-Shirt",
        stock: 50,
        brand: "SportMax",
        isActive: true
    },
    {
        name: "Boys Basketball Shorts",
        description: "Lightweight basketball shorts with elastic waistband and side pockets",
        price: 19.99,
        category: "Shorts",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Gray"],
        image: "https://via.placeholder.com/400x400/333333/ffffff?text=Basketball+Shorts",
        stock: 40,
        brand: "CourtKing",
        isActive: true
    },
    {
        name: "Boys Running Tracksuit",
        description: "Complete tracksuit set with jacket and pants, perfect for training",
        price: 65.99,
        category: "Tracksuits",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Navy/White", "Black/Red", "Gray/Blue"],
        image: "https://via.placeholder.com/400x400/000080/ffffff?text=Running+Tracksuit",
        stock: 25,
        brand: "RunFast",
        isActive: true
    },
    {
        name: "Boys Soccer Cleats",
        description: "Professional soccer cleats with excellent grip and comfort",
        price: 89.99,
        category: "Shoes",
        sizes: ["6", "7", "8", "9", "10", "11"],
        colors: ["Black/White", "Blue/Yellow", "Red/Black"],
        image: "https://via.placeholder.com/400x400/228B22/ffffff?text=Soccer+Cleats",
        stock: 30,
        brand: "KickPro",
        isActive: true
    },
    {
        name: "Boys Sports Water Bottle",
        description: "BPA-free sports water bottle with easy-grip design",
        price: 12.99,
        category: "Accessories",
        sizes: ["One Size"],
        colors: ["Blue", "Green", "Red", "Black"],
        image: "https://via.placeholder.com/400x400/87CEEB/000000?text=Water+Bottle",
        stock: 100,
        brand: "HydroSport",
        isActive: true
    },
    {
        name: "Boys Training Hoodie",
        description: "Warm and comfortable hoodie perfect for training and casual wear",
        price: 39.99,
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Gray", "Black", "Navy", "Maroon"],
        image: "https://via.placeholder.com/400x400/696969/ffffff?text=Training+Hoodie",
        stock: 35,
        brand: "SportMax",
        isActive: true
    }
];

const seedProducts = async () => {
    try {
        await connectDB();
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Insert sample products
        await Product.insertMany(sampleProducts);
        
        console.log('Sample products seeded successfully');
        console.log(`${sampleProducts.length} products added to database`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
