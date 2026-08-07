const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIResource = require('../models/AIResource');
const StudyPlanner = require('../models/StudyPlanner');

const RESOURCE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const generationInFlight = new Map();

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables.');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
};

const cleanJson = (text) => {
  if (!text) return text;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }
  return cleaned;
};

const buildOutlineContext = (course) => {
  const topics = (course.outlineTopics || []).filter(Boolean).slice(0, 14);
  return topics.length
    ? `\nThe course syllabus covers these weekly topics:\n${topics.map((t) => `- ${t}`).join('\n')}`
    : '';
};

const buildCourseContext = (course) => ({
  courseCode: course.courseCode,
  courseName: course.courseName,
  outlineTopics: (course.weeks || []).map((w) => w.topic).filter(Boolean)
});

// ─────────────────────────────── SECTION 1: IMPORTANT TOPICS (Gemini, interview / job focused) ───────────────────────────────
const generateTopics = async (course) => {
  const model = initGemini();
  const prompt = `You are a premium academic AI tutor and career coach. Generate the 8-12 most important topics and concepts a student must master for the course "${course.courseName}" (course code: ${course.courseCode}) that are most frequently asked in job interviews, technical/viva questions, and placement exams.${buildOutlineContext(course)}

Return ONLY a JSON array of objects with exactly this shape:
[{"topic":"<concise topic title>","explanation":"<2-3 sentence explanation of why it matters for interviews/jobs and what to focus on>"}]

Rules:
- 8 to 12 topics, ordered by importance for interviews and jobs
- Focus on core concepts, frequently asked questions, and must-know fundamentals
- Explanations must be concise (2-3 sentences), study-focused and encouraging
- Return ONLY the JSON array, no markdown, no code fences`;

  const aiResult = await model.generateContent(prompt);
  const parsed = JSON.parse(cleanJson(aiResult.response.text()));
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((t) => ({
      topic: String(t.topic || '').slice(0, 250),
      explanation: String(t.explanation || '').slice(0, 700)
    }))
    .filter((t) => t.topic)
    .slice(0, 12);
};

// ─────────────────────────────── SECTION 2: RECOMMENDED BOOKS (Google Books API) ───────────────────────────────
const fetchBooks = async (course) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is missing. Cannot fetch books.');

  const query = encodeURIComponent(`${course.courseName} textbook`);
  const { data } = await axios.get(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&printType=books&key=${apiKey}`,
    { timeout: 15000 }
  );

  return (data.items || [])
    .filter(Boolean)
    .map((item) => {
      const v = item.volumeInfo || {};
      return {
        id: item.id || '',
        title: v.title || 'Untitled Book',
        authors: Array.isArray(v.authors) ? v.authors : [],
        description: String(v.description || '').replace(/<[^>]*>/g, '').slice(0, 400),
        thumbnail: (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) || '',
        infoLink: v.infoLink || '',
        previewLink: v.previewLink || '',
        averageRating: typeof v.averageRating === 'number' ? v.averageRating : null,
        ratingCount: v.ratingsCount || 0,
        publisher: v.publisher || '',
        publishedDate: v.publishedDate || '',
        pageCount: v.pageCount || null
      };
    })
    .filter((b) => b.title)
    .slice(0, 10);
};

// ─────────────────────────────── SECTION 3: RECOMMENDED VIDEOS (YouTube Data API v3) ───────────────────────────────
const VIDEO_BLOCK_KEYWORDS = [
  'gaming', 'gameplay', 'let\'s play', 'minecraft', 'fortnite', 'pubg',
  'skins', 'dlc', 'walkthrough', 'speedrun', 'fifa', 'call of duty', 'cod',
  'playlist', 'reaction', 'vlog', 'comedy', 'prank', 'memes', 'movie',
  'trailer', 'music video', 'official audio', 'news', 'sports highlights'
];

const scoreVideoRelevance = (video, course, outlineTopics) => {
  const title = video.title.toLowerCase();
  const text = `${title} ${video.channelTitle} ${video.description}`.toLowerCase();
  const nameTokens = `${course.courseName} ${course.courseCode}`
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
  const allTopicWords = outlineTopics
    .join(' ')
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);

  let score = 0;
  if (nameTokens.some((t) => title.includes(t))) score += 3;
  if (nameTokens.some((t) => text.includes(t))) score += 1;
  if (outlineTopics.some((t) => title.includes(t.toLowerCase()))) score += 4;
  if (outlineTopics.some((t) => text.includes(t.toLowerCase()))) score += 2;
  score += allTopicWords.filter((w) => title.includes(w)).length * 1.5;
  score += allTopicWords.filter((w) => text.includes(w)).length * 0.5;
  if (/(lecture|tutorial|course|class|syllabus|unit|chapter|engineering|physics|chemistry|mathematics|module|lesson|degree|exam|semester|diploma|professor|crash course|full course)/.test(text)) score += 1;
  if (VIDEO_BLOCK_KEYWORDS.some((k) => text.includes(k))) score -= 4;

  return score;
};

const rankVideosWithAI = async (candidates, course, outlineTopics) => {
  const gemini = initGemini();
  if (!gemini) return null;

  const condensed = candidates.slice(0, 15).map((v, i) => ({
    i,
    title: v.title,
    channel: v.channelTitle,
    desc: v.description.slice(0, 180)
  }));

  const prompt =
    `Course: "${course.courseName} ${course.courseCode}". Syllabus topics: ${outlineTopics.slice(0, 15).join('; ')}.\n` +
    `A study planner recommends YouTube videos for this course. From the candidates below, pick the 8 MOST relevant educational/lecture videos and reject anything that is gaming, entertainment, a playlist, a trailer, a movie, or unrelated to the course subject.\n` +
    `Return ONLY a JSON array of up to 8 candidate indexes, e.g. [0,3,5]. No other text.\n` +
    `Candidates:\n${JSON.stringify(condensed)}`;

  const result = await gemini.generateContent(prompt);
  const text = cleanJson(result.response.text());
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) return null;
  const indexes = parsed
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < candidates.length);
  return candidates.filter((_, i) => indexes.includes(i)).slice(0, 8);
};

const MAX_TOPIC_QUERIES = 6;
const PER_QUERY_RESULTS = 8;
const VIDEO_QUERY_TAIL = ' lecture tutorial';

const buildVideoQueries = (course, outlineTopics) => {
  const queries = [`${course.courseName} full course ${VIDEO_QUERY_TAIL.trim()}`];
  const topics = outlineTopics.slice(0, MAX_TOPIC_QUERIES);
  for (const topic of topics) {
    const cleanTopic = String(topic || '').replace(/\s+/g, ' ').trim();
    if (cleanTopic && cleanTopic.toLowerCase() !== course.courseName.toLowerCase()) {
      queries.push(`${course.courseName} ${cleanTopic}${VIDEO_QUERY_TAIL}`);
    }
  }
  return queries;
};

const fetchVideos = async (course) => {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is missing. Cannot fetch YouTube videos.');

  const outlineTopics = (course.weeks || []).map((w) => w.topic).filter(Boolean);
  const queries = buildVideoQueries(course, outlineTopics);

  const results = await Promise.allSettled(
    queries.map((query) =>
      axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${PER_QUERY_RESULTS}&order=relevance&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${apiKey}`,
        { timeout: 15000 }
      )
    )
  );

  const seen = new Set();
  const candidates = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value.data.items || []) {
      const videoId = (item.id && item.id.videoId) || '';
      if (!videoId || seen.has(videoId)) continue;
      seen.add(videoId);
      const s = item.snippet || {};
      const thumb = s.thumbnails && (s.thumbnails.maxres || s.thumbnails.high || s.thumbnails.medium || s.thumbnails.default);
      candidates.push({
        videoId,
        title: s.title || '',
        channelTitle: s.channelTitle || '',
        thumbnail: (thumb && thumb.url) || '',
        publishedAt: s.publishedAt || null,
        description: String(s.description || '').slice(0, 300)
      });
    }
  }

  if (!candidates.length) return [];

  // Narrow to the most relevant candidates with the heuristic before AI ranking,
  // so Gemini ranks only plausible educational matches.
  const scored = candidates
    .map((v) => ({ ...v, __score: scoreVideoRelevance(v, course, outlineTopics) }))
    .sort((a, b) => b.__score - a.__score);

  const topCandidates = scored.slice(0, 20).map(({ __score, ...v }) => v);

  const aiRanked = await rankVideosWithAI(topCandidates, course, outlineTopics);
  if (aiRanked && aiRanked.length) return aiRanked;

  return topCandidates.slice(0, 8);
};

