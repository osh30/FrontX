import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, X, Eye, Send, Loader2, Save, Plus, Upload, Trash2, Minus,
  Heading1, Heading2, Heading3, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Link2, Link2Off, ImagePlus, Table2,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Palette,
  PanelTop, PanelBottom, PanelLeft, PanelRight, TableProperties, Image as ImageIcon
} from 'lucide-react';
import { API, CATEGORIES, CATEGORY_COLORS } from '../blog/blogConfig';
import RichContentRenderer, { buildExtensions, generateBlogHTML } from '../blog/richContent';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all';

const ImagePicker = ({ value, onChange, label }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API}/api/blogs/upload`, fd, { headers: authHeaders() });
      onChange(res.data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
          <img src={value} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1">
              <Upload className="w-3 h-3" /> Replace
            </button>
            <button type="button" onClick={() => onChange('')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-violet-400 hover:bg-violet-50/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              <span className="text-xs font-medium text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Upload {label.toLowerCase()} (jpg, png, webp)</span>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <input
        type="url"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className={`${inputCls} mt-2`}
      />
    </div>
  );
};

const ToolButton = ({ active, onClick, title, disabled, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? 'bg-violet-600 text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const ToolDivider = () => <span className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-0.5 shrink-0" />;

const RichEditorToolbar = ({ editor, onImageUpload, onLinkApply, onLinkToggle, onTableToggle, showLink, linkUrl, setLinkUrl, uploading }) => {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
      quote: editor.isActive('blockquote'),
      code: editor.isActive('codeBlock'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      alignLeft: editor.isActive({ textAlign: 'left' }),
      alignCenter: editor.isActive({ textAlign: 'center' }),
      alignRight: editor.isActive({ textAlign: 'right' }),
      link: editor.isActive('link'),
      inTable: editor.isActive('table'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo()
    })
  });

  const imageInputRef = useRef(null);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] rounded-t-2xl">
      <ToolButton title="Heading 1" active={active.h1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Heading 2" active={active.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Heading 3" active={active.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </ToolButton>

      <ToolDivider />

      <ToolButton title="Bold" active={active.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Italic" active={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Underline" active={active.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Strikethrough" active={active.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="w-4 h-4" />
      </ToolButton>

      <ToolDivider />

      <ToolButton title="Bullet list" active={active.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Numbered list" active={active.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Blockquote" active={active.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Code block" active={active.code} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <code className="text-[11px] font-bold">&lt;/&gt;</code>
      </ToolButton>
      <ToolButton title="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="w-4 h-4" />
      </ToolButton>

      <ToolDivider />

      <ToolButton title="Text color" active={false}>
        <label className="flex items-center cursor-pointer" title="Text color">
          <Palette className="w-4 h-4" />
          <input
            type="color"
            value="#7c3aed"
            onChange={e => { editor.chain().focus().setColor(e.target.value).run(); toast.success('Color applied'); }}
            className="w-0 h-0 opacity-0 absolute pointer-events-none"
          />
        </label>
      </ToolButton>
      <ToolButton title="Clear text color" onClick={() => editor.chain().focus().unsetColor().run()}>
        <X className="w-3.5 h-3.5" />
      </ToolButton>

      <ToolDivider />

      <ToolButton title="Align left" active={active.alignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Align center" active={active.alignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Align right" active={active.alignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="w-4 h-4" />
      </ToolButton>

      <ToolDivider />

      <ToolButton title="Add link" active={active.link} onClick={onLinkToggle}>
        <Link2 className="w-4 h-4" />
      </ToolButton>
      {active.link && (
        <ToolButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
          <Link2Off className="w-4 h-4" />
        </ToolButton>
      )}

      <ToolDivider />

      <ToolButton title="Insert image" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
      </ToolButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          e.target.value = '';
        }}
      />

      <ToolDivider />

      <ToolButton title="Insert table" onClick={onTableToggle}>
        <Table2 className="w-4 h-4" />
      </ToolButton>
      {active.inTable && (
        <>
          <ToolButton title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <PanelBottom className="w-4 h-4" />
          </ToolButton>
          <ToolButton title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <PanelRight className="w-4 h-4" />
          </ToolButton>
          <ToolButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <PanelTop className="w-4 h-4" />
          </ToolButton>
          <ToolButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <PanelLeft className="w-4 h-4" />
          </ToolButton>
          <ToolButton title="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            <TableProperties className="w-4 h-4" />
          </ToolButton>
          <ToolButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="w-4 h-4" />
          </ToolButton>
        </>
      )}

      <ToolDivider />

      <ToolButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!active.canUndo}>
        <Undo2 className="w-4 h-4" />
      </ToolButton>
      <ToolButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!active.canRedo}>
        <Redo2 className="w-4 h-4" />
      </ToolButton>

      {showLink && (
        <div className="w-full mt-2 flex items-center gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onLinkApply(); }}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            autoFocus
          />
          <button type="button" onClick={onLinkApply} className="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700">
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const contentRef = useRef(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: '',
    editorProps: {
      attributes: { class: 'tiptap-editor' }
    },
    onSelectionUpdate: ({ editor }) => {
      const sel = editor.state.selection;
      const node = sel.node && sel.node.type.name === 'image' ? sel.node.attrs : null;
      setSelectedImage(node ? { ...node, pos: sel.from } : null);
    }
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/blogs/${id}`, { headers: authHeaders() });
        const b = res.data;
        setTitle(b.title || '');
        setSubtitle(b.subtitle || '');
        setSummary(b.summary || '');
        setCategory(b.category || '');
        setTags(b.tags || []);
        setCoverImage(b.coverImage || '');
        setHeroImage(b.heroImage || '');
        setFeatured(!!b.featured);
        contentRef.current = Array.isArray(b.contentJson) && b.contentJson.length
          ? { type: 'doc', content: b.contentJson }
          : (b.content || '');
      } catch (err) {
        toast.error('Failed to load blog');
        navigate('/admin/blogs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (!editor || loading) return;
    if (contentRef.current !== null) {
      editor.commands.setContent(contentRef.current, false);
      contentRef.current = null;
    }
  }, [editor, loading]);

  useEffect(() => {
    if (!editor || isEdit) return;
    contentRef.current = '';
    editor.commands.setContent('', false);
  }, [id, isEdit, editor]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const uploadInlineImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API}/api/blogs/upload`, fd, { headers: authHeaders() });
      editor.chain().focus().setImage({ src: res.data.url, alt: '' }).run();
      toast.success('Image inserted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleLinkInput = () => {
    setShowLink(s => !s);
    setShowTableMenu(false);
    setLinkUrl(editor?.getAttributes('link').href || '');
  };

  const toggleTableMenu = () => {
    setShowTableMenu(s => !s);
    setShowLink(false);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setShowLink(false);
      return;
    }
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    } else {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    }
    setShowLink(false);
    setLinkUrl('');
  };

  const insertTable = () => {
    const rows = Math.min(Math.max(tableRows, 1), 20);
    const cols = Math.min(Math.max(tableCols, 1), 12);
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  const handleSave = async (nextStatus) => {
    if (!title.trim()) return toast.error('Title is required');
    if (!summary.trim()) return toast.error('Summary is required');
    if (!category) return toast.error('Please select a category');

    setSaving(true);
    const contentJson = editor ? (editor.getJSON().content || []) : [];
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      summary: summary.trim(),
      category,
      tags,
      coverImage: coverImage || null,
      heroImage: heroImage || coverImage || null,
      contentJson,
      content: generateBlogHTML(contentJson),
      sections: [],
      featured,
      status: nextStatus
    };

    try {
      if (isEdit) {
        await axios.put(`${API}/api/blogs/admin/${id}`, payload, { headers: authHeaders() });
      } else {
        await axios.post(`${API}/api/blogs`, payload, { headers: authHeaders() });
      }
      toast.success(nextStatus === 'draft' ? 'Blog saved as draft' : 'Blog published!');
      navigate('/admin/blogs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const heroImageSrc = heroImage || coverImage;
  const previewBlog = {
    title,
    subtitle,
    summary,
    category,
    tags,
    coverImage,
    heroImage,
    contentJson: editor ? (editor.getJSON().content || []) : []
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blogs')}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Blog' : 'Create Blog'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rich-text editor — formatting is preserved on published pages</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Metadata */}
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Basics</h2>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a compelling title..." className={`${inputCls} !py-3 text-lg font-semibold`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Subtitle</label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="A short supporting line (optional)" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Summary *</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a brief summary shown on cards and in search results..." rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Tags</label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag & press Enter"
                    className={inputCls}
                  />
                  <button type="button" onClick={addTag} className="px-3.5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold">
                        #{tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-violet-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Feature this article (shown prominently on the blog home)</span>
            </label>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Cover Image</h2>
              <ImagePicker value={coverImage} onChange={setCoverImage} label="Cover image" />
            </div>
            <div className="bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Hero Image</h2>
              <ImagePicker value={heroImage} onChange={setHeroImage} label="Hero image" />
              <p className="text-[11px] text-gray-400 mt-2">Falls back to the cover image when empty.</p>
            </div>
          </div>

          {/* Rich Editor */}
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Article Body</h2>
              <span className="text-xs text-gray-400">Rich text — headings, lists, tables, images & more</span>
            </div>

            {editor && (
              <>
                <div className="relative">
                  <RichEditorToolbar
                    editor={editor}
                    onImageUpload={uploadInlineImage}
                    onLinkToggle={toggleLinkInput}
                    onTableToggle={toggleTableMenu}
                    onLinkApply={applyLink}
                    showLink={showLink}
                    linkUrl={linkUrl}
                    setLinkUrl={setLinkUrl}
                    uploading={uploadingImage}
                  />

                  {showTableMenu && (
                    <div className="absolute top-14 right-0 z-20 mt-1 mr-3 bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-4 w-64">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Insert Table</p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-500 block mb-1">Rows</label>
                          <input type="number" min={1} max={20} value={tableRows} onChange={e => setTableRows(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-500 block mb-1">Columns</label>
                          <input type="number" min={1} max={12} value={tableCols} onChange={e => setTableCols(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                      </div>
                      <button type="button" onClick={insertTable} className="mt-3 w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-all">
                        Insert Table
                      </button>
                    </div>
                  )}

                  <EditorContent editor={editor} />
                </div>

                {selectedImage && (
                  <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-200 dark:border-white/10 bg-violet-50/50 dark:bg-violet-500/10">
                    <ImageIcon className="w-4 h-4 text-violet-600 shrink-0" />
                    <input
                      value={selectedImage.caption || ''}
                      onChange={e => {
                        editor.chain().focus().updateAttributes('image', { caption: e.target.value }).run();
                        setSelectedImage(prev => prev ? { ...prev, caption: e.target.value } : prev);
                      }}
                      placeholder="Image caption (optional)"
                      className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                    <span className="text-[11px] text-gray-400">Click an image to edit its caption</span>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full py-8 px-4 flex items-start justify-center">
            <div className="w-full max-w-3xl bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#0B1220] z-10">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Article Preview</h3>
                <button onClick={() => setShowPreview(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 md:px-10 py-8">
                {heroImageSrc && (
                  <img src={heroImageSrc} alt={title} className="w-full h-56 md:h-72 object-cover rounded-2xl mb-6" />
                )}
                {category && (
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                    {category}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">{title || 'Untitled'}</h1>
                {subtitle && <p className="text-lg text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{summary}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-white/10 pt-6">
                  <RichContentRenderer blog={previewBlog} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogEditor;
