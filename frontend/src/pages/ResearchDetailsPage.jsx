import { API_BASE, SOCKET_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Calendar, CheckCircle, Tag, Target, Edit3, Trash2, Save, X, Lightbulb, BookOpen, Briefcase, GraduationCap, Star, Send, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../component/dashboard/Avatar';
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL);

const ResearchDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({});

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaboration/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setEditForm({
          title: data.title || '',
          type: data.type || 'Research Paper',
          domain: data.domain || 'Artificial Intelligence',
          overview: data.overview || '',
          whyItMatters: data.whyItMatters || '',
          responsibilities: data.responsibilities || [],
          requiredSkills: data.requiredSkills || [],
          experienceLevel: data.experienceLevel || 'Beginner Friendly',
          studentCount: data.studentCount || 1,
          duration: data.duration || '1 Month',
          outcomes: data.outcomes || [],
          benefits: data.benefits || [],
          deadline: data.deadline ? data.deadline.split('T')[0] : ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch {}
    }
  }, [id]);

  useEffect(() => {
    socket.on('profile_updated', (data) => {
      if (post && data.userId === post.alumni?._id) {
        fetchPost();
      }
    });
    return () => { socket.off('profile_updated'); };
  }, [post]);

  const isOwner = currentUser && post && currentUser._id === post.alumni?._id;

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const toggleEditArray = (item, field) => {
    const arr = editForm[field] || [];
    if (arr.includes(item)) {
      setEditForm({ ...editForm, [field]: arr.filter(i => i !== item) });
    } else {
      setEditForm({ ...editForm, [field]: [...arr, item] });
    }
  };

  const [newSkill, setNewSkill] = useState('');

  const handleAddEditSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      const skills = editForm.requiredSkills || [];
      if (!skills.includes(newSkill.trim())) {
        setEditForm({ ...editForm, requiredSkills: [...skills, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const removeEditSkill = (skill) => {
    setEditForm({ ...editForm, requiredSkills: (editForm.requiredSkills || []).filter(s => s !== skill) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaboration/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success('Research opportunity updated!');
        setEditing(false);
        fetchPost();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this research opportunity? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaboration/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Research opportunity deleted.');
        navigate('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Research topic not found.</div>;

  const responsibilityOptions = ['Literature Review', 'Data Collection', 'Data Analysis', 'Report Writing', 'Research Writing', 'Development', 'Testing', 'UI/UX Design', 'Presentation'];
  const outcomeOptions = ['Conference Paper', 'Research Publication', 'Journal Publication', 'Portfolio Project', 'Certificate', 'Recommendation Letter'];
  const benefitOptions = ['Hands-on Research Experience', 'Publication Opportunity', 'Mentorship', 'Portfolio Development', 'Networking', 'Recommendation Letter', 'Research Training'];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center px-6 lg:px-10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-purple-600 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); fetchPost(); }} disabled={saving} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </>
            ) : (
              <>
                {isOwner && (
                  <>
                    <button onClick={() => setEditing(true)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100 transition-all flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                {!isOwner && post.alumni && (
                  <button onClick={() => navigate(`/dashboard/collaboration/${post._id}/apply`)} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                    Apply Now
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm">
          {editing ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Edit3 className="w-6 h-6 text-purple-600" /> Edit Research Opportunity</h2>

              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-600" /> Research Details</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Research Title</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Research Type</label>
                    <select name="type" value={editForm.type} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50">
                      <option>Research Paper</option><option>Survey Research</option><option>Review Paper</option><option>Industrial Research</option><option>Capstone Project</option><option>Conference Paper</option><option>Journal Publication</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Research Domain</label>
                    <select name="domain" value={editForm.domain} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50">
                      <option>Artificial Intelligence</option><option>Machine Learning</option><option>Cyber Security</option><option>Data Science</option><option>IoT</option><option>Web Development</option><option>Healthcare Technology</option><option>Software Engineering</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Research Overview</label>
                  <textarea name="overview" rows="4" value={editForm.overview} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Why This Research Matters</label>
                  <textarea name="whyItMatters" rows="3" value={editForm.whyItMatters} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none" />
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-600" /> Student Requirements</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Student Responsibilities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {responsibilityOptions.map(r => (
                      <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${(editForm.responsibilities || []).includes(r) ? 'bg-purple-50 border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}>
                        <input type="checkbox" checked={(editForm.responsibilities || []).includes(r)} onChange={() => toggleEditArray(r, 'responsibilities')} className="w-4 h-4 text-purple-600 rounded" />
                        <span className="text-sm font-medium text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editForm.requiredSkills || []).map(skill => (
                        <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold flex items-center gap-1">
                          {skill}
                          <button type="button" onClick={() => removeEditSkill(skill)}><X className="w-3 h-3 hover:text-purple-900" /></button>
                        </span>
                      ))}
                    </div>
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleAddEditSkill} placeholder="Type skill and press Enter" className="w-full bg-transparent outline-none text-sm" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                    <select name="experienceLevel" value={editForm.experienceLevel} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50">
                      <option>Beginner Friendly</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Students Needed</label>
                    <input type="number" min="1" max="20" name="studentCount" value={editForm.studentCount} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <select name="duration" value={editForm.duration} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50">
                      <option>1 Month</option><option>2 Months</option><option>3 Months</option><option>6 Months</option><option>Flexible</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><Target className="w-5 h-5 text-purple-600" /> Outcomes & Benefits</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Expected Outcomes</label>
                  <div className="flex flex-wrap gap-3">
                    {outcomeOptions.map(o => (
                      <label key={o} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${(editForm.outcomes || []).includes(o) ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                        <input type="checkbox" checked={(editForm.outcomes || []).includes(o)} onChange={() => toggleEditArray(o, 'outcomes')} className="hidden" />
                        {o}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Benefits For Students</label>
                  <div className="flex flex-wrap gap-3">
                    {benefitOptions.map(b => (
                      <label key={b} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${(editForm.benefits || []).includes(b) ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>
                        <input type="checkbox" checked={(editForm.benefits || []).includes(b)} onChange={() => toggleEditArray(b, 'benefits')} className="hidden" />
                        {b}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                  <input type="date" name="deadline" value={editForm.deadline || ''} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50" />
                </div>
              </section>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-lg">{post.type}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg">{post.domain}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-lg">{post.experienceLevel}</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                  <p className="text-sm text-gray-500 mt-2">Research ID: {post.researchId} &bull; Published: {formatDate(post.createdAt)}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{post.status}</span>
              </div>

              <div className="grid sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Students Needed</p><p className="font-bold text-gray-900">{post.studentCount}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Duration</p><p className="font-bold text-gray-900">{post.duration}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Deadline</p><p className="font-bold text-gray-900">{formatDate(post.deadline)}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Experience Level</p><p className="font-bold text-gray-900">{post.experienceLevel}</p></div>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-purple-600" /> Research Overview</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl">{post.overview}</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-purple-600" /> Why This Research Matters</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl">{post.whyItMatters}</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-600" /> Student Responsibilities</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {post.responsibilities?.map((res, i) => (
                      <div key={i} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> <span className="font-medium text-sm">{res}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-purple-600" /> Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {post.requiredSkills?.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 font-semibold text-sm rounded-xl border border-purple-100">{skill}</span>
                    ))}
                    {(!post.requiredSkills || post.requiredSkills.length === 0) && <span className="text-gray-400 text-sm">No specific skills required</span>}
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" /> Expected Outcomes</h2>
                    <div className="space-y-3">
                      {post.outcomes?.map((out, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div> {out}
                        </div>
                      ))}
                      {(!post.outcomes || post.outcomes.length === 0) && <span className="text-gray-400 text-sm">No outcomes specified</span>}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-green-600" /> Benefits For Students</h2>
                    <div className="flex flex-wrap gap-3">
                      {post.benefits?.map((ben, i) => (
                        <span key={i} className="px-4 py-2 bg-green-50 text-green-700 font-semibold text-sm rounded-xl border border-green-100">{ben}</span>
                      ))}
                      {(!post.benefits || post.benefits.length === 0) && <span className="text-gray-400 text-sm">No benefits specified</span>}
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-purple-600" /> About the Alumni Mentor</h2>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="shrink-0">
                      <Avatar src={post.alumni?.profilePicture} alt={post.alumni?.name} size={80} className="border-2 border-white shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{post.alumni?.name}</h3>
                        {post.alumni?.graduationYear && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Class of {post.alumni.graduationYear}
                          </span>
                        )}
                        {post.alumni?.careerInterest && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {post.alumni.careerInterest}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {post.alumni?.department || 'Department not specified'}
                      </p>
                      {post.alumni?.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{post.alumni.bio}</p>
                      )}
                      {post.alumni?.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.alumni.interests.map((interest, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200">{interest}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!isOwner && (
                      <button onClick={() => navigate(`/dashboard/collaboration/${post._id}/apply`)} className="shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                        <Send className="w-4 h-4" /> Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResearchDetailsPage;
