const mongoose = require('mongoose');

const skillAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  careerInterest: { type: String, required: true },
  cvUrl: { type: String, required: true },
  extractedText: { type: String, default: '' },
  
  careerReadinessScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  
  strengths: [{ type: String }],
  weaknesses: { type: String, default: '' },
  missingSkills: [{ type: String }],
  
  roadmap: [{
    timeframe: String,
    title: String,
    description: String
  }],
  
  recommendedProjects: [{
    title: String,
    description: String
  }],
  
  certifications: [{
    title: String,
    provider: String
  }],
  
  resources: [{
    topic: String,
    direction: String
  }],
  
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SkillAnalysis', skillAnalysisSchema);
