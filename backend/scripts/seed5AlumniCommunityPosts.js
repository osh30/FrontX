const mongoose = require('mongoose');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const Activity = require('../models/Activity');

const COMMUNITY_POSTS = [
  {
    alumniEmail: 'shayna.islam@std.uftb.ac.bd',
    alumniName: 'Shayna Islam',
    title: 'How I Started Building My Career in Educational Technology',
    category: 'Career Advice',
    content: `Starting a career in Educational Technology can feel confusing at first. I started by focusing on a few practical skills instead of trying to learn everything at once.

My main focus was web development, learning technology, and building small projects that solved real problems.

A useful approach is:
• Choose one technical skill.
• Build small projects.
• Share your work.
• Learn from feedback.
• Gradually build a portfolio.

Consistency matters more than trying to become an expert overnight.`,
    tags: ['Career', 'EdTech', 'Portfolio', 'Mentorship']
  },
  {
    alumniEmail: 'prapty.chowdhury@std.uftb.ac.bd',
    alumniName: 'Prapty Chowdhury',
    title: 'Useful Tips for Building a Strong Student Portfolio',
    category: 'Career Advice',
    content: `A good portfolio does not need dozens of projects. A few well-explained projects can be much more valuable.

For each project, students should clearly mention:
• Problem being solved
• Technologies used
• Their contribution
• Main features
• Challenges faced
• Final result

Adding GitHub repositories, screenshots, project descriptions, and a short explanation of what was learned can make a portfolio much stronger.`,
    tags: ['Portfolio', 'Projects', 'GitHub', 'Career']
  },
  {
    alumniEmail: 'rayhana.islam@std.uftb.ac.bd',
    alumniName: 'Rayhana Islam',
    title: 'Why Learning Git and GitHub Early Is Important',
    category: 'General Discussion',
    content: `Git and GitHub are useful skills for students working on software and technology projects.

Students can use Git to:
• Track project changes
• Create branches
• Collaborate with teammates
• Restore previous versions
• Maintain project history

GitHub can also work as a public portfolio where recruiters and mentors can see a student's development work.

Learning the basic Git workflow early can make team projects much easier.`,
    tags: ['Git', 'GitHub', 'OpenSource', 'Collaboration']
  },
  {
    alumniEmail: 'onti.mahmud@std.uftb.ac.bd',
    alumniName: 'Onti Mahmud',
    title: 'How Students Can Prepare for Their First Internship',
    category: 'Internship',
    content: `Preparing for an internship is not only about having good academic results.

Students should gradually work on:
• Technical skills
• Communication
• CV/Resume
• Portfolio
• Interview preparation
• Problem-solving
• Teamwork

It is also helpful to start applying early and learn from rejection instead of waiting until graduation.

Even a small internship or project experience can help students understand what kind of career they want.`,
    tags: ['Internship', 'Resume', 'Interview', 'CareerPrep']
  },
  {
    alumniEmail: 'safwat.chowdhury@std.uftb.ac.bd',
    alumniName: 'Safwat Chowdhury',
    title: 'The Importance of Networking With Alumni',
    category: 'University Experience',
    content: `University students can learn a lot from people who have already completed their studies and entered the professional world.

Connecting with Alumni can help students understand:
• Industry expectations
• Required technical skills
• Internship opportunities
• Career paths
• Interview preparation
• Real-world project experience

Students should not hesitate to ask Alumni meaningful questions and seek guidance.

A strong professional network can become an important part of long-term career development.`,
    tags: ['Networking', 'Alumni', 'Mentorship', 'Growth']
  },
  {
    alumniEmail: 'mubasshihra.nahian@std.uftb.ac.bd',
    alumniName: 'Mubasshihra Nahian',
    title: 'Essential Advice for Landing Your First Tech Internship 🚀',
    category: 'Career Advice',
    content: `Hey everyone! As an alumnus of Educational Technology & Engineering, I frequently get asked by students how to prepare for tech internships and early career opportunities.

Here are 4 key steps that made the biggest difference for me:

1. **Build 2-3 Solid Projects**: Focus on quality over quantity. A full-stack web or mobile app with clean code, proper documentation, and live deployment speaks louder than a dozen tutorial clones.
2. **Optimize Your LinkedIn & Resume**: Keep your resume concise (1 page), highlight your technical skills and project metrics, and showcase your GitHub repositories.
3. **Network & Seek Mentorship**: Reach out to university alumni on FrontX! Asking for feedback on your portfolio or a brief informational chat often opens doors to direct referrals.
4. **Consistency in Problem Solving**: Spend 30-45 minutes daily practicing data structures, algorithms, or system concepts. Consistency beats last-minute cramming.

Feel free to leave a comment or connect with me if you need resume feedback or career guidance. Rooting for all of you!`,
    tags: ['Career', 'Internship', 'Engineering', 'Mentorship']
  }
];

const seed5AlumniCommunityPosts = async () => {
  try {
    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const data of COMMUNITY_POSTS) {
      let alumniUser = await User.findOne({
        $or: [
          { email: data.alumniEmail.toLowerCase() },
          { name: { $regex: new RegExp(`^${data.alumniName}$`, 'i') } }
        ]
      });

      if (!alumniUser) {
        console.log(`⚠️ Alumni user ${data.alumniName} (${data.alumniEmail}) not found. Skipping community post "${data.title}".`);
        continue;
      }

      // Check if post already exists by title
      const existing = await CommunityPost.findOne({ title: data.title });

      if (existing) {
        if (String(existing.originalAuthor) !== String(alumniUser._id)) {
          existing.originalAuthor = alumniUser._id;
          await existing.save();
          console.log(`✏️ Updated author linkage for community post: "${data.title}" -> Alumni ${alumniUser.name}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
        continue;
      }

      const post = await CommunityPost.create({
        originalAuthor: alumniUser._id,
        role: 'alumni',
        isAnonymous: false,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        allowComments: true
      });

      // Create Global Activity
      try {
        await Activity.create({
          user: alumniUser._id,
          title: `shared a new community post: ${data.title}`,
          type: 'post',
          color: 'bg-blue-100 text-blue-600',
          relatedId: post._id,
          isGlobal: true
        });
      } catch (actErr) {}

      console.log(`✅ Created Alumni Community Post: "${data.title}" by ${alumniUser.name}`);
      createdCount++;
    }

    console.log(`💬 Alumni Community Posts Seeding Summary: Created=${createdCount}, Skipped=${skippedCount}, Updated=${updatedCount}`);
    return { createdCount, skippedCount, updatedCount };
  } catch (error) {
    console.error('❌ Error seeding Alumni Community Posts:', error);
  }
};

module.exports = seed5AlumniCommunityPosts;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seed5AlumniCommunityPosts();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
