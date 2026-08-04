import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PenTool, ArrowLeft, Image, Tag, X, Plus, Eye, Send, Loader2,
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Code,
  Quote, Table2, Link2, Video, Minus, Heading1, Heading2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const CATEGORIES = [
  'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
  'AI', 'Scholarship', 'Productivity', 'University Life',
  'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
];

const CATEGORY_COLORS = {
  'Study Tips': 'bg-emerald-100 text-emerald-700',
  'Career': 'bg-blue-100 text-blue-700',
  'Internship': 'bg-orange-100 text-orange-700',
  'Research': 'bg-purple-100 text-purple-700',
  'Programming': 'bg-cyan-100 text-cyan-700',
  'AI': 'bg-violet-100 text-violet-700',
  'Scholarship': 'bg-amber-100 text-amber-700',
  'Productivity': 'bg-teal-100 text-teal-700',
  'University Life': 'bg-pink-100 text-pink-700',
  'Project Showcase': 'bg-indigo-100 text-indigo-700',
  'Success Story': 'bg-yellow-100 text-yellow-700',
  'Events': 'bg-rose-100 text-rose-700',
  'Technology': 'bg-sky-100 text-sky-700',
  'Others': 'bg-gray-100 text-gray-700'
};

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleHeading = (level) => {
    execCmd('formatBlock', `h${level}`);
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      execCmd('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      execCmd('insertImage', imageUrl);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleInsertVideo = () => {
    if (imageUrl) {
      const embed = `<div class="video-embed" contenteditable="false"><iframe src="${imageUrl}" width="100%" height="315" frameborder="0" allowfullscreen></iframe></div>`;
      execCmd('insertHTML', embed);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleInsertTable = () => {
    const table = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin:16px 0;"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr><tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr></table>`;
    execCmd('insertHTML', table);
  };

  const handleInsertDivider = () => {
    execCmd('insertHTML', '<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />');
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handlePublish = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!title.trim()) return toast.error('Title is required');
    if (!summary.trim()) return toast.error('Summary is required');
    if (!category) return toast.error('Please select a category');
    if (!content || content === '<br>' || content === '<div><br></div>') return toast.error('Content is required');

    setPublishing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/blogs`, {
        title: title.trim(),
        summary: summary.trim(),
        content,
        coverImage: coverImage || null,
        category,
        tags
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Blog published successfully!');
      navigate('/dashboard/blog');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish blog');
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/blog')}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Blog</h1>
            <p className="text-sm text-gray-500">Share your knowledge and experiences with the community</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              showPreview ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" /> Preview
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePublish}
            disabled={publishing}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {publishing ? 'Publishing...' : 'Publish'}
          </motion.button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-8">
          {coverImage && (
            <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-6" />
          )}
          {category && (
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4 ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
              {category}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || 'Untitled'}</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">{summary}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, i) => (
                <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">#{tag}</span>
              ))}
            </div>
          )}
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }}
          />
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6">
            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-500" /> Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
            />
            {coverImage && (
              <img src={coverImage} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl" />
            )}
          </div>

          {/* Title & Summary */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Blog Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Short Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none resize-none"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={addTag}
                    className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm overflow-hidden">
            <label className="text-sm font-bold text-gray-700 px-6 pt-6 pb-2 block">Content</label>

            {/* Toolbar */}
            <div className="px-6 pb-3 flex flex-wrap gap-1 border-b border-gray-100">
              <button onClick={() => handleHeading(1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Heading 1">
                <Heading1 className="w-4 h-4" />
              </button>
              <button onClick={() => handleHeading(2)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Heading 2">
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
              <button onClick={() => execCmd('bold')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => execCmd('italic')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => execCmd('underline')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Underline">
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
              <button onClick={() => execCmd('insertUnorderedList')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => execCmd('insertOrderedList')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
              <button onClick={() => execCmd('formatBlock', 'pre')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Code Block">
                <Code className="w-4 h-4" />
              </button>
              <button onClick={() => execCmd('formatBlock', 'blockquote')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Quote">
                <Quote className="w-4 h-4" />
              </button>
              <button onClick={handleInsertTable} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Table">
                <Table2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
              <button onClick={() => setShowLinkModal(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Insert Link">
                <Link2 className="w-4 h-4" />
              </button>
              <button onClick={() => { setShowImageModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Insert Image">
                <Image className="w-4 h-4" />
              </button>
              <button onClick={() => { setImageUrl(''); setShowImageModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Insert Video">
                <Video className="w-4 h-4" />
              </button>
              <button onClick={handleInsertDivider} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Divider">
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Editor Area */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] px-6 py-4 text-sm text-gray-800 leading-relaxed focus:outline-none prose prose-sm max-w-none"
              style={{ wordBreak: 'break-word' }}
              data-placeholder="Start writing your blog post..."
              suppressContentEditableWarning
            />
          </div>

          {/* Link Modal */}
          {showLinkModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Insert Link</h3>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowLinkModal(false); setLinkUrl(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                  <button onClick={handleInsertLink} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">Insert</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Image/Video Modal */}
          {showImageModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Insert Media URL</h3>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image-or-video-url"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowImageModal(false); setImageUrl(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                  <button onClick={handleInsertImage} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">Insert Image</button>
                  <button onClick={handleInsertVideo} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Insert Video</button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateBlogPage;
