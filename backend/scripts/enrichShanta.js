const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const User = require('../models/User');

const uploadSvgToCloudinary = async (svgString, rawPublicId, folder = 'frontx/alumni_assets') => {
  const cleanId = (rawPublicId || 'asset').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const tmpFile = path.join(__dirname, `tmp_${cleanId}_${Date.now()}.svg`);
  fs.writeFileSync(tmpFile, svgString);
  try {
    const res = await cloudinary.uploader.upload(tmpFile, {
      folder: folder,
      public_id: `${cleanId}_${Date.now()}`,
      resource_type: 'auto'
    });
    return res.secure_url;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
};

const createResearchCoverSvg = (title, author, area, journal, year) => `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#F8FAFC" rx="20" />
  <rect x="0" y="0" width="800" height="16" fill="#1E3A8A" />
  <rect x="50" y="50" width="180" height="32" rx="8" fill="#1E3A8A" fill-opacity="0.1" />
  <text x="65" y="71" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1E3A8A">ACADEMIC RESEARCH</text>
  <text x="50" y="140" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0F172A">${(title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="50" y="240" font-family="sans-serif" font-size="15" font-weight="bold" fill="#2563EB">Research Area: ${(area || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="270" font-family="sans-serif" font-size="14" fill="#475569">Lead Author: ${(author || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="295" font-family="sans-serif" font-size="13" fill="#64748B">Dept. of Educational Technology &amp; Engineering | UFTB (${year || '2024'})</text>
  <line x1="50" y1="340" x2="750" y2="340" stroke="#CBD5E1" stroke-dasharray="6 6" />
  <rect x="50" y="375" width="700" height="75" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
  <text x="80" y="405" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F172A">${(journal || 'FrontX Academic Research Repository').replace(/&/g, '&amp;')}</text>
  <text x="80" y="430" font-family="sans-serif" font-size="11" fill="#64748B">Peer-Reviewed Publication Series - Educational Technology &amp; Engineering</text>
</svg>`;

const createProjectScreenshotSvg = (title, tech, author) => `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0F172A" rx="20" />
  <circle cx="40" cy="35" r="6" fill="#EF4444" />
  <circle cx="60" cy="35" r="6" fill="#F59E0B" />
  <circle cx="80" cy="35" r="6" fill="#10B981" />
  <rect x="120" y="22" width="560" height="26" rx="6" fill="#334155" />
  <text x="400" y="39" font-family="monospace" font-size="11" fill="#94A3B8" text-anchor="middle">https://frontx-${(title || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}.uftb.ac.bd</text>
  <rect x="40" y="70" width="720" height="390" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2" />
  <text x="70" y="140" font-family="sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">${(title || '').replace(/&/g, '&amp;')}</text>
  <text x="70" y="175" font-family="sans-serif" font-size="14" fill="#94A3B8">Lead Engineer: ${(author || '').replace(/&/g, '&amp;')} | Dept of ETE</text>
  <rect x="70" y="210" width="660" height="150" rx="10" fill="#0F172A" stroke="#475569" />
  <text x="90" y="250" font-family="monospace" font-size="14" fill="#38BDF8">Technologies: ${(tech || '').replace(/&/g, '&amp;')}</text>
  <text x="90" y="285" font-family="monospace" font-size="12" fill="#A7F3D0">// Application System Architecture &amp; UI Preview</text>
  <text x="90" y="310" font-family="monospace" font-size="12" fill="#FDE68A">// Status: Production Deployed</text>
</svg>`;

const createCertificateSvg = (title, org, recipient, date) => `<svg width="800" height="550" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="550" fill="#FFFFFF" rx="20" stroke="#059669" stroke-width="8" />
  <rect x="20" y="20" width="760" height="510" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="8 4" />
  <text x="400" y="90" font-family="serif" font-size="30" font-weight="bold" fill="#065F46" text-anchor="middle">CERTIFICATE OF ACHIEVEMENT</text>
  <text x="400" y="125" font-family="sans-serif" font-size="13" font-weight="bold" fill="#059669" text-anchor="middle">VERIFIED CREDENTIAL DOCUMENT</text>
  <text x="400" y="190" font-family="sans-serif" font-size="15" fill="#4B5563" text-anchor="middle">This is to certify that</text>
  <text x="400" y="240" font-family="serif" font-size="28" font-weight="bold" fill="#111827" text-anchor="middle">${(recipient || '').replace(/&/g, '&amp;')}</text>
  <text x="400" y="290" font-family="sans-serif" font-size="15" fill="#4B5563" text-anchor="middle">has successfully completed the professional course in</text>
  <text x="400" y="340" font-family="sans-serif" font-size="20" font-weight="bold" fill="#047857" text-anchor="middle">${(title || '').replace(/&/g, '&amp;')}</text>
  <text x="400" y="390" font-family="sans-serif" font-size="14" font-weight="bold" fill="#374151" text-anchor="middle">Issued by: ${(org || '').replace(/&/g, '&amp;')} | Issue Date: ${date || '2024'}</text>
  <line x1="150" y1="460" x2="350" y2="460" stroke="#9CA3AF" />
  <text x="250" y="485" font-family="sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">Issuing Organization</text>
  <line x1="450" y1="460" x2="650" y2="460" stroke="#9CA3AF" />
  <text x="550" y="485" font-family="sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">Credential ID: CRT-${Date.now().toString().slice(-6)}</text>
</svg>`;

const createResumeSvg = (name, focus, skills, dept, session, email) => `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1000" fill="#FFFFFF" rx="20" stroke="#E2E8F0" stroke-width="2" />
  <rect x="0" y="0" width="800" height="140" fill="#0F172A" />
  <text x="50" y="60" font-family="sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF">${(name || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="95" font-family="sans-serif" font-size="16" fill="#38BDF8">${(focus || '').replace(/&/g, '&amp;')} Specialist</text>
  <text x="50" y="120" font-family="sans-serif" font-size="12" fill="#94A3B8">${email} | ${dept} (${session}) | RESUME DOCUMENT</text>
  <text x="50" y="190" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0F172A">PROFESSIONAL SUMMARY</text>
  <line x1="50" y1="205" x2="750" y2="205" stroke="#2563EB" stroke-width="2" />
  <text x="50" y="235" font-family="sans-serif" font-size="13" fill="#334155">Accomplished Educational Technology and Engineering graduate specializing in ${(focus || '').replace(/&/g, '&amp;')}.</text>
  <text x="50" y="255" font-family="sans-serif" font-size="13" fill="#334155">Experienced in building scalable EdTech solutions, user-centered platforms, and data-driven systems.</text>
  <text x="50" y="310" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0F172A">TECHNICAL SKILLS &amp; COMPETENCIES</text>
  <line x1="50" y1="325" x2="750" y2="325" stroke="#2563EB" stroke-width="2" />
  <text x="50" y="355" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1E293B">Core Skills: ${(skills || []).join(', ').replace(/&/g, '&amp;')}</text>
  <text x="50" y="440" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0F172A">EDUCATION</text>
  <line x1="50" y1="455" x2="750" y2="455" stroke="#2563EB" stroke-width="2" />
  <text x="50" y="485" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0F172A">B.Sc. in Educational Technology and Engineering</text>
  <text x="50" y="508" font-family="sans-serif" font-size="13" fill="#475569">University of Frontier Technology Bangladesh (UFTB) | Session ${session}</text>
  <rect x="50" y="900" width="700" height="50" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
  <text x="400" y="930" font-family="sans-serif" font-size="12" fill="#64748B" text-anchor="middle">Official FrontX Alumni Profile Resume Document</text>
</svg>`;

const enrichShanta = async () => {
  try {
    const uris = [
      process.env.MONGODB_URI,
      process.env.MONGO_URI,
      'mongodb://127.0.0.1:27017/frontx_db'
    ].filter(Boolean);

    for (const uri of uris) {
      try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        break;
      } catch (e) {}
    }

    const shanta = await User.findOne({ name: { $regex: 'shanta', $options: 'i' } });
    if (!shanta) {
      console.error('❌ Shanta account not found!');
      process.exit(1);
    }

    console.log(`Found Shanta: ${shanta.name} (${shanta.email})`);

    const nameClean = 'Shanta Islam';
    const focus = 'Educational Hardware & Embedded Technology';
    const interests = ['Educational Hardware', 'Embedded Systems', 'Smart Campus', 'IoT Systems'];
    const skills = ['Arduino', 'C/C++', 'Embedded Systems', 'IoT', 'Circuit Design', 'Python'];

    const projectsData = [
      {
        title: 'Smart Campus Laboratory Energy Monitor',
        desc: 'Embedded IoT monitoring system capturing power utilization and lab equipment safety metrics across university hardware labs.',
        tech: 'Arduino, ESP32, C/C++, MQTT, Python, SQLite',
        github: 'https://github.com/frontx-projects/lab-energy-monitor',
        demo: 'https://lab-monitor.frontx.app'
      },
      {
        title: 'Automated Student Attendance Hardware Station',
        desc: 'RFID and biometric hardware station enabling instant automated class attendance logging with encrypted cloud sync.',
        tech: 'Raspberry Pi, C/C++, Python, PostgreSQL, WebSockets',
        github: 'https://github.com/frontx-projects/attendance-hardware-station',
        demo: 'https://attendance-station.frontx.app'
      }
    ];

    const researchData = [
      {
        title: 'Low-Cost Embedded Hardware Systems for Practical STEM Education in Developing Regions',
        desc: 'Field study assessing the durability and instructional effectiveness of open-source microcontrollers in university engineering labs.',
        journal: 'IEEE Transactions on Education',
        topic: 'Educational Hardware / Embedded Systems',
        year: '2025'
      }
    ];

    const certificatesData = [
      {
        title: 'Embedded Systems Design with ARM Architecture',
        desc: 'Microcontroller programming, interrupt handling, real-time operating systems, and circuit layout.',
        org: 'ARM Education',
        link: 'https://arm.com/verify/cert-shanta-1',
        date: '2024'
      },
      {
        title: 'IoT & Smart Hardware Engineering',
        desc: 'Sensor integration, wireless protocols, and hardware security.',
        org: 'Stanford Online',
        link: 'https://stanford.edu/verify/cert-shanta-2',
        date: '2024'
      }
    ];

    // Upload visual assets
    const enrichedProjects = [];
    for (const proj of projectsData) {
      const svg = createProjectScreenshotSvg(proj.title, proj.tech, nameClean);
      const imageUrl = await uploadSvgToCloudinary(svg, `proj_shanta`);
      enrichedProjects.push({ ...proj, image: imageUrl });
    }

    const enrichedResearch = [];
    for (const res of researchData) {
      const svg = createResearchCoverSvg(res.title, nameClean, res.topic, res.journal, res.year);
      const coverUrl = await uploadSvgToCloudinary(svg, `res_shanta`);
      enrichedResearch.push({ ...res, pdfUrl: coverUrl });
    }

    const enrichedCertificates = [];
    for (const cert of certificatesData) {
      const svg = createCertificateSvg(cert.title, cert.org, nameClean, cert.date);
      const certUrl = await uploadSvgToCloudinary(svg, `cert_shanta`);
      enrichedCertificates.push({ ...cert, fileUrl: certUrl });
    }

    const resumeSvg = createResumeSvg(nameClean, focus, skills, 'Educational Technology and Engineering', shanta.session || '2020-21', shanta.email);
    const resumeUrl = await uploadSvgToCloudinary(resumeSvg, `cv_shanta`);

    shanta.name = nameClean;
    shanta.department = 'Educational Technology and Engineering';
    shanta.role = 'alumni';
    shanta.status = 'approved';
    shanta.bio = 'Embedded Systems & Hardware Engineer specializing in smart campus IoT solutions and educational laboratory technologies.';
    shanta.careerInterest = focus;
    shanta.interests = Array.from(new Set([...interests, ...skills]));
    shanta.githubLink = 'https://github.com/shanta-islam';
    shanta.portfolioLink = 'https://shanta-islam.frontx.app';
    shanta.resumeUrl = resumeUrl;
    shanta.projects = enrichedProjects;
    shanta.research = enrichedResearch;
    shanta.certificates = enrichedCertificates;

    await shanta.save();
    console.log(`✅ [ENRICHED & VERIFIED] Shanta's account updated successfully!`);
    console.log(`Name: ${shanta.name}`);
    console.log(`Email: ${shanta.email}`);
    console.log(`Department: ${shanta.department}`);
    console.log(`Role: ${shanta.role}`);

    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('Enrich Shanta error:', err);
    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  enrichShanta();
}

module.exports = enrichShanta;
