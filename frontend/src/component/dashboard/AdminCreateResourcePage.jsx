import { API_BASE } from '../../config/api';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, Loader2, FileText, X, Plus, CheckCircle, AlertCircle, Image } from 'lucide-react';

const API_URL = API_BASE;

const CATEGORIES = [
  'Resume Guide', 'Interview Preparation', 'Career Development',
  'Programming', 'Research', 'Academic Notes', 'Study Material',
  'Soft Skills', 'Portfolio Guide', 'Other'
];

const DEPARTMENTS = [
  'Educational Technology and Engineering',
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Other'
];

export default function AdminCreateResourcePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const fileInputRef = useRef(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    department: 'Educational Technology and Engineering',
    coverImage: '',
    tags: []
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only .jpg, .jpeg, .png, and .webp formats are accepted for cover image.');
      e.target.value = '';
      return;
    }
    setError('');
    setSelectedCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCoverImage = () => {
    setSelectedCoverImage(null);
    setCoverPreview('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.category || !form.shortDescription || !form.description) {
      setError('Please fill all required fields.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setSubmitting(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('shortDescription', form.shortDescription);
      formData.append('description', form.description);
      formData.append('department', form.department);
      if (selectedCoverImage) formData.append('coverImage', selectedCoverImage);
      if (form.tags.length > 0) formData.append('tags', JSON.stringify(form.tags));
      formData.append('pdf', selectedFile);

      await axios.post(`${API_URL}/admin-resources`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadStatus('success');
      setTimeout(() => navigate('/admin/resources'), 1000);
    } catch (err) {
      setUploadStatus('error');
      setError(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={() => navigate('/admin/resources')} className="flex items-center gap-2 text-black mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Resources</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Create Resource</h1>
          <p className="text-gray-500 mt-2">Upload a new resource for students and alumni.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Field label="Resource Title" required>
            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
              placeholder="e.g. Complete Resume Writing Guide 2026"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          {/* Category */}
          <Field label="Category" required>
            <select value={form.category} onChange={e => updateField('category', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all">
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          {/* Short Description */}
          <Field label="Short Description" required>
            <input type="text" value={form.shortDescription} onChange={e => updateField('shortDescription', e.target.value)}
              placeholder="Brief description (max 300 chars)" maxLength={300}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          {/* Detailed Description */}
          <Field label="Detailed Description" required>
            <textarea rows={5} value={form.description} onChange={e => updateField('description', e.target.value)}
              placeholder="Full description of the resource..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all resize-none" />
          </Field>

          {/* Department */}
          <Field label="Department">
            <select value={form.department} onChange={e => updateField('department', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          {/* Resource Type */}
          <Field label="Resource Type">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700 font-medium">PDF</span>
            </div>
          </Field>

          {/* Upload PDF */}
          <Field label="Upload PDF" required>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {selectedFile.name}
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">Click to select a PDF file</span>
                    <span className="text-xs text-gray-400">Only .pdf files accepted</span>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </div>
            {uploadStatus === 'uploading' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> PDF uploaded successfully
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4" /> Upload failed
              </div>
            )}
          </Field>

          {/* Cover Image */}
          <Field label="Cover Image (Optional)">
            <div
              onClick={() => coverInputRef.current?.click()}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all"
            >
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover preview"
                    className="w-full h-44 object-cover rounded-lg" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeCoverImage(); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors">
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {selectedCoverImage?.name}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Click to select a cover image</span>
                  <span className="text-xs text-gray-400">Accepts .jpg, .jpeg, .png, .webp</span>
                </div>
              )}
              <input ref={coverInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleCoverChange} className="hidden" />
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
              <button type="button" onClick={addTag}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate('/admin/resources')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !selectedFile}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</span>
              ) : (
                <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Publish Resource</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
