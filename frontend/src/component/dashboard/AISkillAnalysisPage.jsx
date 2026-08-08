import { API_BASE } from '../../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, FileText, Target, CheckCircle, AlertTriangle, TrendingUp, 
  Map, Briefcase, Award, BookOpen, Loader, ArrowLeft 
} from 'lucide-react';

const AISkillAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`${API_BASE}/ai-analysis/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        setAnalysis(res.data);
      } else {
        setErrorState("No analysis found. Please generate one from the Dashboard first.");
      }
    } catch (error) {
      console.error("Failed to load AI Analysis", error);
      setErrorState(error.response?.data?.message || "Failed to load AI Analysis results.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading your AI Skill Analysis...</p>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-4xl mx-auto px-6">
        <div className="p-10 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-3xl border border-red-100 shadow-sm mt-10">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Analysis Unavailable</h3>
          <p className="text-red-700 font-medium mb-6">{errorState}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-8 p-8 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-purple-600 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-md text-white">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Skill Analysis Results</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Target Career: <span className="text-purple-600 font-bold px-2 py-0.5 bg-purple-50 rounded-md">{analysis.careerInterest || 'Tech'}</span></p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            Generated on: {new Date(analysis.generatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Content Rendered exactly like the fixed DashboardSections previously */}
        <div className="space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Career Readiness Score */}
            <div className="bg-white/80 p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 transition-transform hover:-translate-y-1">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-purple-500" strokeDasharray={`${analysis.careerReadinessScore || 0}, 100`} strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-2xl font-black text-gray-900">{analysis.careerReadinessScore || 0}%</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-purple-500" /> Career Readiness
                </h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">Based on your CV's alignment with {analysis.careerInterest || 'your target'} roles.</p>
              </div>
            </div>

            {/* ATS Readiness Score */}
            <div className="bg-white/80 p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center transition-transform hover:-translate-y-1">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-blue-500" /> ATS Compatibility
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${analysis.atsScore || 0}%` }}></div>
                </div>
                <span className="font-black text-xl text-gray-900">{analysis.atsScore || 0}%</span>
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">How well applicant tracking systems can parse your resume.</p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-50/70 p-8 rounded-3xl border border-emerald-100 shadow-sm">
              <h3 className="font-bold text-emerald-900 mb-5 flex items-center gap-2 text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Existing Strengths
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(analysis.strengths || []).map((skill, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-white text-emerald-800 text-sm font-bold rounded-xl border border-emerald-200 shadow-sm">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-orange-50/70 p-8 rounded-3xl border border-orange-100 shadow-sm">
              <h3 className="font-bold text-orange-900 mb-5 flex items-center gap-2 text-lg">
                <TrendingUp className="w-6 h-6 text-orange-500" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(analysis.missingSkills || []).map((skill, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-white text-orange-800 text-sm font-bold rounded-xl border border-orange-200 shadow-sm">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Career Gap */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-3xl border border-white shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <AlertTriangle className="w-6 h-6 text-purple-500" /> Career Gap Analysis
            </h3>
            <p className="text-base text-gray-700 font-medium leading-relaxed bg-white/80 p-5 rounded-2xl border border-white shadow-sm">{analysis.weaknesses || 'No gap analysis available.'}</p>
          </div>

          {/* Personalized Roadmap */}
          <div className="pt-4">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Map className="w-7 h-7 text-blue-500" /> Personalized Learning Roadmap
            </h3>
            <div className="space-y-6">
              {(analysis.roadmap || []).map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center mt-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 border-4 border-blue-100 shadow-sm z-10" />
                    {i !== (analysis.roadmap || []).length - 1 && <div className="w-1 h-full bg-gray-200 -mt-1 rounded-full" />}
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1 mb-2 hover:shadow-md transition-shadow">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1.5 block">{step.timeframe}</span>
                    <h4 className="font-bold text-gray-900 text-xl mb-3">{step.title}</h4>
                    <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Grid (Fixed UI logic preserved) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2 shrink-0 text-lg">
                <Briefcase className="w-5 h-5 text-purple-500" /> Suggested Projects
              </h4>
              <ul className="space-y-4 flex-1">
                {(analysis.recommendedProjects || []).map((p, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-bold text-gray-800 block leading-snug mb-1 text-base">{p.title}</span>
                    <span className="text-gray-500 text-sm leading-relaxed">{p.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2 shrink-0 text-lg">
                <Award className="w-5 h-5 text-emerald-500" /> Top Certifications
              </h4>
              <ul className="space-y-3 flex-1">
                {(analysis.certifications || []).map((c, i) => (
                  <li key={i} className="flex flex-wrap items-start justify-between gap-3 text-sm bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex items-start gap-2.5 flex-1 min-w-[150px]">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-bold text-gray-800 break-words leading-snug text-base">{c.title}</span>
                    </div>
                    <span className="text-[11px] font-bold tracking-wide text-emerald-800 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100 shrink-0 shadow-sm mt-0.5">
                      {c.provider}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-1 h-full flex flex-col hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2 shrink-0 text-lg">
                <BookOpen className="w-5 h-5 text-blue-500" /> Learning Resources
              </h4>
              <ul className="space-y-4 flex-1">
                {(analysis.resources || []).map((r, i) => (
                  <li key={i} className="text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <span className="font-bold text-gray-800 block leading-snug mb-1 text-base">{r.topic}</span>
                    <span className="text-gray-500 text-sm leading-relaxed">{r.direction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AISkillAnalysisPage;
