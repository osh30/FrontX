import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, Eye, Mail, Briefcase, Clock, FileDown, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../component/dashboard/Avatar';

const ReviewApplicationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/collaboration/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/collaboration/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Application ${status} successfully.`);
        if (selectedApp?._id === appId) setSelectedApp(null);
        fetchApplications();
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium w-max">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[70vh]">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Review Applications</h1>
              <p className="text-purple-100">Evaluate candidates for your research collaboration.</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30">
              <span className="font-bold text-2xl">{applications.length}</span> <span className="text-sm">Total Applications</span>
            </div>
          </div>

          <div className="p-8">
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-500">No applications received yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map(app => (
                  <div key={app._id} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col relative overflow-hidden transition-all hover:border-purple-300 hover:shadow-md">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {app.status === 'pending' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded border border-yellow-200">Pending</span>}
                      {app.status === 'accepted' && <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200">Accepted</span>}
                      {app.status === 'rejected' && <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded border border-red-200">Rejected</span>}
                    </div>

                    <div className="flex items-center gap-4 mb-4 mt-2">
                      <Avatar src={app.student?.profilePicture} alt={app.student?.name} size={56} className="border-2 border-white shadow-sm" />
                      <div>
                        <h3 className="font-bold text-gray-900">{app.student?.name || 'Unknown Student'}</h3>
                        <p className="text-xs text-gray-500 font-medium">{app.student?.department}</p>
                        <p className="text-[10px] text-gray-400">Current Year: {app.student?.session || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                      <Clock className="w-3 h-3" /> Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1 italic bg-white p-3 rounded-xl border border-gray-100">
                      "{app.motivation}"
                    </p>

                    {app.relevantSkills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.relevantSkills.split(',').slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold">{skill.trim()}</span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button 
                        onClick={() => window.open(`/profile/${app.student?._id}`, '_blank')}
                        className="py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 flex justify-center items-center gap-1 transition-all"
                      >
                        <User className="w-3 h-3" /> View Profile
                      </button>
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold hover:bg-purple-100 flex justify-center items-center gap-1 transition-all"
                      >
                        <FileText className="w-3 h-3" /> Full Application
                      </button>
                    </div>

                    {app.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button 
                          onClick={() => handleStatusUpdate(app._id, 'accepted')}
                          className="py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all flex justify-center items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app._id, 'rejected')}
                          className="py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex justify-center items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Application Details
              </h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition-all">
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <Avatar src={selectedApp.student?.profilePicture} alt={selectedApp.student?.name} size={64} className="border-2 border-white shadow-sm" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedApp.student?.name}</h3>
                  <p className="text-sm text-purple-700 font-semibold">{selectedApp.student?.department} (Session: {selectedApp.student?.session || 'N/A'})</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Motivation</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-gray-100">
                  {selectedApp.motivation}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Relevant Skills</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-gray-100">
                  {selectedApp.relevantSkills}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Weekly Availability</h4>
                  <p className="font-bold text-gray-900">{selectedApp.weeklyAvailability}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> External Links</h4>
                  <div className="flex flex-col gap-1 mt-1 text-sm">
                    {selectedApp.githubLink ? <a href={selectedApp.githubLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub Profile</a> : <span className="text-gray-400">No GitHub provided</span>}
                    {selectedApp.portfolioLink ? <a href={selectedApp.portfolioLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Portfolio Link</a> : <span className="text-gray-400">No Portfolio provided</span>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Curriculum Vitae (CV)</h4>
                {selectedApp.cvUrl && selectedApp.cvUrl.startsWith('data:application/pdf;base64,') ? (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center flex flex-col items-center">
                    <FileText className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-4">Student uploaded a PDF CV</p>
                    <a 
                      href={selectedApp.cvUrl} 
                      download={`${selectedApp.student?.name?.replace(/\s+/g, '_')}_CV.pdf`}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-500 text-sm">
                    No valid PDF was uploaded.
                  </div>
                )}
              </div>

            </div>

            {selectedApp.status === 'pending' && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => handleStatusUpdate(selectedApp._id, 'rejected')}
                  className="px-6 py-2.5 bg-white text-red-600 border border-gray-200 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject Applicant
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedApp._id, 'accepted')}
                  className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Accept Applicant
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewApplicationsPage;
