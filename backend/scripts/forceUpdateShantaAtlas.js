const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const URIS = [
  process.env.MONGODB_URI,
  process.env.MONGO_URI,
  'mongodb://127.0.0.1:27017/frontx_db'
].filter(Boolean);

const forceUpdateShanta = async () => {
  for (const uri of URIS) {
    try {
      console.log(`Connecting to database: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
      await mongoose.connect(uri);

      // 1. Update Shanta in User collection
      const resShanta = await User.updateMany(
        { $or: [{ name: { $regex: 'shanta', $options: 'i' } }, { email: { $regex: 'shanta|santa', $options: 'i' } }] },
        { $set: { department: 'Educational Technology and Engineering' } }
      );
      console.log(`✅ Updated ${resShanta.modifiedCount} Shanta user account(s) in this database.`);

      // 2. Update any other user with EEE / CS / CSE
      const resEEE = await User.updateMany(
        { department: { $in: ['EEE', 'CS', 'CSE', 'Computer Science'] } },
        { $set: { department: 'Educational Technology and Engineering' } }
      );
      console.log(`✅ Updated ${resEEE.modifiedCount} user(s) with EEE/CS department to Educational Technology and Engineering.`);

      // Print all users matching Shanta
      const shantas = await User.find({ $or: [{ name: { $regex: 'shanta', $options: 'i' } }, { email: { $regex: 'shanta|santa', $options: 'i' } }] });
      for (const s of shantas) {
        console.log(`  👤 User: ${s.name} (${s.email}) | Dept: "${s.department}" | Role: ${s.role}`);
      }

      await mongoose.disconnect();
    } catch (err) {
      console.error(`❌ Connection/Update error for URI:`, err.message);
    }
  }
  process.exit(0);
};

forceUpdateShanta();
