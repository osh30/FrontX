import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Send, X, ArrowLeft, Loader2 } from 'lucide-react';

const CATEGORIES = [
  "Career Advice", "Internship", "Research", "Academic Life", 
  "University Experience", "Mental Pressure", "Success Story", "General Discussion"
];

const CreateAnonymousPostPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check role from token for the UI text, default to Anonymous Student if unable to parse
  const token = localStorage.getItem('token');
  let role = 'student';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || 'student';
    }
  } catch (e) {
    // ignore
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('category', category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('http://localhost:5000/api/anonymous-posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          // Assuming user navigates back to dashboard with community tab open
          navigate('/dashboard'); 
        }, 1500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 px-6 pb-20 relative overflow-hidden">
      {/* Background styling similar to dashboard */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium bg-white/60 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-md w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-gray-100 bg-white/50">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-purple-500" /> 
              Create Anonymous Post
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Share your thoughts, experiences, questions, or concerns with the community while keeping your identity private.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Category *</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                      category === cat 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Post Content *</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Write as much as you need..."
                className="w-full min-h-[250px] p-6 bg-white/50 border border-gray-200 rounded-2xl resize-y focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 text-lg placeholder-gray-400 leading-relaxed shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Image Upload (Optional)</label>
              {imagePreview ? (
                <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-sm max-w-xl">
                  <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-96" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-black/80 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-xl py-12 px-6 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:bg-purple-50/50 hover:border-purple-400 transition-all group bg-white/50">
                  <div className="p-4 bg-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium mb-1">Click to upload an image</span>
                  <span className="text-sm text-gray-500">Supports JPG, PNG, WEBP</span>
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-medium flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                Your anonymous post has been published successfully. Redirecting...
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Posting as Anonymous {role === 'alumni' ? 'Alumni' : 'Student'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all w-full sm:w-auto shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!content.trim() || isSubmitting || success}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto text-lg"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAnonymousPostPage;
