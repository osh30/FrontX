export const API = 'http://localhost:5000';

export const CATEGORIES = [
  'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
  'AI', 'Scholarship', 'Productivity', 'University Life',
  'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
];

export const CATEGORY_COLORS = {
  'Study Tips': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  'Career': 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Internship': 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  'Research': 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  'Programming': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  'AI': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  'Scholarship': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  'Productivity': 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
  'University Life': 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
  'Project Showcase': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  'Success Story': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  'Events': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  'Technology': 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  'Others': 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300'
};

export const ROLE_BADGES = {
  admin: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
  alumni: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
  student: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
};

export const SECTION_TYPES = [
  { type: 'heading', label: 'Heading', hint: 'Section title (H1-H4)' },
  { type: 'paragraph', label: 'Paragraph', hint: 'Body text' },
  { type: 'image', label: 'Image', hint: 'Upload or image URL' },
  { type: 'quote', label: 'Quote', hint: 'Pull-quote with source' },
  { type: 'tip', label: 'Pro Tip', hint: 'Highlighted insight' },
  { type: 'facts', label: 'Key Facts', hint: 'Numbered fact list' },
  { type: 'checklist', label: 'Checklist', hint: 'Interactive checkbox list' },
  { type: 'numberedSteps', label: 'Steps', hint: 'Numbered steps' },
  { type: 'timeline', label: 'Timeline', hint: 'Timeline entries' },
  { type: 'comparisonTable', label: 'Comparison Table', hint: 'Compare rows & columns' },
  { type: 'faq', label: 'FAQ', hint: 'Accordion Q&A' },
  { type: 'divider', label: 'Divider', hint: 'Horizontal separator' }
];

export const SECTION_TYPE_LABEL = Object.fromEntries(SECTION_TYPES.map(s => [s.type, s.label]));

export const slugify = (text = '') =>
  String(text).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const newSection = (type) => {
  const base = { type };
  switch (type) {
    case 'heading': return { ...base, level: 2, heading: '' };
    case 'paragraph': return { ...base, text: '' };
    case 'image': return { ...base, imageUrl: '', caption: '', alt: '' };
    case 'quote': return { ...base, quote: '', source: '' };
    case 'tip': return { ...base, tip: '' };
    case 'facts': return { ...base, facts: [''] };
    case 'checklist': return { ...base, items: [''] };
    case 'numberedSteps': return { ...base, items: [''] };
    case 'timeline': return { ...base, timeline: [{ title: '', description: '' }] };
    case 'comparisonTable': return { ...base, headers: ['', ''], rows: [['', ''], ['', '']] };
    case 'faq': return { ...base, qa: [{ question: '', answer: '' }] };
    default: return { ...base };
  }
};
