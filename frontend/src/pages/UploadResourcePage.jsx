import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Link as LinkIcon, X, Check, ArrowLeft, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RESOURCE_CATEGORIES = [
  "📚 Book / eBook",
  "📄 Research Paper",
  "🎓 Course Material",
  "📝 Academic Notes",
  "💼 Career Guide",
  "🎤 Interview Preparation",
  "🔬 Research Guide",
  "🧑‍💻 Project Resource",
  "📊 Industry Report",
  "🎥 Video Resource",
  "🔗 Useful Website",
  "📁 Other"
];

const TARGET_AUDIENCES = [
  "All Students",
  "CSE Students",
  "EEE Students",
  "BBA Students",
  "Research Interested Students",
  "Final Year Students",
  "Freshers",
  "Other"
];

const READING_TIMES = [
  "15 Minutes",
  "30 Minutes",
  "1 Hour",
  "2 Hours",
  "3+ Hours"
];

const PRESET_TAGS = [
  "Python", "Machine Learning", "Data Science", "Research", 
  "Career Development", "Interview Preparation", "Web Development", "AI",
  "Software Engineering", "System Design"
];

const UploadResourcePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: RESOURCE_CATEGORIES[0],
    targetAudience: [],
    tags: [],
    uploadType: 'File', // 'File' | 'ExternalLink'
    externalLink: '',
    readingTime: READING_TIMES[0],
    isFeatured: false,
    whyUse: ''
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to update specific fields easily
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleAudience = (audience) => {
    setFormData(prev => {
      const current = prev.targetAudience;
      if (current.includes(audience)) {
        return { ...prev, targetAudience: current.filter(a => a !== audience) };
      }
      return { ...prev, targetAudience: [...current, audience] };
    });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        updateField('tags', [...formData.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size (e.g., max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFileError('');
    setFile(selectedFile);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.whyUse.trim()) return "Please explain why students should use this";
    if (formData.uploadType === 'File' && !file) return "Please select a file to upload";
    if (formData.uploadType === 'ExternalLink' && !formData.externalLink.trim()) return "External link is required";
    if (formData.targetAudience.length === 0) return "Please select at least one target audience";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('targetAudience', JSON.stringify(formData.targetAudience));
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('uploadType', formData.uploadType);
      if (formData.externalLink) submitData.append('externalLink', formData.externalLink);
      submitData.append('readingTime', formData.readingTime);
      submitData.append('isFeatured', formData.isFeatured.toString());
      submitData.append('whyUse', formData.whyUse);

      if (formData.uploadType === 'File' && file) {
        submitData.append('file', file);
      }

      const res = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        toast.success('Resource published successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to publish resource');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 px-6 pb-20 relative overflow-hidden">
      {/* Background styling */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium bg-white/60 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-md w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-gray-100 bg-white/50">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-purple-500" /> 
              Share Knowledge With Students
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              Help students grow by sharing valuable learning materials, research guides, career resources, interview preparation materials, industry insights, and academic content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            
            {/* 1. Basic Info */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">1. Resource Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700">Resource Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Complete Machine Learning Roadmap"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-inner"
                  >
                    {RESOURCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Estimated Reading Time</label>
                  <select 
                    value={formData.readingTime}
                    onChange={(e) => updateField('readingTime', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-inner"
                  >
                    {READING_TIMES.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700">Short Description *</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="A complete beginner-to-advanced learning roadmap..."
                    className="w-full min-h-[100px] p-4 bg-white border border-gray-200 rounded-xl resize-y focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm shadow-inner"
                  />
                </div>
              </div>
            </section>

            {/* 2. Target Audience & Tags */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">2. Audience & Tags</h2>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Target Audience * <span className="text-xs font-normal text-gray-500">(Multiple selection allowed)</span></label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_AUDIENCES.map(audience => (
                    <button
                      type="button"
                      key={audience}
                      onClick={() => toggleAudience(audience)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        formData.targetAudience.includes(audience)
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {formData.targetAudience.includes(audience) && <Check className="w-3 h-3 inline-block mr-1" />}
                      {audience}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Skill Tags</label>
                
                {/* Pre-set tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_TAGS.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => !formData.tags.includes(tag) && updateField('tags', [...formData.tags, tag])}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Custom tag input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a custom tag and press Enter"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-full shadow-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-purple-400 hover:text-purple-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 3. Value Proposition */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">3. Why Should Students Use This?</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 mb-2">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">Explain how this resource specifically helps students. What will they gain? Why did you choose to share it?</p>
                </div>
                <textarea 
                  value={formData.whyUse}
                  onChange={(e) => updateField('whyUse', e.target.value)}
                  placeholder="This resource provides a structured roadmap for students who want to build a career in AI..."
                  className="w-full min-h-[120px] p-4 bg-white border border-gray-200 rounded-xl resize-y focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm shadow-inner"
                />
              </div>
            </section>

            {/* 4. Upload Content */}
            <section className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 border-gray-200">4. Resource Content</h2>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => updateField('uploadType', 'File')}
                  className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                    formData.uploadType === 'File' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-6 h-6" />
                  <span className="font-bold text-sm">Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('uploadType', 'ExternalLink')}
                  className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                    formData.uploadType === 'ExternalLink' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <LinkIcon className="w-6 h-6" />
                  <span className="font-bold text-sm">External Resource Link</span>
                </button>
              </div>

              {formData.uploadType === 'File' && (
                <div className="mt-4">
                  <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all bg-white group">
                    <div className="p-4 bg-purple-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium mb-1">
                      {file ? file.name : 'Click to select a file'}
                    </span>
                    <span className="text-xs text-gray-500">Supported: PDF, DOCX, PPTX, XLSX, ZIP (Max 10MB)</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" />
                  </label>
                  {fileError && <p className="text-red-500 text-sm mt-2 font-medium">{fileError}</p>}
                </div>
              )}

              {formData.uploadType === 'ExternalLink' && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-bold text-gray-700">URL Link *</label>
                  <input 
                    type="url" 
                    value={formData.externalLink}
                    onChange={(e) => updateField('externalLink', e.target.value)}
                    placeholder="https://example.com/resource"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide a valid URL (e.g., YouTube, Coursera, GitHub, Google Drive)</p>
                </div>
              )}
            </section>

            {/* Extras */}
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <input 
                type="checkbox" 
                id="featured" 
                checked={formData.isFeatured}
                onChange={(e) => updateField('isFeatured', e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" 
              />
              <label htmlFor="featured" className="text-sm font-bold text-yellow-800 cursor-pointer">
                ⭐ Mark as Featured Resource (increases visibility on the feed)
              </label>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isSubmitting ? 'Publishing...' : 'Publish Resource'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadResourcePage;
