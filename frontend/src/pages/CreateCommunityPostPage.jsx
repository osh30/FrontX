import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Image as ImageIcon, Send, X, ArrowLeft, Loader2, EyeOff, Eye,
  ShieldCheck, Tag, Plus, Trash2, Hash, MessageCircle, Globe, Brain,
  GraduationCap, Heart, Award, Star, Briefcase, FileText, Upload,
  CheckCircle, AlertTriangle, Bookmark, Clock, ChevronDown,
  SwitchCamera, List, Layers, FileImage, PenSquare
} from 'lucide-react';
import Avatar from '../component/dashboard/Avatar';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const CATEGORIES = [
  { value: 'Career Advice', label: 'Career Advice', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'Internship', label: 'Internship', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { value: 'Research', label: 'Research', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'Academic Life', label: 'Academic Life', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'University Experience', label: 'University Experience', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { value: 'Mental Pressure', label: 'Mental Pressure', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'Success Story', label: 'Success Story', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'General Discussion', label: 'General Discussion', icon: MessageCircle, color: 'text-gray-600', bg: 'bg-gray-50' }
];

const SUGGESTED_TAGS = [
  'help', 'advice', 'opportunity', 'experience', 'question', 'guide',
  'review', 'tip', 'urgent', 'recommendation', 'support', 'insight'
];

const MAX_CHARS = 5000;

const CreateCommunityPostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const role = user?.role?.toLowerCase() || 'student';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1].value);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState('');

  const [pollOptions, setPollOptions] = useState(['', '']);
  const [enablePoll, setEnablePoll] = useState(false);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState('');

  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const draftTimerRef = useRef(null);
  const lastSavedRef = useRef('');

  const selectedCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[1];
  const CatIcon = selectedCat.icon;
  const charCount = content.length;
  const charPercent = Math.min(100, (charCount / MAX_CHARS) * 100);
  const isOverLimit = charCount > MAX_CHARS;

  const formSnapshot = useCallback(() => JSON.stringify({
    title, content, category, tags, isAnonymous, allowComments, pollOptions, enablePoll,
    uploadedImageUrl, uploadedDocumentUrl, documentName
  }), [title, content, category, tags, isAnonymous, allowComments, pollOptions, enablePoll, uploadedImageUrl, uploadedDocumentUrl, documentName]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/community-posts/draft', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data._id) {
            setTitle(data.title || '');
            setContent(data.content || '');
            setCategory(data.category || CATEGORIES[1].value);
            setTags(data.tags || []);
            setIsAnonymous(data.isAnonymous || false);
            setAllowComments(data.allowComments !== false);
            setPollOptions(data.pollOptions?.length ? data.pollOptions : ['', '']);
            setEnablePoll(data.pollOptions?.length > 0);
            setUploadedImageUrl(data.imageUrl || '');
            setUploadedDocumentUrl(data.documentUrl || '');
            setDocumentName(data.documentName || '');
            if (data.imageUrl) setImagePreview(data.imageUrl);
            if (data.content) setDraftStatus('Draft restored');
          }
        }
      } catch {}
    };
    loadDraft();
  }, [token]);

  useEffect(() => {
    const snapshot = formSnapshot();
    if (snapshot === lastSavedRef.current) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(async () => {
      lastSavedRef.current = snapshot;
      try {
        await fetch('http://localhost:5000/api/community-posts/draft', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title, content, category, tags, isAnonymous, allowComments,
            pollOptions: enablePoll ? pollOptions.filter(o => o.trim()) : [],
            imageUrl: uploadedImageUrl, documentUrl: uploadedDocumentUrl, documentName
          })
        });
        setDraftStatus('Auto-saved');
        setTimeout(() => setDraftStatus(s => s === 'Auto-saved' ? '' : s), 2000);
      } catch {}
    }, 3000);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  }, [title, content, category, tags, isAnonymous, allowComments, pollOptions, enablePoll, uploadedImageUrl, uploadedDocumentUrl, documentName, formSnapshot, token]);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedImageUrl('');
      uploadFileToServer(file, 'image');
    }
  }, []);

  const handleDocumentSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentName(file.name);
      setUploadedDocumentUrl('');
      uploadFileToServer(file, 'document');
    }
  };

  const uploadFileToServer = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch('http://localhost:5000/api/community-posts/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (type === 'image') setUploadedImageUrl(data.url);
        else setUploadedDocumentUrl(data.url);
      }
    } catch {}
  };

  const handleAddTag = (tag) => {
    const t = tag || tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagInputChange = (e) => {
    const val = e.target.value;
    setTagInput(val);
    if (val.endsWith(',')) {
      handleAddTag(val.slice(0, -1));
    } else {
      setShowTagSuggestions(val.length > 0);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const updatePollOption = (idx, val) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handlePublish = async () => {
    if (!content.trim() || isOverLimit) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('isAnonymous', isAnonymous.toString());
      formData.append('allowComments', allowComments.toString());
      formData.append('pollOptions', JSON.stringify(enablePoll ? pollOptions.filter(o => o.trim()) : []));
      if (uploadedImageUrl) formData.append('imageUrl', uploadedImageUrl);
      if (uploadedDocumentUrl) {
        formData.append('documentUrl', uploadedDocumentUrl);
        formData.append('documentName', documentName);
      }

      const res = await fetch('http://localhost:5000/api/community-posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setShowConfirm(false);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard/community'), 2000);
      } else {
        const err = await res.json();
        console.error('Publish failed:', err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await fetch('http://localhost:5000/api/community-posts/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title, content, category, tags, isAnonymous, allowComments,
          pollOptions: enablePoll ? pollOptions.filter(o => o.trim()) : [],
          imageUrl: uploadedImageUrl, documentUrl: uploadedDocumentUrl, documentName
        })
      });
      setDraftStatus('Draft saved!');
      setTimeout(() => setDraftStatus(''), 2000);
    } catch {}
  };

  const canPublish = content.trim().length > 0 && !isOverLimit;

  const previewPost = {
    title: title || 'Post Title',
    content: content || 'Your post content will appear here...',
    category,
    tags,
    isAnonymous,
    allowComments,
    imageUrl: imagePreview || uploadedImageUrl,
    documentName,
    poll: enablePoll ? { options: pollOptions.filter(o => o.trim()).map((text, i) => ({
      _id: i, text, count: 0, voted: false
    })), totalVotes: 0 } : null,
    createdAt: new Date().toISOString(),
    authorRole: role,
    originalAuthor: user ? { name: isAnonymous ? 'Anonymous' : user.name, profilePicture: user.profilePicture, department: user.department } : null
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-3xl">
              <motion.button onClick={() => navigate(-1)}
                whileTap={{ scale: 0.92 }}
                className="relative w-11 h-11 rounded-full bg-white border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-gray-300/80 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer mb-3 flex items-center justify-center overflow-hidden"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/60 group-hover:to-gray-100/0 transition-all duration-500 pointer-events-none" />
                <ArrowLeft className="w-4 h-4 text-gray-900 group-hover:-translate-x-0.5 transition-transform duration-300 relative z-10" />
              </motion.button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1628] via-[#1a0a3e] to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/10 shrink-0">
                  <PenSquare className="w-5 h-5 text-white" />
                </div>
                Create Community Post
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Share your thoughts with the community</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {draftStatus && (
                <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {draftStatus}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-sm mx-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Posted Successfully!</h2>
              <p className="text-gray-500">Your post has been published. Redirecting to community...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Publish this post?</h2>
              <p className="text-gray-500 text-center text-sm mb-8">
                {isAnonymous
                  ? 'Your post will be published anonymously. This cannot be undone.'
                  : 'Your post will be visible to everyone in the community.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handlePublish} disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* LEFT: Form */}
          <div className="flex-1 max-w-3xl space-y-8">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" /> Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = category === cat.value;
                  return (
                    <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        isActive
                          ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-500" /> Post Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-500" /> What's on your mind? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea ref={contentRef} value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share your thoughts, experiences, questions, or concerns..."
                  className="w-full min-h-[200px] p-5 bg-white border border-gray-200 rounded-2xl resize-y focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 leading-relaxed placeholder-gray-400" />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isOverLimit ? 'bg-red-100 text-red-600' : charCount > MAX_CHARS * 0.9 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {charCount}/{MAX_CHARS}
                  </div>
                </div>
              </div>
              {isOverLimit && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" /> Character limit exceeded
                </p>
              )}
              {/* Progress bar */}
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  isOverLimit ? 'bg-red-500' : charCount > MAX_CHARS * 0.9 ? 'bg-amber-500' : 'bg-purple-500'
                }`} style={{ width: `${Math.min(100, charPercent)}%` }} />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" /> Image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleImageDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-purple-400 bg-purple-50' : imagePreview ? 'border-transparent bg-transparent' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
                }`}>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageDrop} />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl object-cover shadow-sm" />
                    <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setUploadedImageUrl(''); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Drop an image here or click to browse</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> Document / PDF <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div onClick={() => docInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all">
                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleDocumentSelect} />
                {documentName ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{documentName}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); setDocumentFile(null); setDocumentName(''); setUploadedDocumentUrl(''); }}
                      className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Upload className="w-4 h-4" />
                    <span>Attach a document (PDF, DOC, TXT)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Poll */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <List className="w-4 h-4 text-purple-500" /> Poll <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <button type="button" onClick={() => { setEnablePoll(!enablePoll); if (!enablePoll) setPollOptions(['', '']); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    enablePoll ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {enablePoll ? 'Remove Poll' : 'Add Poll'}
                </button>
              </div>
              <AnimatePresence>
                {enablePoll && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden">
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <input type="text" value={opt}
                          onChange={e => updatePollOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                        {pollOptions.length > 2 && (
                          <button type="button" onClick={() => removePollOption(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <button type="button" onClick={addPollOption}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                        <Plus className="w-4 h-4" /> Add option
                      </button>
                    )}
                    <p className="text-xs text-gray-400">{pollOptions.length}/4 options</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" /> Tags <span className="text-gray-400 font-normal">(optional, up to 10)</span>
              </label>
              <div className="relative">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}
                        className="text-purple-400 hover:text-purple-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input type="text" value={tagInput}
                    onChange={handleTagInputChange}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Type a tag and press Enter, or select from suggestions..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  <AnimatePresence>
                    {showTagSuggestions && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2 max-h-48 overflow-y-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTED_TAGS.filter(t => !tags.includes(t) && (!tagInput || t.includes(tagInput.toLowerCase()))).map(t => (
                            <button key={t} type="button" onMouseDown={() => handleAddTag(t)}
                              className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full hover:bg-purple-50 hover:text-purple-700 border border-gray-200 transition-all">
                              {t}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {role !== 'alumni' && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAnonymous ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {isAnonymous ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Anonymous Post</p>
                      <p className="text-xs text-gray-500">{isAnonymous ? 'Hidden identity' : 'Show identity'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${allowComments ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <MessageCircle className={`w-4 h-4 ${allowComments ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Allow Comments</p>
                    <p className="text-xs text-gray-500">{allowComments ? 'Comments enabled' : 'Comments disabled'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={allowComments} onChange={e => setAllowComments(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="hidden xl:block w-[420px] shrink-0">
            <div className="sticky top-28">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Post Card Preview */}
                <div className="p-5">
                  {/* Author */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {previewPost.isAnonymous ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          <EyeOff className="w-4 h-4 text-purple-500" />
                        </div>
                      ) : (
                        <Avatar src={previewPost.originalAuthor?.profilePicture} alt={previewPost.originalAuthor?.name} size={40} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {previewPost.isAnonymous ? 'Anonymous Student' : previewPost.originalAuthor?.name || 'You'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {previewPost.originalAuthor?.department || ''} • Just now
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {previewPost.category}
                    </span>
                  </div>

                  {previewPost.title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{previewPost.title}</h3>
                  )}

                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {previewPost.content.length > 300
                      ? previewPost.content.substring(0, 300) + '...'
                      : previewPost.content}
                  </p>

                  {previewPost.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                      <img src={previewPost.imageUrl} alt="" className="w-full h-auto max-h-64 object-cover" />
                    </div>
                  )}

                  {previewPost.documentName && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 truncate">{previewPost.documentName}</span>
                    </div>
                  )}

                  {previewPost.poll && previewPost.poll.options.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Poll</p>
                      <div className="space-y-2">
                        {previewPost.poll.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-sm text-gray-700">{opt.text || `Option ${idx + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewPost.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {previewPost.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reactions placeholder */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-gray-400">
                    <span className="flex items-center gap-1 text-xs"><Heart className="w-4 h-4" /> 0</span>
                    <span className="flex items-center gap-1 text-xs"><MessageCircle className="w-4 h-4" /> 0</span>
                    <span className="flex items-center gap-1 text-xs"><Bookmark className="w-4 h-4" /> 0</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {previewPost.allowComments ? 'Comments on' : 'Comments off'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-sm shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Before You Publish</p>
                    <p className="text-xs text-gray-500 mt-0.5">Community Posting Guidelines</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    'Be respectful and professional.',
                    'Do not share offensive or inappropriate content.',
                    'Protect personal and confidential information.',
                    'Share verified and helpful information only.',
                    'Use the correct category and relevant tags.',
                    'Respect copyright when sharing documents or images.',
                    'Avoid spam, duplicate posts, and advertisements.',
                    'Keep discussions constructive and related to the university community.'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-purple-200/50">
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">By publishing this post, you agree to follow the Frontx Community Guidelines.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {role !== 'alumni' && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-purple-500" />
                Posting as {isAnonymous ? 'Anonymous' : user?.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => setShowPreview(true)}
              className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 text-sm xl:hidden">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button onClick={() => navigate('/dashboard/community')}
              className="px-5 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors text-sm">
              Cancel
            </button>
            <button onClick={() => canPublish && setShowConfirm(true)} disabled={!canPublish}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
              <Send className="w-4 h-4" /> Publish Post
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto xl:hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-gray-900">Post Preview</h3>
              <button onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {previewPost.isAnonymous ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          <EyeOff className="w-4 h-4 text-purple-500" />
                        </div>
                      ) : (
                        <Avatar src={previewPost.originalAuthor?.profilePicture} alt={previewPost.originalAuthor?.name} size={40} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {previewPost.isAnonymous ? 'Anonymous Student' : previewPost.originalAuthor?.name || 'You'}
                        </p>
                        <p className="text-xs text-gray-400">Just now</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {previewPost.category}
                    </span>
                  </div>
                  {previewPost.title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{previewPost.title}</h3>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{previewPost.content}</p>
                  {previewPost.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                      <img src={previewPost.imageUrl} alt="" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}
                  {previewPost.documentName && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 truncate">{previewPost.documentName}</span>
                    </div>
                  )}
                  {previewPost.poll?.options?.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Poll</p>
                      <div className="space-y-2">
                        {previewPost.poll.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-sm text-gray-700">{opt.text || `Option ${idx + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewPost.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {previewPost.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCommunityPostPage;
