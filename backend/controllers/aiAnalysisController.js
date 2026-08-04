const axios = require('axios');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const SkillAnalysis = require('../models/SkillAnalysis');

const extractTextFromBuffer = async (buffer, fileUrl) => {
  console.log(`Extracting text from file URL: ${fileUrl}`);
  // Handle case where URL has query params (e.g. ?alt=media)
  const urlWithoutQuery = fileUrl.split('?')[0];
  const extension = urlWithoutQuery.split('.').pop().toLowerCase();
  console.log(`Detected file extension: ${extension}`);
  
  try {
    if (extension === 'pdf') {
      console.log("Parsing as PDF...");
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      await parser.destroy();
      console.log(`PDF parse successful, extracted ${data.text?.length || 0} characters.`);
      return data.text;
    } else if (extension === 'docx' || extension === 'doc') {
      console.log("Parsing as DOCX...");
      const result = await mammoth.extractRawText({ buffer });
      console.log(`DOCX parse successful, extracted ${result.value?.length || 0} characters.`);
      return result.value;
    } else {
      throw new Error(`Unsupported file format '${extension}'. Only PDF and DOCX are supported. Please ensure your Cloudinary URL ends in .pdf or .docx`);
    }
  } catch (error) {
    console.error("=== TEXT EXTRACTION FATAL ERROR ===");
    console.error(error);
    throw new Error(`Failed to extract text from CV: ${error.message}`);
  }
};

const callGeminiAI = async (text, careerInterest) => {
  console.log("=== START GEMINI AI CALL ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is missing from .env");
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  console.log("Gemini API Key loaded correctly.");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
  You are an expert AI Career Coach and Resume Reviewer.
  The user is a student aiming for a career in "${careerInterest}".
  Below is the extracted text from their CV.

  Analyze their CV and return a JSON response strictly matching this structure:
  {
    "careerReadinessScore": <number 0-100>,
    "atsScore": <number 0-100>,
    "strengths": ["<skill 1>", "<skill 2>", ...],
    "weaknesses": "<a short summary of their weak areas or career gaps>",
    "missingSkills": ["<skill 1>", "<skill 2>", ...],
    "roadmap": [
      { "timeframe": "Month 1", "title": "<topic>", "description": "<details>" },
      { "timeframe": "Month 2", "title": "<topic>", "description": "<details>" }
    ],
    "recommendedProjects": [
      { "title": "<project name>", "description": "<details>" }
    ],
    "certifications": [
      { "title": "<certification name>", "provider": "<e.g., Coursera, AWS>" }
    ],
    "resources": [
      { "topic": "<learning topic>", "direction": "<study direction>" }
    ]
  }

  Here is the CV text:
  """
  ${text}
  """
  `;

  console.log(`Sending request to Gemini AI... Model: gemini-2.5-flash`);
  const result = await model.generateContent(prompt);
  let responseText = result.response.text();
  console.log("=== GEMINI RESPONSE RECEIVED ===");
  console.log("Raw Response:", responseText);
  
  // Clean markdown block if present
  if (responseText.startsWith('```')) {
    console.log("Stripping markdown wrappers from Gemini response...");
    responseText = responseText.replace(/^```(json)?\n/i, '').replace(/\n```$/i, '');
  }
  
  const parsedData = JSON.parse(responseText);
  console.log("Parsed Gemini Data successfully:", Object.keys(parsedData));
  return parsedData;
};

exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await SkillAnalysis.findOne({ userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: "No analysis found." });
    }
    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching analysis." });
  }
};

exports.generateAnalysis = async (req, res) => {
  console.log("=== [API] POST /api/ai-analysis/generate TRIGGERED ===");
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("Error: User not found in database.");
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`User found: ${user.name} | ID: ${user._id}`);
    
    if (!user.resumeUrl) {
      console.log("Error: User has no resumeUrl saved in profile.");
      return res.status(400).json({ message: "No CV uploaded. Please upload a CV first." });
    }

    if (!user.careerInterest) {
      console.log("Error: User has no careerInterest saved in profile.");
      return res.status(400).json({ message: "Career interest not set in profile." });
    }

    console.log(`Target Career: ${user.careerInterest} | CV URL: ${user.resumeUrl}`);

    // 1. Download CV
    console.log("Step 1: Downloading CV from URL...");
    const response = await axios.get(user.resumeUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    console.log(`Downloaded CV buffer size: ${buffer.length} bytes.`);

    // 2. Extract Text
    console.log("Step 2: Extracting text from CV buffer...");
    const extractedText = await extractTextFromBuffer(buffer, user.resumeUrl);
    console.log(`Extraction Success! Total extracted text length: ${extractedText.length} characters.`);

    if (extractedText.trim().length < 50) {
      console.log("Error: Extracted text is too short (< 50 chars).");
      return res.status(400).json({ message: "Could not extract enough text from the CV. Please ensure it is a valid text-based PDF/DOCX." });
    }

    // 3. Call Gemini
    console.log("Step 3: Initiating Gemini AI Analysis...");
    const aiData = await callGeminiAI(extractedText, user.careerInterest);

    // 4. Save to MongoDB
    console.log("Step 4: Saving Analysis results to MongoDB...");
    const analysisData = {
      userId: user._id,
      careerInterest: user.careerInterest,
      cvUrl: user.resumeUrl,
      extractedText,
      careerReadinessScore: aiData.careerReadinessScore || 0,
      atsScore: aiData.atsScore || 0,
      strengths: aiData.strengths || [],
      weaknesses: aiData.weaknesses || "Not identified.",
      missingSkills: aiData.missingSkills || [],
      roadmap: aiData.roadmap || [],
      recommendedProjects: aiData.recommendedProjects || [],
      certifications: aiData.certifications || [],
      resources: aiData.resources || [],
      generatedAt: Date.now()
    };

    const updatedAnalysis = await SkillAnalysis.findOneAndUpdate(
      { userId: user._id },
      { $set: analysisData },
      { new: true, upsert: true }
    );
    
    console.log("=== SUCCESS: AI Analysis Saved Successfully ===");

    const io = req.app.get('io');
    if (io) {
      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(req.user.id);
      io.emit('progress_updated', { userId: req.user.id });
    }

    res.json(updatedAnalysis);
  } catch (error) {
    console.error("=== GENERATION FATAL ERROR ===");
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    res.status(500).json({ message: error.message || "Failed to generate analysis" });
  }
};
