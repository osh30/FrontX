import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, FileText, CheckCircle2, XCircle, Clock, Building2, MapPin, Calendar, Briefcase, ExternalLink, Send, Eye, ArrowLeft } from 'lucide-react';

const STATUS_STYLES = {
  applied: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  pending: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  reviewed: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  shortlisted: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  interview: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  rejected: 'bg-red-500/10 text-red-300 border-red-500/20',
  accepted: 'bg-green-500/10 text-green-300 border-green-500/20'
};

const STATUS_LABELS = {
  applied: 'Applied',
  pending: 'Pending',
  reviewed: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview Scheduled',
  rejected: 'Rejected',
  accepted: 'Hired'
};

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in');
          setLoading(false);
          return;
        }
        const { data } = await axios.get(`${API_BASE}/opportunities/my-applications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) setApplications(data.applications);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const currentRole = localStorage.getItem('currentRole');
  const backPath = currentRole === 'student' ? '/dashboard/career' : '/dashboard/opportunities';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-300">{error}</p>
          <button onClick={() => navigate(backPath)} className="mt-4 text-sm text-violet-400 hover:text-violet-300">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-black">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Opportunities</span>
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-6 sm:p-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Applications</h1>
          <p className="text-slate-400 mt-1">Track your submitted applications and their status</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-12 text-center">
          <Send className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No applications yet</p>
          <p className="text-sm text-slate-500 mt-1">Apply to opportunities to see them here</p>
          <button
            onClick={() => navigate(backPath)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all"
          >
            Browse Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const opp = app.opportunity || {};
            const recruiter = app.recruiter || {};
            const expiresSoon = opp.deadline && new Date(opp.deadline) > new Date() && (new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 7;
            const expired = opp.deadline && new Date(opp.deadline) < new Date();

            return (
              <div key={app._id} className="rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-5 hover:border-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {recruiter.companyLogo ? (
                      <img src={recruiter.companyLogo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-violet-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-semibold">{opp.title || 'Opportunity'}</h3>
                        <p className="text-sm text-violet-300">{recruiter.companyName || opp.companyName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[app.status] || STATUS_STYLES.applied}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'applied' ? 'bg-blue-400' : app.status === 'rejected' ? 'bg-red-400' : app.status === 'accepted' ? 'bg-green-400' : 'bg-amber-400'}`} />
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      {opp.opportunityType && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{opp.opportunityType}</span>
                      )}
                      {opp.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>
                      )}
                      {opp.employmentMode && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{opp.employmentMode}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      {expired && <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" />Deadline Passed</span>}
                      {expiresSoon && <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" />Closing Soon</span>}
                    </div>
                  </div>
                </div>
                {app.coverLetter && (
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">{app.coverLetter}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  {app.resumeFile?.url && (
                    <a href={app.resumeFile.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">
                      <FileText className="w-3 h-3" /> Resume
                    </a>
                  )}
                  {app.githubUrl && (
                    <a href={app.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  {app.linkedinUrl && (
                    <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {app.portfolioUrl && (
                    <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