// ─────────────────────────────── BUILD + MERGE ───────────────────────────────
const buildResources = async (course, cached) => {
  const courseContext = buildCourseContext(course);

  const [topicsRes, booksRes, videosRes] = await Promise.allSettled([
    generateTopics(courseContext),
    fetchBooks(courseContext),
    fetchVideos(courseContext)
  ]);

  const fallback = (result, key) =>
    result.status === 'fulfilled' && result.value ? result.value : (cached && cached[key]) || null;

  return {
    courseId: course._id.toString(),
    courseCode: course.courseCode,
    courseName: course.courseName,
    topics: fallback(topicsRes, 'topics') || [],
    books: fallback(booksRes, 'books') || [],
    videos: fallback(videosRes, 'videos') || [],
    sectionsStatus: {
      topics: topicsRes.status,
      books: booksRes.status,
      videos: videosRes.status
    },
    sectionErrors: {
      topics: topicsRes.reason ? String(topicsRes.reason.message || topicsRes.reason) : null,
      books: booksRes.reason ? String(booksRes.reason.message || booksRes.reason) : null,
      videos: videosRes.reason ? String(videosRes.reason.message || videosRes.reason) : null
    },
    generatedAt: new Date()
  };
};

const SECTION_KEYS = ['topics', 'books', 'videos'];

// @desc    Get (and cache) AI learning resources for a course
// @route   GET /api/study-planner/courses/:courseId/ai-resources
exports.getCourseResources = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });

    const course = planner.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const courseId = course._id.toString();
    const cached = await AIResource.findOne({ courseId });

    const isFresh =
      cached &&
      cached.generatedAt &&
      Date.now() - new Date(cached.generatedAt).getTime() < RESOURCE_TTL_MS;

    // Do not serve a cached failure: if a section previously failed (rejected) and
    // still has no data, regenerate it so transient errors self-heal.
    const hasEmptyRejectedSection =
      cached &&
      SECTION_KEYS.some((key) =>
        cached.sectionsStatus &&
        cached.sectionsStatus[key] === 'rejected' &&
        (!cached[key] || cached[key].length === 0)
      );

    if (isFresh && !hasEmptyRejectedSection) {
      return res.json({
        source: 'cache',
        ...cached.toObject()
      });
    }

    if (generationInFlight.has(courseId)) {
      const inFlight = await generationInFlight.get(courseId);
      return res.json(inFlight);
    }

    const task = buildResources(course, cached);
    generationInFlight.set(courseId, task);

    try {
      const result = await task;
      await AIResource.findOneAndUpdate(
        { courseId },
        { $set: result },
        { new: true, upsert: true }
      );
      res.json({ source: 'generated', ...result });
    } finally {
      generationInFlight.delete(courseId);
    }
  } catch (error) {
    console.error('AI resources error:', error);
    res.status(500).json({ message: 'Failed to load AI resources', error: error.message });
  }
};
