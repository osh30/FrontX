import { API_BASE, SOCKET_URL } from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  ArrowLeft, Download, Bookmark, Clock, Eye, ShieldCheck,
  Tag, Users, CheckCircle, ExternalLink, Star, Sparkles,
  Edit3, Trash2, Save, X, FileText, Calendar, FileImage
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from '../component/dashboard/Avatar';

const CATEGORY_LABELS = {
  '📚 Book / eBook': 'Book / eBook',
  '📄 Research Paper': 'Research Paper',
  '🎓 Course Material': 'Course Material',
  '📝 Academic Notes': 'Academic Notes',
  '💼 Career Guide': 'Career Guide',
  '🎤 Interview Preparation': 'Interview Preparation',
  '🔬 Research Guide': 'Research Guide',
  '🧑‍💻 Project Resource': 'Project Resource',
  '📊 Industry Report': 'Industry Report',
  '🎥 Video Resource': 'Video Resource',
  '🔗 Useful Website': 'Useful Website',
  '📁 Other': 'Other'
};

const TARGET_AUDIENCES = [
  "All Students", "CSE Students", "EEE Students", "BBA Students",
  "Research Interested Students", "Final Year Students", "Freshers", "Other"
];

const READING_TIMES = ["15 Minutes", "30 Minutes", "1 Hour", "2 Hours", "3+ Hours"];

