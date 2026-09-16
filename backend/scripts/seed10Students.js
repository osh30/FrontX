const mongoose = require('mongoose');
const User = require('../models/User');

const studentsData = [
  {
    name: 'Tanvir Ahmed Rifat',
    email: 'tanvir.rifat@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '21-22',
    bio: 'Aspiring Educational Technologist and FrontX student member.',
    status: 'approved'
  },
  {
    name: 'Sadia Rahman Mim',
    email: 'sadia.mim@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '21-22',
    bio: 'Passionate about UI/UX design and interactive learning systems.',
    status: 'approved'
  },
  {
    name: 'Naimur Rahman Shanto',
    email: 'naimur.shanto@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Computer Science and Engineering',
    session: '20-21',
    bio: 'Competitive programmer and full-stack web developer.',
    status: 'approved'
  },
  {
    name: 'Fahmida Yasmin Tisha',
    email: 'fahmida.tisha@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '22-23',
    bio: 'Exploring machine learning applications in modern education.',
    status: 'approved'
  },
  {
    name: 'Mahfuzur Rahman Akash',
    email: 'mahfuz.akash@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Software Engineering',
    session: '21-22',
    bio: 'Backend developer focused on Node.js, Express, and MongoDB architectures.',
    status: 'approved'
  },
  {
    name: 'Anika Tabassum Sara',
    email: 'anika.sara@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '20-21',
    bio: 'Content strategist and active research project collaborator.',
    status: 'approved'
  },
  {
    name: 'Rifat Hossain Chowdhury',
    email: 'rifat.chowdhury@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Computer Science and Engineering',
    session: '22-23',
    bio: 'Cybersecurity enthusiast and system administrator.',
    status: 'approved'
  },
  {
    name: 'Sumaiya Akter Mou',
    email: 'sumaiya.mou@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '21-22',
    bio: 'Passionate about EdTech curriculum design and mobile development.',
    status: 'approved'
  },
  {
    name: 'Zubayer Ahmed Kavyo',
    email: 'zubayer.kavyo@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Software Engineering',
    session: '20-21',
    bio: 'React and React Native developer building student utility tools.',
    status: 'approved'
  },
  {
    name: 'Tasnim Alim Nuha',
    email: 'tasnim.nuha@std.uftb.ac.bd',
    password: 'StudentPass2026!',
    role: 'student',
    department: 'Educational Technology and Engineering',
    session: '22-23',
    bio: 'E-learning researcher and peer student mentor.',
    status: 'approved'
  }
];

const seed10Students = async () => {
  let createdCount = 0;
  let skippedCount = 0;

  try {
    for (const student of studentsData) {
      const existing = await User.findOne({ email: student.email.toLowerCase() });
      if (existing) {
        skippedCount++;
        continue;
      }

      await User.create(student);
      createdCount++;
      console.log(`✅ Created student account: ${student.name} (${student.email})`);
    }

    console.log(`📊 Student Seeding Complete: ${createdCount} created, ${skippedCount} skipped.`);
    return { createdCount, skippedCount };
  } catch (error) {
    console.error('❌ Error seeding student accounts:', error.message);
    throw error;
  }
};

module.exports = seed10Students;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seed10Students();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
