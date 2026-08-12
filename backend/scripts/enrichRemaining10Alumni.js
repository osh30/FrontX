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

// SVG Generators for clean, valid, professional visual assets (NO prohibited words)
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

const REMAINING_10_ALUMNI = [
  // 1. Shayna Islam
  {
    email: 'shayna.islam@std.uftb.ac.bd',
    name: 'Shayna Islam',
    bio: 'Strategic EdTech marketer and digital growth specialist optimizing course adoption, educational campaign analytics, and student engagement platforms.',
    careerInterest: 'Digital Marketing & EdTech Strategy',
    interests: ['Digital Marketing', 'EdTech Strategy', 'Product Management', 'Growth Analytics'],
    skills: ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Strategy', 'Social Media Marketing', 'Data Analytics'],
    githubLink: 'https://github.com/shayna-islam',
    portfolioLink: 'https://shayna-islam.frontx.app',
    projects: [
      {
        title: 'EdTech Student Acquisition Portal',
        desc: 'Analytics-driven marketing portal tracking conversion funnels, ad performance, and student enrollment metrics across university digital courses.',
        tech: 'Google Analytics, React, Node.js, SEO, Meta Ads API',
        github: 'https://github.com/frontx-projects/edtech-acquisition-portal',
        demo: 'https://edtech-acquisition.frontx.app'
      },
      {
        title: 'University Brand & Content Strategy Suite',
        desc: 'Digital content management platform providing structured editorial workflows, SEO optimization tools, and social media scheduling for academic departments.',
        tech: 'React, Express.js, MongoDB, Content Strategy, TailwindCSS',
        github: 'https://github.com/frontx-projects/brand-content-suite',
        demo: 'https://brand-content.frontx.app'
      },
      {
        title: 'Student Engagement Campaign Tracker',
        desc: 'Real-time dashboard capturing student responses to email newsletters, webinar registrations, and orientation campaign outreach.',
        tech: 'Python, Streamlit, PostgreSQL, Email API, Chart.js',
        github: 'https://github.com/frontx-projects/engagement-campaign-tracker',
        demo: 'https://campaign-tracker.frontx.app'
      }
    ],
    research: [
      {
        title: 'Digital Marketing Strategies for Higher Education Student Retention and Course Enrollment',
        desc: 'Empirical study assessing the impact of personalized email campaigns and social media outreach on online course registration rates.',
        journal: 'Journal of Marketing for Higher Education',
        topic: 'Digital Marketing / EdTech Strategy',
        year: '2024'
      }
    ],
    certificates: [
      {
        title: 'Google Digital Marketing & E-commerce Professional Certificate',
        desc: 'Comprehensive training in digital ads, email marketing, analytics, and conversion funnels.',
        org: 'Google',
        link: 'https://coursera.org/verify/cert-shayna-1',
        date: '2023'
      },
      {
        title: 'HubSpot Content Marketing Certified',
        desc: 'Inbound marketing strategy, content creation frameworks, and customer journey mapping.',
        org: 'HubSpot Academy',
        link: 'https://hubspot.com/verify/cert-shayna-2',
        date: '2023'
      },
      {
        title: 'Product Management Fundamentals',
        desc: 'User research, feature prioritization, product roadmapping, and growth strategies.',
        org: 'Product School',
        link: 'https://productschool.com/verify/cert-shayna-3',
        date: '2024'
      }
    ]
  },

  // 2. Prapty Chowdhury
  {
    email: 'prapty.chowdhury@std.uftb.ac.bd',
    name: 'Prapty Chowdhury',
    bio: 'EdTech Product Manager with expertise in user roadmap execution, backlog prioritization, and cross-functional team alignment for academic platforms.',
    careerInterest: 'Product Management & Educational Systems Analysis',
    interests: ['Product Management', 'Educational Technology', 'Systems Analysis', 'Agile & Scrum'],
    skills: ['Product Management', 'Jira', 'Agile/Scrum', 'User Stories', 'Roadmapping', 'System Analysis'],
    githubLink: 'https://github.com/prapty-chowdhury',
    portfolioLink: 'https://prapty-chowdhury.frontx.app',
    projects: [
      {
        title: 'Academic Course Roadmap & Planning System',
        desc: 'Product management application enabling course directors to map curriculum milestones, assign prerequisite flows, and manage syllabus release sprints.',
        tech: 'React, Node.js, Express.js, MongoDB, Jira API',
        github: 'https://github.com/frontx-projects/course-roadmap-system',
        demo: 'https://course-roadmap.frontx.app'
      },
      {
        title: 'Student Feature Feedback & Backlog Portal',
        desc: 'User feedback aggregator gathering student feature requests, voting on platform updates, and prioritizing engineering sprint tasks.',
        tech: 'React, Redux, Node.js, PostgreSQL, TailwindCSS',
        github: 'https://github.com/frontx-projects/student-feedback-portal',
        demo: 'https://feedback-portal.frontx.app'
      }
    ],
    research: [
      {
        title: 'Agile Frameworks and Product Roadmap Alignment in University Educational Software',
        desc: 'Research investigating how Agile methodology adoption improves software delivery cycles and stakeholder satisfaction in university IT departments.',
        journal: 'International Journal of Managing Projects in Business',
        topic: 'Product Management / Educational Systems',
        year: '2023'
      }
    ],
    certificates: [
      {
        title: 'Certified Scrum Product Owner (CSPO)',
        desc: 'Backlog grooming, user story mapping, customer value delivery, and sprint planning.',
        org: 'Scrum Alliance',
        link: 'https://scrumalliance.org/verify/cert-prapty-1',
        date: '2023'
      },
      {
        title: 'Product Management Specialization',
        desc: 'Product strategy, market analysis, user prototyping, and metric tracking.',
        org: 'Northwestern University',
        link: 'https://coursera.org/verify/cert-prapty-2',
        date: '2024'
      },
      {
        title: 'Agile Leadership in Higher Education',
        desc: 'Transformative organizational leadership and iterative software delivery in academia.',
        org: 'EdX',
        link: 'https://edx.org/verify/cert-prapty-3',
        date: '2024'
      }
    ]
  },

  // 3. Rayhana Islam
  {
    email: 'rayhana.islam@std.uftb.ac.bd',
    name: 'Rayhana Islam',
    bio: 'Educational researcher specializing in psychometrics, student assessment frameworks, and quantitative learning research design.',
    careerInterest: 'Educational Research Methodology & Learning Assessment',
    interests: ['Educational Research', 'Learning Assessment', 'Psychometrics', 'Instructional Design'],
    skills: ['SPSS', 'R', 'Research Methodology', 'Statistical Analysis', 'Educational Assessment', 'Data Collection'],
    githubLink: 'https://github.com/rayhana-islam',
    portfolioLink: 'https://rayhana-islam.frontx.app',
    projects: [
      {
        title: 'Automated Assessment & Psychometric Analyzer',
        desc: 'Statistical web tool calculating item difficulty, discrimination index, and Cronbach alpha reliability for university exam question banks.',
        tech: 'R, Shiny, Python, SPSS, SQLite',
        github: 'https://github.com/frontx-projects/psychometric-analyzer',
        demo: 'https://psychometric-analyzer.frontx.app'
      },
      {
        title: 'Student Survey & Learning Outcomes Platform',
        desc: 'Research survey tool collecting structured quantitative feedback on curriculum design and mapping responses to blooms taxonomy levels.',
        tech: 'React, Python, Django, PostgreSQL, D3.js',
        github: 'https://github.com/frontx-projects/learning-outcomes-platform',
        demo: 'https://learning-outcomes.frontx.app'
      }
    ],
    research: [
      {
        title: 'Psychometric Evaluation of Online Multiple-Choice Testing in Undergraduate STEM Education',
        desc: 'Quantitative research examining test validity, distractor efficiency, and item discrimination in remote learning assessments.',
        journal: 'Educational Assessment, Evaluation and Accountability',
        topic: 'Educational Research / Learning Assessment',
        year: '2024'
      }
    ],
    certificates: [
      {
        title: 'Quantitative Methods & Statistical Analysis with R',
        desc: 'Hypothesis testing, regression modeling, ANOVA, and multivariate data analysis.',
        org: 'Johns Hopkins University',
        link: 'https://coursera.org/verify/cert-rayhana-1',
        date: '2023'
      },
      {
        title: 'Educational Measurement & Assessment',
        desc: 'Test item design, rubric construction, validity evidence, and psychometric evaluation.',
        org: 'University of Illinois',
        link: 'https://coursera.org/verify/cert-rayhana-2',
        date: '2023'
      },
      {
        title: 'Advanced Research Methodology',
        desc: 'Experimental and quasi-experimental research designs in educational sciences.',
        org: 'EdX',
        link: 'https://edx.org/verify/cert-rayhana-3',
        date: '2024'
      }
    ]
  },

  // 4. Onti Mahmud
  {
    email: 'onti.mahmud@std.uftb.ac.bd',
    name: 'Onti Mahmud',
    bio: 'EdTech Business Analyst translating complex academic operational requirements into streamlined software specifications and process workflows.',
    careerInterest: 'Business Analysis & EdTech Operations',
    interests: ['Business Analysis', 'Process Modeling', 'Requirements Engineering', 'EdTech Operations'],
    skills: ['SQL', 'BPMN', 'Business Analysis', 'Tableau', 'Excel / VBA', 'Requirements Engineering'],
    githubLink: 'https://github.com/onti-mahmud',
    portfolioLink: 'https://onti-mahmud.frontx.app',
    projects: [
      {
        title: 'University Operations & Course Scheduling Optimizer',
        desc: 'Business intelligence model optimizing lecture hall allocation, lab capacity utilization, and professor availability matrix.',
        tech: 'Python, SQL, Tableau, Excel VBA, BPMN 2.0',
        github: 'https://github.com/frontx-projects/scheduling-optimizer',
        demo: 'https://scheduling-optimizer.frontx.app'
      },
      {
        title: 'Departmental Resource Planning Portal',
        desc: 'Operational workflow portal tracking equipment requisitions, budget expenditure streams, and departmental software license grants.',
        tech: 'React, Node.js, Express.js, PostgreSQL, TailwindCSS',
        github: 'https://github.com/frontx-projects/resource-planning-portal',
        demo: 'https://resource-planning.frontx.app'
      }
    ],
    research: [
      {
        title: 'Optimizing University Resource Allocation Through Business Process Model Standardization',
        desc: 'Case study analyzing process modeling (BPMN) to reduce administrative approval delays in university grant allocations.',
        journal: 'Business Process Management Journal',
        topic: 'Business Analysis / Process Modeling',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'Entry Certificate in Business Analysis (ECBA)',
        desc: 'Requirements elicitation, process modeling, business architecture, and solution assessment.',
        org: 'IIBA',
        link: 'https://iiba.org/verify/cert-onti-1',
        date: '2024'
      },
      {
        title: 'Tableau Desktop Specialist',
        desc: 'Data connection, chart calculations, dashboard storyboards, and visual analytics.',
        org: 'Tableau',
        link: 'https://tableau.com/verify/cert-onti-2',
        date: '2024'
      },
      {
        title: 'Business Process Modeling & BPMN 2.0',
        desc: 'Mapping complex operational workflows, process automation, and efficiency gains.',
        org: 'Udemy',
        link: 'https://udemy.com/verify/cert-onti-3',
        date: '2025'
      }
    ]
  },

  // 5. Safwat Chowdhury
  {
    email: 'safwat.chowdhury@std.uftb.ac.bd',
    name: 'Safwat Chowdhury',
    bio: 'AI researcher focused on Natural Language Processing (NLP), automated essay feedback generation, and intelligent tutoring assistants.',
    careerInterest: 'Artificial Intelligence & Natural Language Processing in Education',
    interests: ['Artificial Intelligence', 'Natural Language Processing', 'Machine Learning', 'Intelligent Tutoring'],
    skills: ['Python', 'PyTorch', 'NLP', 'Transformers', 'FastAPI', 'HuggingFace'],
    githubLink: 'https://github.com/safwat-chowdhury',
    portfolioLink: 'https://safwat-chowdhury.frontx.app',
    projects: [
      {
        title: 'AI Automated Essay Feedback Assistant',
        desc: 'NLP application evaluating student essay coherence, grammar syntax, and thesis strength with constructive AI writing suggestions.',
        tech: 'Python, PyTorch, HuggingFace, FastAPI, React',
        github: 'https://github.com/frontx-projects/ai-essay-feedback-assistant',
        demo: 'https://essay-assistant.frontx.app'
      },
      {
        title: 'Intelligent Query Answering Bot for Course Syllabi',
        desc: 'RAG-based AI chatbot providing instant answers to student questions regarding course grading criteria, assignment deadlines, and office hours.',
        tech: 'Python, LangChain, OpenAI API, VectorDB, React',
        github: 'https://github.com/frontx-projects/syllabus-ai-bot',
        demo: 'https://syllabus-bot.frontx.app'
      }
    ],
    research: [
      {
        title: 'Natural Language Processing for Automated Constructive Feedback in Higher Education Writing',
        desc: 'Research introducing a transformer-based model fine-tuned for generating qualitative feedback on undergraduate academic essays.',
        journal: 'IEEE Transactions on Affective Computing',
        topic: 'Artificial Intelligence / Natural Language Processing',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'Natural Language Processing Specialization',
        desc: 'Sequence models, attention mechanisms, sentiment analysis, and transformer pipelines.',
        org: 'DeepLearning.AI',
        link: 'https://coursera.org/verify/cert-safwat-1',
        date: '2024'
      },
      {
        title: 'PyTorch for Deep Learning & AI',
        desc: 'Building, training, and deploying deep neural network models with PyTorch.',
        org: 'Udacity',
        link: 'https://udacity.com/verify/cert-safwat-2',
        date: '2024'
      },
      {
        title: 'Transformer Architectures Masterclass',
        desc: 'BERT, GPT, T5 model fine-tuning for domain-specific NLP applications.',
        org: 'HuggingFace',
        link: 'https://huggingface.co/verify/cert-safwat-3',
        date: '2025'
      }
    ]
  },

  // 6. Maria Khan
  {
    email: 'maria.khan@std.uftb.ac.bd',
    name: 'Maria Khan',
    bio: 'Front-End Engineer dedicated to constructing responsive, accessible, and high-performance Web application interfaces for interactive e-learning.',
    careerInterest: 'Front-End Engineering & Interactive Learning UI',
    interests: ['Web Development', 'Front-End Engineering', 'Interactive UI', 'Accessibility (a11y)'],
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Web Accessibility', 'CSS3'],
    githubLink: 'https://github.com/maria-khan',
    portfolioLink: 'https://maria-khan.frontx.app',
    projects: [
      {
        title: 'Interactive Virtual Science Lab UI',
        desc: 'Accessible web application providing interactive 2D canvas simulations for physics and chemistry laboratory experiments.',
        tech: 'React, TypeScript, HTML5 Canvas, TailwindCSS, Web Audio API',
        github: 'https://github.com/frontx-projects/virtual-science-lab-ui',
        demo: 'https://science-lab.frontx.app'
      },
      {
        title: 'Student Study Notebook & Flashcard App',
        desc: 'High-performance React web application featuring spaced repetition flashcard decks, markdown note-taking, and customizable study themes.',
        tech: 'Next.js, TypeScript, TailwindCSS, IndexedDB, Framer Motion',
        github: 'https://github.com/frontx-projects/flashcard-notebook-app',
        demo: 'https://flashcard-notebook.frontx.app'
      }
    ],
    research: [
      {
        title: 'Enhancing Web Accessibility (WCAG 2.1) in Modern Single Page Applications for Distance Education',
        desc: 'Empirical study measuring accessibility score improvements in React applications using screen readers and keyboard navigation protocols.',
        journal: 'Universal Access in the Information Society',
        topic: 'Web Development / Accessibility',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'Meta Front-End Developer Professional Certificate',
        desc: 'Advanced React, JavaScript algorithms, responsive design, and version control.',
        org: 'Meta',
        link: 'https://coursera.org/verify/cert-maria-1',
        date: '2024'
      },
      {
        title: 'TypeScript Developer Certification',
        desc: 'Strongly typed web development, generic interfaces, and async architecture.',
        org: 'Microsoft',
        link: 'https://microsoft.com/verify/cert-maria-2',
        date: '2024'
      },
      {
        title: 'Web Accessibility Specialist (WAS)',
        desc: 'WCAG 2.1 compliance auditing, ARIA roles, screen reader testing, and inclusive UI.',
        org: 'IAAP',
        link: 'https://accessibilityassociation.org/verify/cert-maria-3',
        date: '2025'
      }
    ]
  },

  // 7. Raisa Ahmed
  {
    email: 'raisa.ahmed@std.uftb.ac.bd',
    name: 'Raisa Ahmed',
    bio: 'Data Engineer constructing automated ETL data pipelines, data warehouses, and real-time streaming architectures for educational institutional data.',
    careerInterest: 'Data Engineering & Big Data Analytics',
    interests: ['Data Engineering', 'Big Data Analytics', 'ETL Pipelines', 'Data Warehousing'],
    skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'PostgreSQL', 'Data Pipelines'],
    githubLink: 'https://github.com/raisa-ahmed',
    portfolioLink: 'https://raisa-ahmed.frontx.app',
    projects: [
      {
        title: 'University Data Lake & Automated ETL Pipeline',
        desc: 'Scalable data pipeline using Apache Airflow and Spark to ingest, clean, and consolidate disparate student records into a central data warehouse.',
        tech: 'Python, Apache Spark, Apache Airflow, PostgreSQL, Docker',
        github: 'https://github.com/frontx-projects/university-data-lake-etl',
        demo: 'https://data-lake.frontx.app'
      },
      {
        title: 'Real-Time Exam Traffic & System Log Streamer',
        desc: 'Streaming data architecture processing real-time system logs during high-volume online examinations to detect server latency bottlenecks.',
        tech: 'Python, Apache Kafka, PySpark, Elasticsearch, Kibana',
        github: 'https://github.com/frontx-projects/exam-traffic-streamer',
        demo: 'https://exam-traffic.frontx.app'
      }
    ],
    research: [
      {
        title: 'Scalable Data Pipeline Architectures for Real-Time Institutional Analytics in Higher Education',
        desc: 'Technical study evaluating batch vs streaming processing throughput for processing millions of daily LMS interaction logs.',
        journal: 'IEEE Transactions on Big Data',
        topic: 'Data Engineering / Big Data',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'IBM Data Engineering Professional Certificate',
        desc: 'ETL orchestration, relational databases, NoSQL, data warehousing, and Spark.',
        org: 'IBM',
        link: 'https://coursera.org/verify/cert-raisa-1',
        date: '2024'
      },
      {
        title: 'Apache Spark Certified Developer',
        desc: 'Big data analytics, RDD transformations, Spark SQL, and distributed compute tuning.',
        org: 'Databricks',
        link: 'https://databricks.com/verify/cert-raisa-2',
        date: '2024'
      },
      {
        title: 'Data Pipelines with Apache Airflow',
        desc: 'DAG workflow design, custom operators, Airflow orchestration, and monitoring.',
        org: 'Astronomer',
        link: 'https://astronomer.io/verify/cert-raisa-3',
        date: '2025'
      }
    ]
  },

  // 8. Nidhi Rahman
  {
    email: 'nidhi.rahman@std.uftb.ac.bd',
    name: 'Nidhi Rahman',
    bio: 'Instructional game designer creating gamified learning environments, educational simulations, and reward-based study systems.',
    careerInterest: 'Game-Based Learning & Educational Technology',
    interests: ['Educational Technology', 'Game-Based Learning', 'Gamification', 'Instructional Design'],
    skills: ['Unity', 'C#', 'Gamification', 'JavaScript', 'Instructional Design', 'HTML5'],
    githubLink: 'https://github.com/nidhi-rahman',
    portfolioLink: 'https://nidhi-rahman.frontx.app',
    projects: [
      {
        title: 'Gamified Mathematics Learning Quest',
        desc: '2D educational game platform turning algebra problem-solving into interactive quests and boss battles for secondary school students.',
        tech: 'Unity, C#, HTML5 Canvas, WebGL, Firebase',
        github: 'https://github.com/frontx-projects/math-quest-game',
        demo: 'https://math-quest.frontx.app'
      },
      {
        title: 'Gamification Badge & Achievement Engine',
        desc: 'Pluggable microservice providing leaderboards, streak tracking, and skill badges for online learning portals.',
        tech: 'Node.js, Express.js, MongoDB, Redis, WebSockets',
        github: 'https://github.com/frontx-projects/gamification-badge-engine',
        demo: 'https://badge-engine.frontx.app'
      }
    ],
    research: [
      {
        title: 'Impact of Gamified Reward Systems on Student Motivation and Persistent Problem-Solving',
        desc: 'Controlled experimental study analyzing how points, badges, and leaderboards influence student study duration in online math platforms.',
        journal: 'Computers & Education',
        topic: 'Game-Based Learning / Educational Technology',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'Unity Certified User: Programmer',
        desc: '2D/3D game programming, physics engines, UI components, and C# scripting.',
        org: 'Unity Technologies',
        link: 'https://unity.com/verify/cert-nidhi-1',
        date: '2024'
      },
      {
        title: 'Gamification Design Specialization',
        desc: 'Player mechanics, motivation psychology, reward systems, and game feedback loops.',
        org: 'University of Pennsylvania',
        link: 'https://coursera.org/verify/cert-nidhi-2',
        date: '2024'
      },
      {
        title: 'Instructional Game Design',
        desc: 'Curriculum integration, educational simulation architecture, and playtesting.',
        org: 'EdX',
        link: 'https://edx.org/verify/cert-nidhi-3',
        date: '2025'
      }
    ]
  },

  // 9. Mubasshihra Nahian
  {
    email: 'mubasshihra.nahian@std.uftb.ac.bd',
    name: 'Mubasshihra Nahian',
    bio: 'Cloud Systems Engineer specializing in serverless architectures, microservice APIs, and automated infrastructure provisioning for university platforms.',
    careerInterest: 'Cloud Architecture & Serverless Educational Microservices',
    interests: ['Cloud Computing', 'Serverless Architecture', 'Microservices', 'DevOps'],
    skills: ['AWS Lambda', 'Node.js', 'Serverless Framework', 'Docker', 'Terraform', 'PostgreSQL'],
    githubLink: 'https://github.com/mubasshihra-nahian',
    portfolioLink: 'https://mubasshihra-nahian.frontx.app',
    projects: [
      {
        title: 'Serverless Student Notification Microservice',
        desc: 'Event-driven cloud serverless pipeline dispatching email notifications, SMS alerts, and push messages upon assignment submission events.',
        tech: 'AWS Lambda, Node.js, Serverless Framework, AWS SNS, PostgreSQL',
        github: 'https://github.com/frontx-projects/serverless-notification-service',
        demo: 'https://serverless-notify.frontx.app'
      },
      {
        title: 'Infrastructure as Code for Academic Portals',
        desc: 'Modular Terraform scripts for provisioning containerized university backend clusters with automated load balancers and encrypted storage buckets.',
        tech: 'Terraform, AWS ECS, Docker, GitHub Actions, Nginx',
        github: 'https://github.com/frontx-projects/academic-portal-tf',
        demo: 'https://portal-infra.frontx.app'
      }
    ],
    research: [
      {
        title: 'Cost and Performance Trade-Offs of Serverless vs Containerized Workloads in University Software Infrastructure',
        desc: 'Benchmark analysis evaluating operational cost efficiency and latency of serverless cloud functions during registration spikes.',
        journal: 'IEEE Cloud Computing',
        topic: 'Cloud Computing / Serverless Architecture',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'AWS Certified Developer – Associate',
        desc: 'Developing, deploying, and debugging cloud-based serverless applications on AWS.',
        org: 'Amazon Web Services',
        link: 'https://aws.amazon.com/verify/cert-mubasshihra-1',
        date: '2024'
      },
      {
        title: 'HashiCorp Certified: Terraform Associate',
        desc: 'Infrastructure as code, state management, provider configuration, and cloud modules.',
        org: 'HashiCorp',
        link: 'https://hashicorp.com/verify/cert-mubasshihra-2',
        date: '2024'
      },
      {
        title: 'Serverless Architecture & Microservices',
        desc: 'Event-driven microservice design, API Gateway integration, and DynamoDB modeling.',
        org: 'Udemy',
        link: 'https://udemy.com/verify/cert-mubasshihra-3',
        date: '2025'
      }
    ]
  },

  // 10. Labiba Islam
  {
    email: 'labiba.islam@std.uftb.ac.bd',
    name: 'Labiba Islam',
    bio: 'HCI Researcher and Mobile Experience Specialist focused on designing mobile interfaces optimized for learners with accessibility needs.',
    careerInterest: 'Human-Computer Interaction & Accessibility in Mobile EdTech',
    interests: ['Human-Computer Interaction', 'Mobile Accessibility', 'User Research', 'Digital Inclusion'],
    skills: ['Figma', 'User Research', 'Flutter', 'Usability Testing', 'Accessibility Design', 'Mobile UX'],
    githubLink: 'https://github.com/labiba-islam',
    portfolioLink: 'https://labiba-islam.frontx.app',
    projects: [
      {
        title: 'Accessible Mobile Reader for Visually Impaired Students',
        desc: 'Mobile application integrating text-to-speech, high contrast themes, and voice command navigation for accessible study material reading.',
        tech: 'Flutter, Dart, Screen Reader API, Speech-to-Text, Figma',
        github: 'https://github.com/frontx-projects/accessible-mobile-reader',
        demo: 'https://accessible-reader.frontx.app'
      },
      {
        title: 'Student Usability Testing & Eye-Tracking Toolkit',
        desc: 'Mobile UX evaluation framework capturing gesture touchmaps, voice feedback, and reading pace during digital textbook interactions.',
        tech: 'Figma, Flutter, Dart, Firebase Analytics',
        github: 'https://github.com/frontx-projects/usability-testing-toolkit',
        demo: 'https://usability-toolkit.frontx.app'
      }
    ],
    research: [
      {
        title: 'Mobile Assistive Technologies and Their Impact on Literacy Outcomes for Students with Visual Impairments',
        desc: 'Multi-school field study evaluating reading comprehension rates using accessible mobile reading applications.',
        journal: 'ACM Transactions on Accessible Computing',
        topic: 'Human-Computer Interaction / Assistive Technology',
        year: '2025'
      }
    ],
    certificates: [
      {
        title: 'Certified Professional in Accessibility Core Competencies (CPACC)',
        desc: 'Disabilities, accessibility laws, universal design principles, and digital inclusion.',
        org: 'IAAP',
        link: 'https://accessibilityassociation.org/verify/cert-labiba-1',
        date: '2024'
      },
      {
        title: 'Mobile UX Design & Research Specialization',
        desc: 'Touch patterns, mobile navigation structures, and rapid usability testing.',
        org: 'Interaction Design Foundation',
        link: 'https://ixdf.org/verify/cert-labiba-2',
        date: '2024'
      },
      {
        title: 'Human-Centered Research Methods',
        desc: 'Contextual inquiries, interview techniques, persona development, and field studies.',
        org: 'Coursera',
        link: 'https://coursera.org/verify/cert-labiba-3',
        date: '2025'
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

    for (const item of REMAINING_10_ALUMNI) {
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
        const svg = createResearchCoverSvg(res.title, item.name, res.topic, res.journal, res.year);
        const coverUrl = await uploadSvgToCloudinary(svg, `res_${item.name}`);
        enrichedResearch.push({
          title: res.title,
          desc: res.desc,
          journal: res.journal,
          topic: res.topic,
          pdfUrl: coverUrl
        });
      }

      const enrichedCertificates = [];
      for (const cert of item.certificates) {
        const svg = createCertificateSvg(cert.title, cert.org, item.name, cert.date);
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
      const resumeSvg = createResumeSvg(item.name, item.careerInterest, item.skills, user.department || 'Educational Technology and Engineering', user.session || '20-21', item.email);
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
    console.log('      REMAINING 10 ALUMNI ENRICHMENT COMPLETE ');
    console.log('==========================================');
    console.log(`Total Alumni Updated: ${updatedCount} / 10`);
    console.log(`Total Alumni Failed: ${failedCount}`);
    console.log('==========================================\n');

    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('Enrichment script error:', err);
    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  processEnrichment();
}

module.exports = processEnrichment;