const FILE_TYPE_STYLES = {
  PDF: 'text-red-600 bg-red-50 border-red-200',
  PPT: 'text-orange-600 bg-orange-50 border-orange-200',
  DOCX: 'text-blue-600 bg-blue-50 border-blue-200',
  ZIP: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  LINK: 'text-green-600 bg-green-50 border-green-200',
  FILE: 'text-gray-600 bg-gray-50 border-gray-200'
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

const getFileType = (r) => {
  if (r.fileType) return r.fileType;
  const url = r.fileUrl || r.externalLink || '';
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  if (r.uploadType === 'ExternalLink') return 'LINK';
  if (['pdf'].includes(ext)) return 'PDF';
  if (['ppt', 'pptx'].includes(ext)) return 'PPT';
  if (['doc', 'docx'].includes(ext)) return 'DOCX';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ZIP';
  return 'FILE';
};

const isPreviewable = (fileType, fileUrl) => {
  if (!fileUrl) return false;
  const ext = fileUrl.split('.').pop()?.toLowerCase().split('?')[0] || '';
  const previewableExts = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ppt', 'pptx'];
  return previewableExts.includes(ext) || ['PDF', 'PPT'].includes(fileType) || fileUrl.match(/\.(pdf|png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i);
};

const ResourceDetailsPage = ({ resourceId: propId, standalone: isStandalone = true }) => {
  const { id: paramsId } = useParams();
  const location = useLocation();
  const id = propId || paramsId;
  const cachedResource = location.state?.resource;
  const navigate = useNavigate();
  const [resource, setResource] = useState(cachedResource || null);
  const [loading, setLoading] = useState(!cachedResource);
  const [isBookmarked, setIsBookmarked] = useState(cachedResource?.isBookmarked || false);
  const [downloadCount, setDownloadCount] = useState(cachedResource?.downloads || 0);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '', description: '', category: '', targetAudience: [],
    tags: [], readingTime: '', whyUse: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setCurrentUser(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      if (!cachedResource) {
        toast.error("Resource not found");
        navigate('/dashboard/resources');
      }
      return;
    }
    if (cachedResource) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[ResourceDetailsPage] Fetching resource:', id);
        const res = await fetch(`${API_BASE}/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setResource(data);
          setIsBookmarked(data.isBookmarked);
          setDownloadCount(data.downloads || data.downloadCount || 0);
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('[ResourceDetailsPage] API error:', res.status, errData);
          if (!cachedResource) {
            toast.error(errData.message || "Resource not found");
            navigate('/dashboard/resources');
          }
        }
      } catch (err) {
        console.error('[ResourceDetailsPage] Fetch error:', err);
        if (!cachedResource) {
          toast.error("Error loading resource");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchResource();
    return () => { cancelled = true; };
  }, [id, navigate, cachedResource]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('resource_downloaded', (data) => {
      if (data.resourceId === id) setDownloadCount(data.downloads);
    });
    socket.on('resource_bookmarked', (data) => {
      if (data.resourceId === id) setIsBookmarked(data.bookmarked);
    });
    return () => socket.disconnect();
  }, [id]);

  const isOwner = currentUser && resource && currentUser._id === resource.alumniId?._id;
  const fileType = resource ? getFileType(resource) : '';
  const canPreview = resource ? isPreviewable(fileType, resource.fileUrl) : false;

  const startEditing = () => {
    setEditForm({
      title: resource.title, description: resource.description, category: resource.category,
      targetAudience: [...(resource.targetAudience || [])], tags: [...(resource.tags || [])],
      readingTime: resource.readingTime || '15 Minutes', whyUse: resource.whyUse
    });
    setIsEditing(true);
  };

  const cancelEditing = () => { setIsEditing(false); setTagInput(''); };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: editForm.title, description: editForm.description, category: editForm.category,
        targetAudience: JSON.stringify(editForm.targetAudience), tags: JSON.stringify(editForm.tags),
        readingTime: editForm.readingTime, whyUse: editForm.whyUse
      };
      const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setResource(await res.json());
        setIsEditing(false);
        toast.success("Resource updated successfully");
      } else {
        toast.error((await res.json()).message || "Failed to update");
      }
    } catch { toast.error("Server error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast.success("Resource deleted"); navigate('/dashboard'); }
      else { toast.error((await res.json()).message || "Failed to delete"); }
    } catch { toast.error("Server error"); }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resources/${id}/bookmark`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Resource bookmarked' : 'Bookmark removed');
      }
    } catch { console.error; }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/resources/${id}/download`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      setDownloadCount(prev => prev + 1);
      if (resource.uploadType === 'File' && resource.fileUrl) {
        window.open(resource.fileUrl, '_blank');
      } else if (resource.uploadType === 'ExternalLink' && resource.externalLink) {
        window.open(resource.externalLink, '_blank');
      }
    } catch { console.error; }
  };

  const handlePreview = () => {
    if (!canPreview || !resource.fileUrl) {
      window.open(resource.fileUrl || resource.externalLink, '_blank');
      return;
    }
    setShowPreview(true);
    setPreviewError(false);
    handleDownload();
  };

  const toggleAudience = (audience) => {
    setEditForm(prev => {
      const current = prev.targetAudience;
      if (current.includes(audience)) return { ...prev, targetAudience: current.filter(a => a !== audience) };
      return { ...prev, targetAudience: [...current, audience] };
    });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !editForm.tags.includes(tag)) setEditForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setEditForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className={`${isStandalone ? 'min-h-screen pt-24' : 'pt-2'} bg-gray-50 flex flex-col items-center px-6 pb-20 relative overflow-hidden`}>
      {isStandalone && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-purple-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-200/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
        </div>
      )}

      <div className="max-w-5xl w-full relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard/resources')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium bg-white/60 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </button>

          <div className="flex items-center gap-2">
            {isOwner && !isEditing && (
              <>
                <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 font-semibold text-sm hover:bg-blue-100 transition-all">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-200 font-semibold text-sm hover:bg-red-100 transition-all">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow-sm transition-all border ${
                isBookmarked ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden"
        >
          {isEditing ? (
            <div className="p-8 md:p-10 space-y-8">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wider">EDITING</div>
              <div className="space-y-4">
                <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full text-3xl font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400" />
                <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400">
                  {Object.keys(CATEGORY_LABELS).map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
                </select>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full min-h-[120px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-y" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Why Use This</h3>
                <textarea value={editForm.whyUse} onChange={e => setEditForm(p => ({ ...p, whyUse: e.target.value }))}
                  className="w-full min-h-[100px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-y" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_AUDIENCES.map(audience => (
                      <button key={audience} type="button" onClick={() => toggleAudience(audience)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          editForm.targetAudience.includes(audience) ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {editForm.targetAudience.includes(audience) && <CheckCircle className="w-3 h-3 inline-block mr-1" />}
                        {audience}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Tags</h3>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                      placeholder="Add tag..." className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                    <button onClick={handleAddTag} className="px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-purple-400 hover:text-purple-700"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Reading Time</h3>
                <select value={editForm.readingTime} onChange={e => setEditForm(p => ({ ...p, readingTime: e.target.value }))}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400">
                  {READING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                <button onClick={cancelEditing}
                  className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wider">{resource.category}</span>
                  {resource.isFeatured && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{resource.title}</h1>

                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-6">
                  {resource.readingTime && (
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {resource.readingTime}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatCount(resource.views)} views</span>
                  <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {formatCount(downloadCount)} downloads</span>
                  {resource.averageRating > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Star className={`w-4 h-4 ${resource.averageRating >= 4 ? 'text-amber-400' : 'text-gray-300'}`} />
                      {resource.averageRating.toFixed(1)} ({resource.ratingCount})
                    </span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(resource.createdAt)}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${FILE_TYPE_STYLES[fileType] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                    <FileText className="w-3.5 h-3.5" /> {fileType}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm inline-flex">
                  <Avatar src={resource.alumniId?.profilePicture} alt={resource.alumniId?.name} size={48} className="border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Shared By</p>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900">{resource.alumniId?.name || 'Unknown'}</h3>
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    {resource.alumniId?.department && (
                      <p className="text-xs text-gray-500 mt-0.5">{resource.alumniId.department}</p>
                    )}
                    {resource.alumniId?.careerInterest && (
                      <p className="text-xs text-gray-400 mt-0.5">{resource.alumniId.careerInterest}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                {resource.fileSize && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-700">File Size:</span> {resource.fileSize}
                    {resource.uploadType === 'File' && <span className="text-purple-600 font-medium ml-1">(Uploaded File)</span>}
                    {resource.uploadType === 'ExternalLink' && <span className="text-cyan-600 font-medium ml-1">(External Link)</span>}
                  </div>
                )}

                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{resource.description}</p>
                </section>

                {resource.whyUse && (
                  <section className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" /> Why Use This Resource
                    </h2>
                    <p className="text-blue-800 leading-relaxed">{resource.whyUse}</p>
                  </section>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {resource.targetAudience?.length > 0 && (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Target Audience
                      </h3>
                      <ul className="space-y-2">
                        {resource.targetAudience.map((aud, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-800 font-medium">
                            <CheckCircle className="w-4 h-4 text-green-500" /> {aud}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resource.tags?.length > 0 && (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg shadow-sm">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                {(resource.fileUrl || resource.externalLink) && (
                  <section className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        {canPreview ? <Eye className="w-4 h-4 text-purple-500" /> : <ExternalLink className="w-4 h-4 text-blue-500" />}
                        {canPreview ? 'Preview' : 'Resource Link'}
                      </h3>
                      {canPreview && !showPreview && (
                        <button onClick={handlePreview}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Open Preview
                        </button>
                      )}
                      {showPreview && (
                        <button onClick={() => setShowPreview(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" /> Close
                        </button>
                      )}
                    </div>
                    {showPreview && canPreview && (
                      <div className="bg-white">
                        {previewError ? (
                          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FileImage className="w-12 h-12 mb-3" />
                            <p className="text-sm">Preview could not be loaded</p>
                            <button onClick={() => { setPreviewError(false); window.open(resource.fileUrl, '_blank'); }}
                              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                              Open in New Tab
                            </button>
                          </div>
                        ) : fileType === 'PDF' || resource.fileUrl?.match(/\.pdf(\?.*)?$/i) ? (
                          <iframe
                            src={resource.fileUrl}
                            className="w-full h-[600px]"
                            title="PDF Preview"
                            onError={() => setPreviewError(true)}
                          />
                        ) : resource.fileUrl?.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i) ? (
                          <div className="flex items-center justify-center p-4 bg-gray-50">
                            <img src={resource.fileUrl} alt={resource.title} className="max-w-full max-h-[600px] rounded-lg shadow-sm"
                              onError={() => setPreviewError(true)} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FileText className="w-12 h-12 mb-3" />
                            <p className="text-sm">Preview not available for this file type</p>
                          </div>
                        )}
                      </div>
                    )}
                    {!showPreview && resource.fileUrl && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <p className="mb-2">Click "Open Preview" to view this resource in your browser</p>
                        <p className="text-xs text-gray-400">or use the buttons below to download or preview in a new tab</p>
                      </div>
                    )}
                    {!showPreview && resource.uploadType === 'ExternalLink' && resource.externalLink && (
                      <div className="p-4 text-center">
                        <a href={resource.externalLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
                          <ExternalLink className="w-4 h-4" /> Open External Link
                        </a>
                      </div>
                    )}
                  </section>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                  {canPreview && (
                    <button onClick={handlePreview}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <Eye className="w-6 h-6" /> Preview
                    </button>
                  )}
                  {resource.uploadType === 'File' && resource.fileUrl && (
                    <button onClick={handleDownload}
                      className="flex-1 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <Download className="w-6 h-6" /> Download
                    </button>
                  )}
                  {resource.uploadType === 'ExternalLink' && resource.externalLink && (
                    <a href={resource.externalLink} target="_blank" rel="noopener noreferrer"
                      className="flex-1 px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <ExternalLink className="w-6 h-6" /> Open Link
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;
