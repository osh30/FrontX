import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Mail, Briefcase, Search, X, Minus, Maximize2, Minimize2,
  ExternalLink, MapPin, ArrowRight, Send, Loader2, Paperclip, Type, Trash2, FileText
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Gmail-style Compose Window State
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [emailRecruiter, setEmailRecruiter] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/recruiters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecruiters(data);
      }
    } catch (err) {
      console.error('Error fetching recruiters:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecruiters = recruiters.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.companyName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.bio?.toLowerCase().includes(q)
    );
  });

  const handleCardClick = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setShowDrawer(true);
  };

  const handleOpenComposeWindow = (recruiter, e) => {
    if (e) e.stopPropagation();
    if (!recruiter || !recruiter.email || !recruiter.email.includes('@')) {
      toast.error('This recruiter does not have a valid email address.');
      return;
    }
    setEmailRecruiter(recruiter);
    setEmailSubject('');
    setEmailMessage('');
    setAttachedFile(null);
    setIsMinimized(false);
    setIsMaximized(false);
    setShowEmailCompose(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }
      setAttachedFile(file);
      toast.success(`Attached: ${file.name}`);
    }
  };

  const handleSendPlatformEmail = async (e) => {
    if (e) e.preventDefault();

    if (!emailRecruiter || !emailRecruiter.email) {
      toast.error('This recruiter does not have a valid email address.');
      return;
    }

    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject line.');
      return;
    }

    if (!emailMessage.trim()) {
      toast.error('Please write your message before sending.');
      return;
    }

    setSendingEmail(true);

    try {
      const token = localStorage.getItem('token');
      let attachmentUrl = '';

      // Upload file to Cloudinary if attached
      if (attachedFile) {
        const formData = new FormData();
        formData.append('file', attachedFile);
        try {
          const uploadRes = await fetch(`${API_BASE}/users/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            attachmentUrl = uploadData.fileUrl || uploadData.url || '';
          }
        } catch (uploadErr) {
          console.warn('Attachment upload failed, proceeding with message:', uploadErr);
        }
      }

      const res = await fetch(`${API_BASE}/users/send-recruiter-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recruiterEmail: emailRecruiter.email,
          recruiterId: emailRecruiter._id,
          subject: emailSubject.trim(),
          message: emailMessage.trim(),
          attachmentUrl
        })
      });

      if (res.ok) {
        toast.success('Email sent successfully.');
        setShowEmailCompose(false);
        setEmailSubject('');
        setEmailMessage('');
        setAttachedFile(null);
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Unable to send email. Please try again.');
      }
    } catch (err) {
      toast.error('Unable to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ===== HERO BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 md:p-10 border border-slate-700/50 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" /> Hiring Ecosystem
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Connected Recruiters</h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Explore corporate recruiters and talent acquisition leads connected with FrontX. Click any recruiter card to view opportunities or compose direct email inquiries.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <p className="text-2xl font-black text-white">{recruiters.length}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Recruiters</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-black text-blue-400">100%</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Partners</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== SEARCH BAR ===== */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recruiters by name, company, or domain..."
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* ===== RECRUITER CARDS GRID ===== */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredRecruiters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No recruiters found</h3>
          <p className="text-sm text-slate-500 mt-1">Try refining your search query.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecruiters.map((recruiter, idx) => (
            <motion.div
              key={recruiter._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCardClick(recruiter)}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                {/* Header: Profile image & Clean Top Section without Verified Recruiter Badge */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-0.5 shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {recruiter.companyLogo || recruiter.profilePicture ? (
                      <img
                        src={recruiter.companyLogo || recruiter.profilePicture}
                        alt={recruiter.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {recruiter.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {recruiter.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{recruiter.companyName || 'Corporate Partner'}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {recruiter.bio || 'Talent Acquisition Leader connecting top candidates with growth opportunities.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleOpenComposeWindow(recruiter, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Recruiter
                </button>
                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white text-xs font-bold transition-all">
                  Profile <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== RECRUITER DETAILS DRAWER ===== */}
      <AnimatePresence>
        {showDrawer && selectedRecruiter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Recruiter Details</h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Profile Card Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white p-0.5 shadow-md overflow-hidden shrink-0">
                      {selectedRecruiter.companyLogo || selectedRecruiter.profilePicture ? (
                        <img
                          src={selectedRecruiter.companyLogo || selectedRecruiter.profilePicture}
                          alt={selectedRecruiter.name}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-2xl">
                          {selectedRecruiter.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedRecruiter.name}</h2>
                      <p className="text-xs text-blue-400 font-semibold mt-0.5">{selectedRecruiter.companyName || 'Corporate Partner'}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs gap-3">
                    <button
                      onClick={(e) => {
                        setShowDrawer(false);
                        handleOpenComposeWindow(selectedRecruiter, e);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                    >
                      <Mail className="w-4 h-4" /> Email Recruiter
                    </button>
                    <span className="text-slate-400 text-[11px] truncate select-all">{selectedRecruiter.email}</span>
                  </div>
                </div>

                {/* About / Bio Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About Recruiter</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {selectedRecruiter.bio || 'Talent Acquisition Leader dedicated to connecting top tech candidates with growth opportunities.'}
                  </div>
                </div>

                {/* Active Job Opportunities */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posted Opportunities</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {selectedRecruiter.opportunities?.length || 0} Listed
                    </span>
                  </div>

                  {!selectedRecruiter.opportunities || selectedRecruiter.opportunities.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No active job posts directly listed right now</p>
                      <p className="text-[11px] text-slate-400 mt-1">Check back soon or contact recruiter directly.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRecruiter.opportunities.map((opp, i) => (
                        <div
                          key={opp._id || i}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{opp.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                              {(opp.type || opp.opportunityType) && (
                                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {opp.type || opp.opportunityType}
                                </span>
                              )}
                              {opp.location && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {opp.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowDrawer(false);
                              navigate(`/dashboard/career?opp=${opp._id}`);
                            }}
                            className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all shrink-0"
                            title="View Job Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== GMAIL-STYLE COMPOSE WINDOW FLOATING INTERFACE ===== */}
      <AnimatePresence>
        {showEmailCompose && emailRecruiter && (
          <div className="fixed inset-0 sm:inset-auto z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className={`pointer-events-auto bg-white shadow-2xl border border-slate-300 flex flex-col font-sans transition-all duration-300 ${
                isMaximized
                  ? 'fixed inset-4 sm:inset-10 z-50 rounded-2xl'
                  : isMinimized
                  ? 'fixed bottom-0 right-4 sm:right-8 w-72 sm:w-80 h-11 rounded-t-xl overflow-hidden z-50'
                  : 'fixed inset-0 sm:inset-auto sm:bottom-0 sm:right-8 w-full sm:w-[560px] h-full sm:h-[520px] rounded-none sm:rounded-t-2xl z-50'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => setIsMinimized(!isMinimized)}
                className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none rounded-t-none sm:rounded-t-2xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-xs tracking-wide truncate">
                    {isMinimized ? `Message: ${emailRecruiter.name}` : 'New Message'}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMinimized(false);
                      setIsMaximized(!isMaximized);
                    }}
                    className="hidden sm:block p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                    title={isMaximized ? 'Restore' : 'Maximize'}
                  >
                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailCompose(false)}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-300 transition-colors"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Compose Window Content (Hidden if Minimized) */}
              {!isMinimized && (
                <form onSubmit={handleSendPlatformEmail} className="flex-1 flex flex-col bg-white overflow-hidden">
                  {/* Recipient Row */}
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 select-none w-8">To</span>
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap py-0.5">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                        {emailRecruiter.name} &lt;{emailRecruiter.email}&gt;
                      </span>
                    </div>
                  </div>

                  {/* Subject Row */}
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent py-1"
                    />
                  </div>

                  {/* Message Editor Area */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col">
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Write your message..."
                      className="w-full flex-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-sans"
                    />

                    {/* Attached File Badge */}
                    {attachedFile && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-xl self-start">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold truncate max-w-[200px]">{attachedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="hover:text-red-600 transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />

                  {/* Action Bar Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={sendingEmail}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                          </>
                        ) : (
                          <>
                            Send <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                        title="Attach file"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.success('Standard plain-text editor active')}
                        className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                        title="Formatting options"
                      >
                        <Type className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject('');
                        setEmailMessage('');
                        setAttachedFile(null);
                        setShowEmailCompose(false);
                      }}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      title="Discard draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruitersPage;
