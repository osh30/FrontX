import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ApplyForResearchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [closed, setClosed] = useState(false);

  const [formData, setFormData] = useState({
    motivation: '',
    relevantSkills: '',
    githubLink: '',
    portfolioLink: '',
    weeklyAvailability: '10 Hours',
    cvUrl: ''
  });

  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [topicRes, checkRes] = await Promise.all([
          fetch(`${API_BASE}/collaboration/${id}`, { headers }),
          fetch(`${API_BASE}/collaboration/${id}/my-application`, { headers })
        ]);

        if (topicRes.ok) {
          const data = await topicRes.json();
          setTopic(data);
        }
        if (checkRes.ok) {
          const data = await checkRes.json();
          setHasApplied(data.hasApplied);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('File is too large. Please upload a PDF under 2MB.');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, cvUrl: reader.result }); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cvUrl) {
      toast.error('Please upload your CV (PDF).');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaboration/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/collaboration');
        }, 3000);
      } else {
        const data = await res.json();
        if (data.code === 'APPLICATION_CLOSED') {
          setClosed(true);
        } else {
          toast.error(data.message || 'Failed to apply.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;

  const checkIsExpired = (deadlineStr) => {
    if (!deadlineStr) return false;
    const d = new Date(deadlineStr);
    d.setHours(23, 59, 59, 999);
    return d.getTime() < new Date().getTime();
  };
  const isExpired = topic?.isExpired || checkIsExpired(topic?.deadline) || closed;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Applications Closed</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Applications are closed. The deadline for this collaboration has passed.
          </p>
          <Link
            to={`/dashboard/collaboration/${id}`}
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            Back to Details
          </Link>
        </div>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Already Applied</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            You have already applied for this collaboration opportunity.
          </p>
          <Link
            to="/dashboard/collaboration"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Your application for <span className="font-bold text-purple-600">{topic?.title}</span> has been sent successfully. The mentor will review it shortly.
          </p>
          <p className="text-sm text-gray-500">Redirecting to portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to={`/dashboard/collaboration/${id}`} className="flex items-center text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium w-max">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Details
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Apply For Collaboration</h1>
            <p className="text-blue-100">You are applying for: <span className="font-semibold">{topic?.title}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. Why Are You Interested?</label>
              <textarea 
                name="motivation" required rows="4" value={formData.motivation} onChange={handleChange}
                placeholder="Explain your motivation, your goals, and why you want to join this specific research..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. Relevant Skills</label>
              <textarea 
                name="relevantSkills" required rows="2" value={formData.relevantSkills} onChange={handleChange}
                placeholder="List the skills you have that match the requirements (e.g. Python, React, Data Analysis)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">3. GitHub Link (Optional)</label>
                <input 
                  type="url" name="githubLink" value={formData.githubLink} onChange={handleChange} placeholder="https://github.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio Link (Optional)</label>
                <input 
                  type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">4. CV Upload (PDF only, max 2MB)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {fileName ? (
                      <>
                        <FileText className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-sm text-gray-700 font-semibold">{fileName}</p>
                        <p className="text-xs text-green-600 mt-1">Ready to upload</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-500 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to select PDF</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">5. Weekly Availability</label>
                <select 
                  name="weeklyAvailability" value={formData.weeklyAvailability} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
                >
                  <option>5 Hours</option>
                  <option>10 Hours</option>
                  <option>15 Hours</option>
                  <option>20+ Hours</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t mt-8">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> Submit Application</>}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Are you sure you want to submit this application?
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              After submission, your application will be sent to the selected alumni for review.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Yes, Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApplyForResearchPage;
