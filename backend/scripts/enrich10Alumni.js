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

// Helper to upload SVG to Cloudinary using temp file
const uploadSvgToCloudinary = async (svgString, rawPublicId, folder = 'frontx/demo_assets') => {
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

// SVG Generators for clean, valid, professional DEMO visual assets
const createResearchCoverSvg = (title, author, area) => `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#F8FAFC" rx="20" />
  <rect x="0" y="0" width="800" height="16" fill="#2563EB" />
  <rect x="50" y="50" width="160" height="32" rx="8" fill="#1E3A8A" fill-opacity="0.1" />
  <text x="65" y="71" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1E3A8A">DEMO RESEARCH PAPER</text>
  <text x="50" y="140" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0F172A">${(title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="50" y="240" font-family="sans-serif" font-size="15" font-weight="bold" fill="#2563EB">Research Area: ${(area || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="270" font-family="sans-serif" font-size="14" fill="#475569">Lead Author: ${(author || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="295" font-family="sans-serif" font-size="13" fill="#64748B">Dept. of Educational Technology and Engineering | UFTB</text>
  <line x1="50" y1="340" x2="750" y2="340" stroke="#CBD5E1" stroke-dasharray="6 6" />
  <rect x="50" y="375" width="700" height="75" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
  <text x="80" y="405" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F172A">FrontX Academic Research Repository (DEMO Content)</text>
  <text x="80" y="430" font-family="sans-serif" font-size="11" fill="#64748B">Peer-Reviewed Demo Publication Series - Educational Technology &amp; Engineering</text>
</svg>`;

const createProjectScreenshotSvg = (title, tech, author) => `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0F172A" rx="20" />
  <circle cx="40" cy="35" r="6" fill="#EF4444" />
  <circle cx="60" cy="35" r="6" fill="#F59E0B" />
  <circle cx="80" cy="35" r="6" fill="#10B981" />
  <rect x="120" y="22" width="560" height="26" rx="6" fill="#334155" />
  <text x="400" y="39" font-family="monospace" font-size="11" fill="#94A3B8" text-anchor="middle">https://demo-frontx-${(title || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}.vercel.app</text>
  <rect x="40" y="70" width="720" height="390" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2" />
  <text x="70" y="140" font-family="sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">${(title || '').replace(/&/g, '&amp;')}</text>
  <text x="70" y="175" font-family="sans-serif" font-size="14" fill="#94A3B8">Developer: ${(author || '').replace(/&/g, '&amp;')} | Dept of ETE</text>
  <rect x="70" y="210" width="660" height="150" rx="10" fill="#0F172A" stroke="#475569" />
  <text x="90" y="250" font-family="monospace" font-size="14" fill="#38BDF8">Tech Stack: ${(tech || '').replace(/&/g, '&amp;')}</text>
  <text x="90" y="285" font-family="monospace" font-size="12" fill="#A7F3D0">// DEMO Project Application Preview</text>
  <text x="90" y="310" font-family="monospace" font-size="12" fill="#FDE68A">// Status: Active &amp; Deployed (DEMO Data)</text>
</svg>`;

const createCertificateSvg = (title, org, recipient) => `<svg width="800" height="550" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="550" fill="#FFFFFF" rx="20" stroke="#059669" stroke-width="8" />
  <rect x="20" y="20" width="760" height="510" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="8 4" />
  <text x="400" y="90" font-family="serif" font-size="30" font-weight="bold" fill="#065F46" text-anchor="middle">CERTIFICATE OF ACHIEVEMENT</text>
  <text x="400" y="125" font-family="sans-serif" font-size="13" font-weight="bold" fill="#059669" text-anchor="middle">DEMO CREDENTIAL DATA</text>
  <text x="400" y="190" font-family="sans-serif" font-size="15" fill="#4B5563" text-anchor="middle">This is to certify that</text>
  <text x="400" y="240" font-family="serif" font-size="28" font-weight="bold" fill="#111827" text-anchor="middle">${(recipient || '').replace(/&/g, '&amp;')}</text>
  <text x="400" y="290" font-family="sans-serif" font-size="15" fill="#4B5563" text-anchor="middle">has successfully completed the DEMO certification course in</text>
  <text x="400" y="340" font-family="sans-serif" font-size="20" font-weight="bold" fill="#047857" text-anchor="middle">${(title || '').replace(/&/g, '&amp;')}</text>
  <text x="400" y="390" font-family="sans-serif" font-size="14" font-weight="bold" fill="#374151" text-anchor="middle">Issued by: ${(org || '').replace(/&/g, '&amp;')}</text>
  <line x1="150" y1="460" x2="350" y2="460" stroke="#9CA3AF" />
  <text x="250" y="485" font-family="sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">Issuing Organization</text>
  <line x1="450" y1="460" x2="650" y2="460" stroke="#9CA3AF" />
  <text x="550" y="485" font-family="sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">Credential Verification</text>
</svg>`;

const createResumeSvg = (name, focus, skills, dept, session, email) => `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1000" fill="#FFFFFF" rx="20" stroke="#E2E8F0" stroke-width="2" />
  <rect x="0" y="0" width="800" height="140" fill="#0F172A" />
  <text x="50" y="60" font-family="sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF">${(name || '').replace(/&/g, '&amp;')}</text>
  <text x="50" y="95" font-family="sans-serif" font-size="16" fill="#38BDF8">${(focus || '').replace(/&/g, '&amp;')} - Alumni Specialist</text>
  <text x="50" y="120" font-family="sans-serif" font-size="12" fill="#94A3B8">${email} | ${dept} (${session}) | DEMO RESUME</text>
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
  <text x="400" y="930" font-family="sans-serif" font-size="12" fill="#64748B" text-anchor="middle">Official FrontX Alumni Profile Document (DEMO Data - Verified)</text>
</svg>`;

const ENRICHMENT_DATA = [
  // 1. Arefin Rafi
  {
    email: 'arefin.rafi@std.uftb.ac.bd',
    name: 'Arefin Rafi',
    bio: 'Educational Data Scientist & AI Specialist focusing on predictive analytics and learning analytics to optimize student outcomes.',
    careerInterest: 'Artificial Intelligence & Educational Data Mining',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Learning Analytics', 'Educational Data Mining'],
    skills: ['Python', 'Machine Learning', 'Scikit-learn', 'Pandas', 'SQL', 'Data Visualization'],
    githubLink: 'https://github.com/demo-arefin-rafi',
    portfolioLink: 'https://demo-arefin-rafi.vercel.app',
    projects: [
      {
        title: 'Smart Student Performance Predictor',
        desc: 'An AI-driven predictive analytics tool utilizing machine learning models to analyze student study patterns, attendance, and quiz scores to identify at-risk students early.',
        tech: 'Python, Scikit-learn, Pandas, Flask, React',
        github: 'https://github.com/demo-frontx/smart-student-performance-predictor',
        demo: 'https://demo-frontx-student-predictor.vercel.app'
      },
      {
        title: 'AI-Based Learning Recommendation System',
        desc: 'An intelligent content recommendation engine that analyzes student performance gaps and suggests personalized learning modules and study resources.',
        tech: 'Python, TensorFlow, FastAPI, MongoDB, React',
        github: 'https://github.com/demo-frontx/ai-learning-recommendation',
        demo: 'https://demo-frontx-ai-recommender.vercel.app'
      },
      {
        title: 'Student Analytics Dashboard',
        desc: 'Interactive data visualization platform providing real-time insights into course completion rates, engagement metrics, and academic milestones.',
        tech: 'Python, Pandas, Plotly, Streamlit, PostgreSQL',
        github: 'https://github.com/demo-frontx/student-analytics-dashboard',
        demo: 'https://demo-frontx-analytics-dash.vercel.app'
      }
    ],
    research: [
      {
        title: 'Machine Learning Approaches for Predicting Student Academic Performance',
        desc: 'A comprehensive study investigating ensemble machine learning algorithms (Random Forest, XGBoost) for predicting student performance using early semester learning behavioral logs.',
        journal: 'IEEE Transactions on Learning Technologies (DEMO Data)',
        topic: 'Educational Data Mining / Machine Learning'
      }
    ],
    certificates: [
      {
        title: 'Python for Data Science & AI',
        desc: 'Comprehensive training in data analysis, data structures, and machine learning pipelines.',
        org: 'IBM / Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-arefin-1'
      },
      {
        title: 'Machine Learning Fundamentals',
        desc: 'Supervised, unsupervised learning, neural networks, and model evaluation techniques.',
        org: 'Stanford Online DEMO',
        link: 'https://stanford.edu/verify/demo-cert-arefin-2'
      },
      {
        title: 'Learning Analytics & Educational Data Mining Specialization',
        desc: 'Advanced methods for mining educational datasets to support student retention.',
        org: 'EdX DEMO',
        link: 'https://edx.org/verify/demo-cert-arefin-3'
      }
    ]
  },

  // 2. Naimul Islam
  {
    email: 'naimul.islam@std.uftb.ac.bd',
    name: 'Naimul Islam',
    bio: 'Full-Stack Software Engineer building resilient web portals and real-time collaboration platforms for modern education.',
    careerInterest: 'Full-Stack Web Development & EdTech Platforms',
    interests: ['Full-Stack Development', 'EdTech Platforms', 'Software Engineering', 'Web Development'],
    skills: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'REST API'],
    githubLink: 'https://github.com/demo-naimul-islam',
    portfolioLink: 'https://demo-naimul-islam.vercel.app',
    projects: [
      {
        title: 'University Career Portal',
        desc: 'Full-stack platform connecting graduating students with employers, featuring automated resume parsing, job application tracking, and recruiter dashboards.',
        tech: 'React, Node.js, Express.js, MongoDB, TailwindCSS',
        github: 'https://github.com/demo-frontx/university-career-portal',
        demo: 'https://demo-frontx-career-portal.vercel.app'
      },
      {
        title: 'Alumni Networking Platform',
        desc: 'Interactive social portal for university alumni to schedule mentorship sessions, share career opportunities, and collaborate on projects.',
        tech: 'React, Node.js, Socket.IO, Express.js, MongoDB',
        github: 'https://github.com/demo-frontx/alumni-networking-platform',
        demo: 'https://demo-frontx-alumni-network.vercel.app'
      },
      {
        title: 'Real-Time Student Collaboration App',
        desc: 'Collaborative workspace allowing students to work on shared study notes, draw diagrams, and chat in real-time.',
        tech: 'React, WebSockets, Node.js, Express.js, Redis',
        github: 'https://github.com/demo-frontx/student-collaboration-app',
        demo: 'https://demo-frontx-collab-app.vercel.app'
      }
    ],
    research: [
      {
        title: 'Modern Full-Stack Architectures for Scalable Educational Web Applications',
        desc: 'An empirical evaluation of microservices vs monolithic Node.js architectures in handling peak traffic during university enrollment and exam periods.',
        journal: 'International Journal of Educational Technology in Higher Education (DEMO Data)',
        topic: 'Full-Stack Web Development / EdTech'
      }
    ],
    certificates: [
      {
        title: 'Full-Stack Web Development with React & Node',
        desc: 'Mastery of front-end components, back-end API integration, and database operations.',
        org: 'Meta / Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-naimul-1'
      },
      {
        title: 'MongoDB Certified Developer Associate',
        desc: 'Advanced data modeling, aggregation framework, and index optimization.',
        org: 'MongoDB University DEMO',
        link: 'https://mongodb.com/verify/demo-cert-naimul-2'
      },
      {
        title: 'Modern JavaScript & React Masterclass',
        desc: 'State management, custom hooks, and production application architecture.',
        org: 'Udemy DEMO',
        link: 'https://udemy.com/verify/demo-cert-naimul-3'
      }
    ]
  },

  // 3. Sadia Hassan
  {
    email: 'sadia.hassan@std.uftb.ac.bd',
    name: 'Sadia Hassan',
    bio: 'Product Designer & HCI Researcher passionate about crafting intuitive, accessible digital learning environments.',
    careerInterest: 'UI/UX Design & Human-Computer Interaction',
    interests: ['UX/UI Design', 'Human-Computer Interaction', 'Digital Learning Experience', 'Usability Engineering'],
    skills: ['Figma', 'UI/UX Design', 'User Research', 'HTML', 'CSS', 'React'],
    githubLink: 'https://github.com/demo-sadia-hassan',
    portfolioLink: 'https://demo-sadia-hassan.vercel.app',
    projects: [
      {
        title: 'Smart Learning Dashboard Design',
        desc: 'Human-centered UI design and interactive prototype for an intuitive, accessible student dashboard focused on cognitive load reduction.',
        tech: 'Figma, UI/UX Design, User Testing, HTML, CSS, React',
        github: 'https://github.com/demo-frontx/smart-learning-dashboard-ux',
        demo: 'https://demo-frontx-ux-dashboard.figma.site'
      },
      {
        title: 'Student UX Research & Usability Testing Platform',
        desc: 'UX research toolkit enabling designers to capture student user journeys, heatmap interactions, and qualitative feedback during online learning.',
        tech: 'Figma, React, TailwindCSS, Usability Testing, User Research',
        github: 'https://github.com/demo-frontx/student-ux-research-platform',
        demo: 'https://demo-frontx-ux-research.vercel.app'
      }
    ],
    research: [
      {
        title: 'User Experience Design and Cognitive Load Optimization in Digital Learning Platforms',
        desc: 'A qualitative and quantitative study on how visual hierarchy, typography, and micro-interactions impact student focus and retention in digital LMS interfaces.',
        journal: 'ACM Transactions on Computer-Human Interaction (DEMO Data)',
        topic: 'Human-Computer Interaction / UX Design'
      }
    ],
    certificates: [
      {
        title: 'Google UX Design Professional Certificate',
        desc: 'End-to-end design process, wireframing, prototyping, and usability testing.',
        org: 'Google / Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-sadia-1'
      },
      {
        title: 'Human-Computer Interaction Specialization',
        desc: 'Cognitive principles, user research methods, and interactive design paradigms.',
        org: 'UC San Diego DEMO',
        link: 'https://coursera.org/verify/demo-cert-sadia-2'
      },
      {
        title: 'Advanced Interaction Design in Figma',
        desc: 'Design systems, auto-layout, interactive component variants, and prototyping.',
        org: 'Interaction Design Foundation DEMO',
        link: 'https://ixdf.org/verify/demo-cert-sadia-3'
      }
    ]
  },

  // 4. Yousuf Sohan
  {
    email: 'yousuf.sohan@std.uftb.ac.bd',
    name: 'Yousuf Sohan',
    bio: 'Cybersecurity Engineer focused on securing web applications, network protocols, and academic data repositories.',
    careerInterest: 'Cybersecurity & Network Infrastructure',
    interests: ['Cybersecurity', 'Network Security', 'Secure Web Applications', 'Ethical Hacking'],
    skills: ['Cybersecurity', 'Networking', 'Linux', 'Python', 'Network Analysis', 'Web Security'],
    githubLink: 'https://github.com/demo-yousuf-sohan',
    portfolioLink: 'https://demo-yousuf-sohan.vercel.app',
    projects: [
      {
        title: 'University Network Security & Threat Monitor',
        desc: 'Automated intrusion detection system monitoring university network traffic for unauthorized access attempts, DDoS signals, and vulnerability exploits.',
        tech: 'Python, Wireshark, Linux, Snort, Bash, Flask',
        github: 'https://github.com/demo-frontx/university-network-security-monitor',
        demo: 'https://demo-frontx-security-monitor.vercel.app'
      },
      {
        title: 'Secure Student Portal & Auth Gateway',
        desc: 'Zero-Trust authentication gateway implementing multi-factor authentication (MFA), encrypted sessions, and rate-limiting to protect student records.',
        tech: 'Python, OAuth2, JWT, Linux, Web Security, Redis',
        github: 'https://github.com/demo-frontx/secure-student-portal',
        demo: 'https://demo-frontx-secure-auth.vercel.app'
      }
    ],
    research: [
      {
        title: 'Cybersecurity Challenges and Vulnerability Mitigations in Modern University E-Learning Platforms',
        desc: 'An assessment of security vulnerabilities in web-based learning management systems, proposing robust OAuth2 and Zero-Trust architecture solutions.',
        journal: 'Computers & Security Journal (DEMO Data)',
        topic: 'Cybersecurity / Network Security'
      }
    ],
    certificates: [
      {
        title: 'CompTIA Security+ Certified',
        desc: 'System security, threat management, vulnerability identification, and compliance.',
        org: 'CompTIA DEMO',
        link: 'https://comptia.org/verify/demo-cert-yousuf-1'
      },
      {
        title: 'Certified Ethical Hacker (CEH)',
        desc: 'Penetration testing methodology, ethical hacking techniques, and countermeasures.',
        org: 'EC-Council DEMO',
        link: 'https://eccouncil.org/verify/demo-cert-yousuf-2'
      },
      {
        title: 'Web Application Security Fundamentals',
        desc: 'OWASP Top 10 vulnerabilities, secure coding practices, and security audits.',
        org: 'SANS Institute DEMO',
        link: 'https://sans.org/verify/demo-cert-yousuf-3'
      }
    ]
  },

  // 5. Alvy Arnob
  {
    email: 'alvy.arnob@std.uftb.ac.bd',
    name: 'Alvy Arnob',
    bio: 'Data Analyst & Educational Data Scientist leveraging SQL, Python, and Power BI to extract insights from academic metrics.',
    careerInterest: 'Data Science & Educational Analytics',
    interests: ['Data Science', 'Data Analytics', 'Educational Data Mining', 'Big Data'],
    skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Power BI', 'Machine Learning'],
    githubLink: 'https://github.com/demo-alvy-arnob',
    portfolioLink: 'https://demo-alvy-arnob.vercel.app',
    projects: [
      {
        title: 'Student Academic Analytics Dashboard',
        desc: 'Executive data analytics platform visualizing multi-year student retention trends, grade distribution, and course success metrics across departments.',
        tech: 'Python, Pandas, Power BI, SQL, NumPy, Streamlit',
        github: 'https://github.com/demo-frontx/student-academic-analytics-dash',
        demo: 'https://demo-frontx-academic-analytics.vercel.app'
      },
      {
        title: 'Academic Dropout Risk Prediction System',
        desc: 'Data science pipeline analyzing historical academic data to calculate dropout risk scores and trigger early intervention alerts for academic advisors.',
        tech: 'Python, Scikit-learn, Pandas, PostgreSQL, Flask',
        github: 'https://github.com/demo-frontx/academic-risk-prediction-system',
        demo: 'https://demo-frontx-risk-predictor.vercel.app'
      }
    ],
    research: [
      {
        title: 'Educational Data Mining Techniques for Early Student Success and Retention Prediction',
        desc: 'Applying clustering and classification algorithms on student LMS engagement logs to build predictive models for undergraduate academic retention.',
        journal: 'Journal of Educational Data Mining (DEMO Data)',
        topic: 'Educational Data Mining / Data Science'
      }
    ],
    certificates: [
      {
        title: 'Google Data Analytics Professional Certificate',
        desc: 'Data cleaning, SQL querying, R programming, data visualization, and storytelling.',
        org: 'Google DEMO',
        link: 'https://coursera.org/verify/demo-cert-alvy-1'
      },
      {
        title: 'Data Science with Python & SQL Specialization',
        desc: 'Advanced data manipulation with Pandas, statistical modeling, and relational DBs.',
        org: 'Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-alvy-2'
      },
      {
        title: 'Microsoft Certified: Power BI Data Analyst Associate',
        desc: 'DAX modeling, interactive report building, and business intelligence dashboards.',
        org: 'Microsoft DEMO',
        link: 'https://microsoft.com/verify/demo-cert-alvy-3'
      }
    ]
  },

  // 6. Mahim Khan
  {
    email: 'mahim.khan@std.uftb.ac.bd',
    name: 'Mahim Khan',
    bio: 'Cloud Architect & DevOps Engineer specializing in AWS cloud infrastructure, container orchestration, and automated CI/CD pipelines.',
    careerInterest: 'Cloud Computing & DevOps Architecture',
    interests: ['Cloud Computing', 'DevOps', 'Scalable Web Applications', 'Infrastructure as Code'],
    skills: ['AWS', 'Docker', 'Node.js', 'MongoDB', 'CI/CD', 'Linux'],
    githubLink: 'https://github.com/demo-mahim-khan',
    portfolioLink: 'https://demo-mahim-khan.vercel.app',
    projects: [
      {
        title: 'Cloud-Based Learning Platform Infrastructure',
        desc: 'Scalable cloud infrastructure deployment using Docker containers, Nginx reverse proxy, and automated CI/CD pipelines for high-traffic educational portals.',
        tech: 'AWS, Docker, GitHub Actions, Nginx, Node.js, Linux',
        github: 'https://github.com/demo-frontx/cloud-based-learning-platform-infra',
        demo: 'https://demo-frontx-cloud-infra.vercel.app'
      },
      {
        title: 'Student File Storage & CDN System',
        desc: 'High-availability cloud object storage gateway enabling fast, secure distribution of lecture notes, video recordings, and study resources.',
        tech: 'AWS S3, CloudFront, Docker, Node.js, Express.js',
        github: 'https://github.com/demo-frontx/student-file-storage-cdn',
        demo: 'https://demo-frontx-cloud-cdn.vercel.app'
      }
    ],
    research: [
      {
        title: 'Cloud Infrastructure Optimization and Containerization for Scalable Educational Platforms',
        desc: 'A performance evaluation of auto-scaling containerized cloud architectures in handling sudden spike loads during online university examinations.',
        journal: 'IEEE Cloud Computing Journal (DEMO Data)',
        topic: 'Cloud Computing / DevOps'
      }
    ],
    certificates: [
      {
        title: 'AWS Certified Solutions Architect – Associate',
        desc: 'Designing resilient, high-performing, secure, and cost-optimized cloud architectures.',
        org: 'Amazon Web Services DEMO',
        link: 'https://aws.amazon.com/verify/demo-cert-mahim-1'
      },
      {
        title: 'Docker Certified Associate (DCA)',
        desc: 'Container management, swarm orchestration, image security, and cloud deployment.',
        org: 'Docker Inc. DEMO',
        link: 'https://docker.com/verify/demo-cert-mahim-2'
      },
      {
        title: 'DevOps Engineering & CI/CD Masterclass',
        desc: 'Infrastructure as code, Jenkins/GitHub Actions, and production release pipelines.',
        org: 'Udemy DEMO',
        link: 'https://udemy.com/verify/demo-cert-mahim-3'
      }
    ]
  },

  // 7. Shoccho Islam
  {
    email: 'shoccho.islam@std.uftb.ac.bd',
    name: 'Shoccho Islam',
    bio: 'Mobile App Developer building cross-platform Flutter and native Android solutions for digital learning and student communication.',
    careerInterest: 'Mobile Application Development & Digital Education',
    interests: ['Mobile Application Development', 'Android', 'Digital Education', 'Cross-Platform Mobile Apps'],
    skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Mobile UI Design'],
    githubLink: 'https://github.com/demo-shoccho-islam',
    portfolioLink: 'https://demo-shoccho-islam.vercel.app',
    projects: [
      {
        title: 'Student Learning Mobile App',
        desc: 'Cross-platform Flutter mobile application enabling students to access course outlines, track assignment deadlines, and download lecture notes offline.',
        tech: 'Flutter, Dart, Firebase, REST API, SQLite',
        github: 'https://github.com/demo-frontx/student-learning-mobile-app',
        demo: 'https://demo-frontx-mobile-app.vercel.app'
      },
      {
        title: 'Campus Real-Time Notification App',
        desc: 'Push-notification driven Android application delivering urgent campus announcements, exam schedules, and emergency alerts to students.',
        tech: 'Flutter, Dart, Firebase Cloud Messaging, REST API',
        github: 'https://github.com/demo-frontx/campus-notification-app',
        demo: 'https://demo-frontx-campus-notify.vercel.app'
      }
    ],
    research: [
      {
        title: 'Mobile Learning Applications and Their Impact on Student Engagement in Higher Education',
        desc: 'Investigating how mobile push notifications, offline study sync, and micro-learning mobile interfaces affect daily student study habits and course completion.',
        journal: 'Computers & Education Journal (DEMO Data)',
        topic: 'Mobile Application Development / Mobile Learning'
      }
    ],
    certificates: [
      {
        title: 'Google Certified Associate Android Developer',
        desc: 'Android SDK, Kotlin/Java application architecture, background tasks, and UI testing.',
        org: 'Google DEMO',
        link: 'https://developer.android.com/verify/demo-cert-shoccho-1'
      },
      {
        title: 'Flutter & Dart - Complete Mobile App Development',
        desc: 'Cross-platform mobile engineering, state management (Provider/Bloc), and native APIs.',
        org: 'Udemy DEMO',
        link: 'https://udemy.com/verify/demo-cert-shoccho-2'
      },
      {
        title: 'Firebase for Mobile Developers',
        desc: 'Real-time database, authentication, push notifications, and cloud functions.',
        org: 'Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-shoccho-3'
      }
    ]
  },

  // 8. Prapto Mahmud
  {
    email: 'prapto.mahmud@std.uftb.ac.bd',
    name: 'Prapto Mahmud',
    bio: 'Embedded Systems & IoT Engineer designing smart campus sensor networks and environmental monitoring solutions.',
    careerInterest: 'Internet of Things (IoT) & Smart Campus Systems',
    interests: ['IoT', 'Smart Campus', 'Embedded Systems', 'Sensor Networks'],
    skills: ['Arduino', 'IoT', 'C/C++', 'Sensors', 'Python', 'Embedded Systems'],
    githubLink: 'https://github.com/demo-prapto-mahmud',
    portfolioLink: 'https://demo-prapto-mahmud.vercel.app',
    projects: [
      {
        title: 'Smart Classroom Monitoring System',
        desc: 'IoT-enabled classroom environmental monitoring device tracking temperature, noise levels, seating occupancy, and air quality in real-time.',
        tech: 'Arduino, ESP32, C/C++, MQTT, Python, IoT Sensors',
        github: 'https://github.com/demo-frontx/smart-classroom-monitoring-system',
        demo: 'https://demo-frontx-smart-classroom.vercel.app'
      },
      {
        title: 'IoT-Based Campus Environment Monitor',
        desc: 'Distributed wireless sensor network capturing weather parameters, energy consumption, and lighting conditions across university buildings.',
        tech: 'IoT, Raspberry Pi, Python, C/C++, Node-RED, InfluxDB',
        github: 'https://github.com/demo-frontx/iot-campus-environment-monitor',
        demo: 'https://demo-frontx-campus-iot.vercel.app'
      }
    ],
    research: [
      {
        title: 'IoT-Based Smart Classroom Monitoring Architecture for Energy Efficiency and Environmental Comfort',
        desc: 'Proposing a low-cost IoT sensor architecture to optimize classroom HVAC and lighting based on real-time occupancy and environmental feedback.',
        journal: 'IEEE Internet of Things Journal (DEMO Data)',
        topic: 'IoT / Smart Campus / Embedded Systems'
      }
    ],
    certificates: [
      {
        title: 'Introduction to the Internet of Things (IoT)',
        desc: 'Sensor integration, wireless protocol standards (MQTT/CoAP), and edge computing.',
        org: 'Stanford Online DEMO',
        link: 'https://stanford.edu/verify/demo-cert-prapto-1'
      },
      {
        title: 'Embedded Systems Design with C/C++',
        desc: 'Microcontroller programming, hardware interrupts, and real-time operating systems.',
        org: 'ARM Education DEMO',
        link: 'https://arm.com/verify/demo-cert-prapto-2'
      },
      {
        title: 'Arduino & Raspberry Pi Hardware Masterclass',
        desc: 'Circuit design, sensor wiring, actuators, and Python gateway integration.',
        org: 'Udemy DEMO',
        link: 'https://udemy.com/verify/demo-cert-prapto-3'
      }
    ]
  },

  // 9. Shahriar Hassan
  {
    email: 'shahriar.hassan@std.uftb.ac.bd',
    name: 'Shahriar Hassan',
    bio: 'Software Architect & Backend Engineer with expertise in Java Spring Boot, microservices, and database tuning.',
    careerInterest: 'Software Engineering & Distributed Backend Systems',
    interests: ['Software Engineering', 'Backend Development', 'Database Systems', 'Distributed Systems'],
    skills: ['Java', 'Node.js', 'MongoDB', 'PostgreSQL', 'REST API', 'Software Architecture'],
    githubLink: 'https://github.com/demo-shahriar-hassan',
    portfolioLink: 'https://demo-shahriar-hassan.vercel.app',
    projects: [
      {
        title: 'University Management API Gateway',
        desc: 'High-performance microservices API gateway handling student registration, course scheduling, and grade processing with rate limiting and caching.',
        tech: 'Java, Spring Boot, PostgreSQL, Redis, REST API, Docker',
        github: 'https://github.com/demo-frontx/university-management-api',
        demo: 'https://demo-frontx-univ-api.vercel.app'
      },
      {
        title: 'Career Management Backend Engine',
        desc: 'High-throughput backend service powering job applications, interview scheduling, and automated notification dispatches for university career centers.',
        tech: 'Node.js, Express.js, MongoDB, PostgreSQL, RabbitMQ',
        github: 'https://github.com/demo-frontx/career-management-backend',
        demo: 'https://demo-frontx-career-backend.vercel.app'
      }
    ],
    research: [
      {
        title: 'Scalable Backend Architecture and Database Optimization Patterns for University Management Systems',
        desc: 'Comparative analysis of relational (PostgreSQL) vs document (MongoDB) databases in handling concurrent student registration traffic spikes.',
        journal: 'IEEE Software Journal (DEMO Data)',
        topic: 'Software Engineering / Backend Systems'
      }
    ],
    certificates: [
      {
        title: 'Oracle Certified Professional: Java SE Developer',
        desc: 'Advanced OOP principles, concurrency models, streams API, and memory management.',
        org: 'Oracle DEMO',
        link: 'https://oracle.com/verify/demo-cert-shahriar-1'
      },
      {
        title: 'Software Architecture & Design Patterns',
        desc: 'Monolithic vs microservice trade-offs, domain-driven design, and system reliability.',
        org: 'Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-shahriar-2'
      },
      {
        title: 'Node.js & Microservices Masterclass',
        desc: 'Message queues, RPC protocols, rate limiting, and API security.',
        org: 'Udemy DEMO',
        link: 'https://udemy.com/verify/demo-cert-shahriar-3'
      }
    ]
  },

  // 10. Nahin Rahman
  {
    email: 'nahin.rahman@std.uftb.ac.bd',
    name: 'Nahin Rahman',
    bio: 'EdTech Product Manager & LMS Architect focusing on digital learning platforms, e-assessment tools, and online student engagement.',
    careerInterest: 'E-Learning Systems & Educational Technology',
    interests: ['E-Learning', 'Learning Management Systems', 'Educational Technology', 'Digital Content Authoring'],
    skills: ['React', 'Node.js', 'MongoDB', 'LMS Design', 'JavaScript', 'Educational Technology'],
    githubLink: 'https://github.com/demo-nahin-rahman',
    portfolioLink: 'https://demo-nahin-rahman.vercel.app',
    projects: [
      {
        title: 'Digital Learning Management System (LMS)',
        desc: 'Feature-rich open-source LMS supporting video lectures, interactive quizzes, automated grading, and peer-to-peer discussion forums.',
        tech: 'React, Node.js, Express.js, MongoDB, WebRTC',
        github: 'https://github.com/demo-frontx/digital-lms-platform',
        demo: 'https://demo-frontx-lms.vercel.app'
      },
      {
        title: 'Online Assessment & Quiz Platform',
        desc: 'Interactive online test environment with automated timer, instant scoring, question randomization, and detailed analytical report generation.',
        tech: 'React, JavaScript, Node.js, MongoDB, TailwindCSS',
        github: 'https://github.com/demo-frontx/online-assessment-platform',
        demo: 'https://demo-frontx-assessment.vercel.app'
      }
    ],
    research: [
      {
        title: 'Digital Learning Systems and Their Effectiveness on Online Student Engagement and Skill Acquisition',
        desc: 'Evaluating student engagement metrics in interactive LMS platforms compared to traditional static lecture video repository systems.',
        journal: 'British Journal of Educational Technology (DEMO Data)',
        topic: 'Educational Technology / E-Learning Systems'
      }
    ],
    certificates: [
      {
        title: 'Instructional Design & E-Learning Technology',
        desc: 'ADDIE framework, digital pedagogy, course authoring tools, and learning assessment.',
        org: 'University of Maryland DEMO',
        link: 'https://coursera.org/verify/demo-cert-nahin-1'
      },
      {
        title: 'Building Modern Web Apps with React',
        desc: 'React component design, state management, and modern Web APIs.',
        org: 'Meta DEMO',
        link: 'https://coursera.org/verify/demo-cert-nahin-2'
      },
      {
        title: 'Educational Technology Specialization',
        desc: 'EdTech product strategy, virtual classrooms, and digital learning analytics.',
        org: 'Coursera DEMO',
        link: 'https://coursera.org/verify/demo-cert-nahin-3'
      }
    ]
  }
];

