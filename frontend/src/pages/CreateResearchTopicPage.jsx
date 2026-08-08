import { API_BASE } from '../config/api';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Microscope, Target, Briefcase, BookOpen, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateResearchTopicPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Research Paper',
    domain: 'Artificial Intelligence',
    overview: '',
    whyItMatters: '',
    experienceLevel: 'Beginner Friendly',
    studentCount: 1,
    duration: '1 Month',
    deadline: ''
  });

  const [responsibilities, setResponsibilities] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [outcomes, setOutcomes] = useState([]);
  const [benefits, setBenefits] = useState([]);

  const responsibilityOptions = [
    'Literature Review', 'Data Collection', 'Data Analysis', 
    'Report Writing', 'Research Writing', 'Development', 
    'Testing', 'UI/UX Design', 'Presentation'
  ];

  const outcomeOptions = [
    'Conference Paper', 'Research Publication', 'Journal Publication',
    'Portfolio Project', 'Certificate', 'Recommendation Letter'
  ];

  const benefitOptions = [
    'Hands-on Research Experience', 'Publication Opportunity', 'Mentorship',
    'Portfolio Development', 'Networking', 'Recommendation Letter', 'Research Training'
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleArrayItem = (item, array, setArray) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(currentSkill.trim())) {
        setRequiredSkills([...requiredSkills, currentSkill.trim()]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaboration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          responsibilities,
          requiredSkills,
          outcomes,
          benefits
        })
      });

      if (res.ok) {
        toast.success('Research Opportunity Published Successfully!');
        navigate('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to publish.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h1 className="text-3xl font-bold mb-2 relative z-10 flex items-center gap-3">
              <Microscope className="w-8 h-8" /> Publish Research Opportunity
            </h1>
            <p className="text-purple-100 relative z-10">Recruit talented students for your next big research project.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* 1. Basic Details */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" /> Research Details
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Research Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. AI-Based Student Career Recommendation System"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Research Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all">
                    <option>Research Paper</option>
                    <option>Survey Research</option>
                    <option>Review Paper</option>
                    <option>Industrial Research</option>
                    <option>Capstone Project</option>
                    <option>Conference Paper</option>
                    <option>Journal Publication</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Research Domain</label>
                  <select name="domain" value={formData.domain} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all">
                    <option>Artificial Intelligence</option>
                    <option>Machine Learning</option>
                    <option>Cyber Security</option>
                    <option>Data Science</option>
                    <option>IoT</option>
                    <option>Web Development</option>
                    <option>Healthcare Technology</option>
                    <option>Software Engineering</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Research Overview</label>
                <textarea 
                  name="overview"
                  required rows="4"
                  value={formData.overview}
                  onChange={handleChange}
                  placeholder="What is this research about? Explain the core concept, main objective, and overall project scope..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Why This Research Matters</label>
                <textarea 
                  name="whyItMatters"
                  required rows="3"
                  value={formData.whyItMatters}
                  onChange={handleChange}
                  placeholder="Explain the importance of this research, expected impact, and real-world significance..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all resize-none"
                ></textarea>
              </div>
            </section>

            {/* 2. Student Role & Requirements */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" /> Student Requirements
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Student Responsibilities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {responsibilityOptions.map(res => (
                    <label key={res} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${responsibilities.includes(res) ? 'bg-purple-50 border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={responsibilities.includes(res)}
                        onChange={() => toggleArrayItem(res, responsibilities, setResponsibilities)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{res}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills (Press Enter to add)</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {requiredSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3 hover:text-purple-900" /></button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Python, React, Data Analysis"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all">
                    <option>Beginner Friendly</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Students Needed</label>
                  <input type="number" min="1" max="20" name="studentCount" value={formData.studentCount} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all">
                    <option>1 Month</option>
                    <option>2 Months</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>Flexible</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Outcomes & Benefits */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" /> Outcomes & Benefits
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expected Outcomes</label>
                <div className="flex flex-wrap gap-3">
                  {outcomeOptions.map(out => (
                    <label key={out} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${outcomes.includes(out) ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={outcomes.includes(out)}
                        onChange={() => toggleArrayItem(out, outcomes, setOutcomes)}
                        className="hidden"
                      />
                      {out}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Benefits For Students</label>
                <div className="flex flex-wrap gap-3">
                  {benefitOptions.map(ben => (
                    <label key={ben} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${benefits.includes(ben) ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={benefits.includes(ben)}
                        onChange={() => toggleArrayItem(ben, benefits, setBenefits)}
                        className="hidden"
                      />
                      ✔ {ben}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
                />
              </div>
            </section>

            <div className="pt-6 border-t">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> Publish Research Opportunity</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateResearchTopicPage;
