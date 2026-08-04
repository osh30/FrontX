const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('Admin already exists.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Administrator',
      email: email.toLowerCase(),
      password: password,
      role: 'admin',
      department: 'Educational Technology and Engineering',
    });

    console.log('Admin account created successfully.');
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  ID:', admin._id);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
