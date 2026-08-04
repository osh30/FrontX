import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, FileText, X, Plus } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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

export default function AdminEditResourcePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin-resources?limit=100`);
        const found = res.data.resources.find(r => r._id === id);
        if (found) {
          setForm({
            title: found.title || '',
            category: found.category || '',
            shortDescription: found.shortDescription || '',
            description: found.description || '',
            department: found.department || 'Educational Technology and Engineering',
            pdfUrl: found.pdfUrl || '',
            coverImage: found.coverImage || '',
            tags: found.tags || [],
            visibility: found.visibility || 'public',
            status: found.status || 'published'
          });
        } else {
          setError('Resource not found');
        }
      } catch (err) {
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && form && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.category || !form.shortDescription || !form.description || !form.pdfUrl) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/admin-resources/${id}`, form);
      navigate('/admin/resources');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>;
  if (!form) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/admin/resources')} className="flex items-center gap-2 text-black mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Resources</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-500 mt-2">Update resource details below.</p>
        </div>

        {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Resource Title" required>
            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          <Field label="Category" required>
            <select value={form.category} onChange={e => updateField('category', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all">
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Short Description" required>
            <input type="text" value={form.shortDescription} onChange={e => updateField('shortDescription', e.target.value)} maxLength={300}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          <Field label="Detailed Description" required>
            <textarea rows={5} value={form.description} onChange={e => updateField('description', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all resize-none" />
          </Field>

          <Field label="Department">
            <select value={form.department} onChange={e => updateField('department', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Resource Type">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700 font-medium">PDF</span>
            </div>
          </Field>

          <Field label="PDF URL" required>
            <input type="url" value={form.pdfUrl} onChange={e => updateField('pdfUrl', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          <Field label="Cover Image (Optional)">
            <input type="url" value={form.coverImage} onChange={e => updateField('coverImage', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
          </Field>

          <Field label="Tags">
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all" />
              <button type="button" onClick={addTag} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Visibility">
            <select value={form.visibility} onChange={e => updateField('visibility', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Field>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate('/admin/resources')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> :
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>}
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
