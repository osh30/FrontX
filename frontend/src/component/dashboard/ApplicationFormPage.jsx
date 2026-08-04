import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Upload, X, FileText, CheckCircle2, AlertCircle, Send, Building2, GraduationCap, MapPin, Globe, User, Mail, BookOpen, Award, Briefcase } from 'lucide-react';

export default function ApplicationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const id = pathParts[4];
  const [opp, setOpp] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    currentAddress: '',
    skills: '',
    languages: '',
    coverLetter: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });

  const [files, setFiles] = useState({
    resumeFile: null,
    transcriptFile: null,
    certificates: [],
    portfolioFile: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(`/api/opportunities/${id}`, { headers });
        setOpp(data.opportunity);

        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load opportunity');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (field, e) => {
    const selectedFiles = Array.from(e.target.files);
    if (field === 'certificates') {
      setFiles(prev => ({ ...prev, certificates: [...prev.certificates, ...selectedFiles] }));
    } else {
      setFiles(prev => ({ ...prev, [field]: selectedFiles[0] }));
    }
    e.target.value = '';
  };

  const removeFile = (field, index) => {
    if (field === 'certificates') {
      setFiles(prev => ({
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to apply');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('phone', form.phone);
      formData.append('currentAddress', form.currentAddress);
      formData.append('skills', form.skills);
      formData.append('languages', form.languages);
      formData.append('coverLetter', form.coverLetter);
      formData.append('githubUrl', form.githubUrl);
      formData.append('linkedinUrl', form.linkedinUrl);
      formData.append('portfolioUrl', form.portfolioUrl);
      if (user) {
        formData.append('applicantDepartment', user.department || '');
        formData.append('applicantStudentId', user.studentId || '');
        formData.append('applicantSession', user.session || '');
        formData.append('applicantGraduationYear', user.graduationYear || '');
      }

      if (files.resumeFile) formData.append('resumeFile', files.resumeFile);
      if (files.transcriptFile) formData.append('transcriptFile', files.transcriptFile);
      if (files.portfolioFile) formData.append('portfolioFile', files.portfolioFile);
      files.certificates.forEach(f => formData.append('certificates', f));

      const { data } = await axios.post(`/api/opportunities/${id}/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const currentRole = localStorage.getItem('currentRole');

  const handleBack = () => {
    if (pathParts[2] === 'career') {
      navigate(`/dashboard/career/${id}`);
    } else {
      navigate(`/dashboard/opportunities/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error && !opp) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-300">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-violet-400 hover:text-violet-300">Go back</button>
        </div>
      </div>
    );
  }

  if (!opp) return null;

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Application Submitted Successfully</h2>
          <p className="text-slate-400 mb-6">Your application for {opp.title} at {opp.companyName} has been sent to the recruiter.</p>
          <button
            onClick={() => navigate(`/dashboard/${currentRole === 'student' ? 'career' : 'opportunities'}/my-applications`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/20"
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  const recruiter = opp.recruiter || {};
  const isStudent = currentRole === 'student';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={handleBack} className="flex items-center gap-2 text-black">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Opportunity</span>
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-6 sm:p-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            {recruiter.companyLogo || opp.companyLogo ? (
              <img src={recruiter.companyLogo || opp.companyLogo} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-violet-300" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{opp.title}</h1>
            <p className="text-violet-300 font-medium">{recruiter.companyName || opp.companyName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-filled Info */}
        <section className="rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-6 sm:p-8">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">{user?.name || '—'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">{user?.email || '—'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Department</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">{user?.department || '—'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{isStudent ? 'Student ID' : 'Alumni ID'}</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">{user?.studentId || '—'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{isStudent ? 'Session' : 'Graduation Year'}</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">
                {isStudent ? (user?.session || '—') : (user?.graduationYear || '—')}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">University</label>
              <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70">University of Frontier Technology</div>
            </div>
          </div>
        </section>

        {/* Applicant Fill-in Fields */}
        <section className="rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-6 sm:p-8">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-violet-400" /> Application Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
              <input
                name="phone" value={form.phone} onChange={handleChange} required
                placeholder="+880 1XXX-XXXXXX"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Address <span className="text-red-400">*</span></label>
              <input
                name="currentAddress" value={form.currentAddress} onChange={handleChange} required
                placeholder="Your current address"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Skills <span className="text-red-400">*</span></label>
              <input
                name="skills" value={form.skills} onChange={handleChange} required
                placeholder="React, Node.js, Python, ..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Languages <span className="text-red-400">*</span></label>
              <input
                name="languages" value={form.languages} onChange={handleChange} required
                placeholder="Bengali, English, ..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Cover Letter</label>
              <textarea
                name="coverLetter" value={form.coverLetter} onChange={handleChange}
                rows={5}
                placeholder="Tell the recruiter about yourself, your skills, and why you're a great fit for this role..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">GitHub URL <span className="text-slate-500">(optional)</span></label>
              <input
                name="githubUrl" value={form.githubUrl} onChange={handleChange}
                placeholder="https://github.com/your-profile"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">LinkedIn URL <span className="text-slate-500">(optional)</span></label>
              <input
                name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Portfolio URL <span className="text-slate-500">(optional)</span></label>
              <input
                name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange}
                placeholder="https://your-portfolio.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
          </div>
        </section>

        {/* Document Uploads */}
        <section className="rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1a2342] to-[#0d1b36] border border-white/5 p-6 sm:p-8">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Upload className="w-4 h-4 text-violet-400" /> Documents
          </h2>
          <div className="space-y-5">
            <FileUploadField
              label="Resume / CV"
              required
              accept=".pdf"
              file={files.resumeFile}
              onFileChange={(e) => handleFileChange('resumeFile', e)}
              onRemove={() => removeFile('resumeFile')}
            />
            <FileUploadField
              label="Transcript"
              accept=".pdf"
              file={files.transcriptFile}
              onFileChange={(e) => handleFileChange('transcriptFile', e)}
              onRemove={() => removeFile('transcriptFile')}
            />
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Certificates
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {files.certificates.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 text-xs border border-violet-500/20">
                    <FileText className="w-3.5 h-3.5" />
                    {f.name.length > 25 ? f.name.slice(0, 22) + '...' : f.name}
                    <button type="button" onClick={() => removeFile('certificates', i)} className="text-red-400 hover:text-red-300 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <label className="flex items-center justify-center w-full p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all cursor-pointer">
                <div className="text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Click to upload certificates</p>
                </div>
                <input type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFileChange('certificates', e)} />
              </label>
            </div>
            <FileUploadField
              label="Portfolio PDF"
              accept=".pdf"
              file={files.portfolioFile}
              onFileChange={(e) => handleFileChange('portfolioFile', e)}
              onRemove={() => removeFile('portfolioFile')}
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FileUploadField({ label, required, accept, file, onFileChange, onRemove }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {file ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">{file.name}</span>
            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-full p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all cursor-pointer">
          <div className="text-center">
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Click to upload PDF</p>
          </div>
          <input type="file" accept={accept} className="hidden" onChange={onFileChange} />
        </label>
      )}
    </div>
  );
}