const connectToDb = async () => {
  const uris = [
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27017/frontx_db'
  ].filter(Boolean);

  for (const uri of uris) {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected successfully to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      return;
    } catch (e) {
      // try next
    }
  }
  throw new Error('Failed to connect to any DB');
};

const processEnrichment = async () => {
  try {
    await connectToDb();

    let updatedCount = 0;
    let failedCount = 0;

    for (const item of ENRICHMENT_DATA) {
      console.log(`\nProcessing profile for: ${item.name} (${item.email})...`);
      
      const user = await User.findOne({ email: item.email.toLowerCase() });
      if (!user) {
        console.error(`❌ User not found: ${item.email}`);
        failedCount++;
        continue;
      }

      // Generate Cloudinary visual assets for each project, research paper, certificate, and resume
      const enrichedProjects = [];
      for (const proj of item.projects) {
        const svg = createProjectScreenshotSvg(proj.title, proj.tech, item.name);
        const imageUrl = await uploadSvgToCloudinary(svg, `proj_${item.name}`);
        enrichedProjects.push({
          title: proj.title,
          desc: proj.desc,
          tech: proj.tech,
          github: proj.github,
          demo: proj.demo,
          image: imageUrl
        });
      }

      const enrichedResearch = [];
      for (const res of item.research) {
        const svg = createResearchCoverSvg(res.title, item.name, res.topic);
        const coverUrl = await uploadSvgToCloudinary(svg, `res_${item.name}`);
        enrichedResearch.push({
          title: res.title,
          desc: res.desc,
          journal: res.journal,
          topic: res.topic,
          pdfUrl: coverUrl // Cloudinary hosted research visual document
        });
      }

      const enrichedCertificates = [];
      for (const cert of item.certificates) {
        const svg = createCertificateSvg(cert.title, cert.org, item.name);
        const certUrl = await uploadSvgToCloudinary(svg, `cert_${item.name}`);
        enrichedCertificates.push({
          title: cert.title,
          desc: cert.desc,
          org: cert.org,
          link: cert.link,
          fileUrl: certUrl
        });
      }

      // Generate Cloudinary Resume URL
      const resumeSvg = createResumeSvg(item.name, item.careerInterest, item.skills, user.department || 'Educational Technology and Engineering', user.session || '17-18', item.email);
      const resumeCloudinaryUrl = await uploadSvgToCloudinary(resumeSvg, `cv_${item.name}`);

      // Combine interests + skills into interests array so both appear in profile badges
      const combinedInterests = Array.from(new Set([...item.interests, ...item.skills]));

      user.bio = item.bio;
      user.careerInterest = item.careerInterest;
      user.interests = combinedInterests;
      user.githubLink = item.githubLink;
      user.portfolioLink = item.portfolioLink;
      user.resumeUrl = resumeCloudinaryUrl;
      user.projects = enrichedProjects;
      user.research = enrichedResearch;
      user.certificates = enrichedCertificates;

      await user.save();
      console.log(`✅ [ENRICHED] Updated profile for ${item.name}`);
      updatedCount++;
    }

    console.log('\n==========================================');
    console.log('       ALUMNI PROFILE ENRICHMENT COMPLETE ');
    console.log('==========================================');
    console.log(`Total Alumni Updated: ${updatedCount} / 10`);
    console.log(`Total Alumni Failed: ${failedCount}`);
    console.log('==========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Enrichment script error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

processEnrichment();
