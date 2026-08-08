import { API_BASE } from '../../config/api';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Camera, Upload, Plus, FileText, ExternalLink, 
  X, Save, Edit3, MapPin, Briefcase, BookOpen, Users, Award, 
  Code, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle, BadgeCheck, GraduationCap, Hash,
  Loader, User as UserIcon
} from 'lucide-react';
import Avatar from './Avatar';

const EmptyState = ({ icon: Icon, title, desc, actionText, onAction, isEditing }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[250px] py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 text-gray-500 shadow-sm border border-gray-100">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-gray-900 font-bold mb-2 text-base">{title}</h4>
    <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed px-4">{desc}</p>
    {isEditing && (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction} 
        className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4 inline-block mr-1" /> {actionText}
      </motion.button>
    )}
  </div>
);

const InlineProjectForm = ({ onSave, onCancel, uploadToBackend }) => {
  const [formData, setFormData] = useState({ title: '', desc: '', tech: '', github: '', demo: '', image: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToBackend(file, 'projects');
        setFormData({ ...formData, image: url });
        toast.success("Image uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/80 backdrop-blur-xl border border-purple-100 rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500" /> Add New Project</h4>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Project Title</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. AI Image Generator" /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Description (4-5 lines)</label><textarea rows="3" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none resize-none" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Explain what the project does, technologies used, and your achievements..." /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Tech Stack (comma separated)</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none" value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} placeholder="React, Node.js, TensorFlow" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-gray-500 uppercase">GitHub Link</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Live Demo Link</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none" value={formData.demo} onChange={e => setFormData({...formData, demo: e.target.value})} placeholder="https://..." /></div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Project Screenshot</label>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-purple-50 transition-colors cursor-pointer group">
            {isUploading ? <Loader className="w-6 h-6 text-purple-400 mx-auto mb-2 animate-spin" /> : <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />}
            <p className="text-sm font-medium text-gray-600">{formData.image ? "Image Uploaded" : "Click to upload image (JPG, PNG, WEBP)"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancel</button>
          <button onClick={() => onSave({ ...formData, _id: Date.now().toString() })} disabled={isUploading} className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50">Save Project</button>
        </div>
      </div>
    </motion.div>
  );
};

const InlineResearchForm = ({ onSave, onCancel, uploadToBackend }) => {
  const [formData, setFormData] = useState({ title: '', desc: '', topic: '', journal: '', collab: '', pdfUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToBackend(file, 'research');
        setFormData({ ...formData, pdfUrl: url });
        toast.success("PDF uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/80 backdrop-blur-xl border border-cyan-100 rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-500" /> Add Publication</h4>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Paper Title</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-200 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Abstract/Summary (4-5 lines)</label><textarea rows="3" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-200 outline-none resize-none" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Research objective, methodology, impact..." /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Journal/Conference</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-200 outline-none" value={formData.journal} onChange={e => setFormData({...formData, journal: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Research Topic</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-200 outline-none" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} /></div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload PDF</label>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handlePdfUpload} accept=".pdf" />
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-cyan-50 transition-colors cursor-pointer flex flex-col items-center">
            {isUploading ? <Loader className="w-6 h-6 text-cyan-400 mb-2 animate-spin" /> : <FileText className="w-6 h-6 text-cyan-400 mb-2" />}
            <p className="text-sm font-medium text-gray-600">{formData.pdfUrl ? "PDF Uploaded" : "Upload Research Paper (.pdf)"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancel</button>
          <button onClick={() => onSave({ ...formData, _id: Date.now().toString() })} disabled={isUploading} className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50">Save Paper</button>
        </div>
      </div>
    </motion.div>
  );
};

const InlineCertificateForm = ({ onSave, onCancel, uploadToBackend }) => {
  const [formData, setFormData] = useState({ title: '', desc: '', org: '', link: '', fileUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToBackend(file, 'certificates');
        setFormData({ ...formData, fileUrl: url });
        toast.success("Certificate uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-emerald-500" /> Add Certificate</h4>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Certificate Title</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Description</label><textarea rows="2" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none resize-none" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Skills gained, what this certificate signifies..." /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Issuing Organization</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} placeholder="e.g. Coursera, Google" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Verification Link</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} /></div>
        </div>
        <div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/*" />
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-emerald-50 transition-colors cursor-pointer flex flex-col items-center">
            {isUploading ? <Loader className="w-6 h-6 text-emerald-400 mb-2 animate-spin" /> : <Upload className="w-6 h-6 text-emerald-400 mb-2" />}
            <p className="text-sm font-medium text-gray-600">{formData.fileUrl ? "File Uploaded" : "Upload Certificate Image or PDF"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancel</button>
          <button onClick={() => onSave({ ...formData, _id: Date.now().toString() })} disabled={isUploading} className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50">Save Certificate</button>
        </div>
      </div>
    </motion.div>
  );
};

const InlineClassNoteForm = ({ onSave, onCancel, uploadToBackend }) => {
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', pdfUrl: '', department: '', course: '', semester: '', weekOrTopic: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToBackend(file, 'notes');
        setFormData({ ...formData, pdfUrl: url });
        toast.success("PDF Note uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Publish Class Note</h4>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Note Title</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Subject / Course</label><input type="text" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><input type="text" placeholder="e.g. CSE" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Course Name</label><input type="text" placeholder="e.g. Data Structures" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Semester</label><input type="text" placeholder="e.g. 4th" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Week / Topic</label><input type="text" placeholder="e.g. Week 5 - Trees" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm" value={formData.weekOrTopic} onChange={e => setFormData({...formData, weekOrTopic: e.target.value})} /></div>
        </div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Short Description</label><textarea rows="2" className="w-full mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
        <div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" />
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer flex flex-col items-center">
            {isUploading ? <Loader className="w-6 h-6 text-blue-400 mb-2 animate-spin" /> : <Upload className="w-6 h-6 text-blue-400 mb-2" />}
            <p className="text-sm font-medium text-gray-600">{formData.pdfUrl ? "PDF Uploaded" : "Upload Note PDF"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancel</button>
          <button onClick={() => onSave(formData)} disabled={isUploading || !formData.pdfUrl} className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50">Publish Note</button>
        </div>
      </div>
    </motion.div>
  );
};


const ProfilePage = ({ user, isEditable, viewedUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form toggles
  const [addingProject, setAddingProject] = useState(false);
  const [addingResearch, setAddingResearch] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Class Notes state
  const [classNotes, setClassNotes] = useState([]);

  // Connected users state (mentors for students, students for alumni)
  const [connections, setConnections] = useState([]);

  // Mentorship Status
  const [mentorshipStatus, setMentorshipStatus] = useState(null); // 'pending', 'accepted', 'rejected', or null
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ requestType: 'Mentorship', message: '' });
  // File Upload Logic
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'Student',
    department: '',
    session: '',
    studentId: '',
    bio: '',
    interests: [],
    projects: [],
    research: [],
    certificates: [],
    resumeUrl: '',
    profilePicture: '',
    careerInterest: ''
  });

  const [newInterest, setNewInterest] = useState('');

  // Fetch Profile from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const endpoint = viewedUserId ? `${API_BASE}/users/${viewedUserId}` : `${API_BASE}/users/profile`;
        
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfileData(prev => ({
          ...prev,
          ...res.data,
          projects: res.data.projects || [],
          research: res.data.research || [],
          certificates: res.data.certificates || [],
          interests: res.data.interests || [],
          careerInterest: res.data.careerInterest || '',
        }));

        // Fetch mentorship request status if viewing an alumni
        if (viewedUserId && res.data.role === 'alumni') {
           const outgoingRes = await axios.get(`${API_BASE}/mentorship/outgoing`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           const existingReq = outgoingRes.data.find(req => req.alumniId && req.alumniId._id === viewedUserId);
           if (existingReq) {
             setMentorshipStatus(existingReq.status);
           }
        }

        // Fetch notes if the user is a student
        if (res.data.role === 'student' || res.data.role === 'Student') {
          const notesRes = await axios.get(`${API_BASE}/notes/student/${viewedUserId || res.data._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setClassNotes(notesRes.data);
        }

        // Fetch accepted connections (connected mentors/students) for this profile
        const profileId = viewedUserId || res.data._id;
        if (profileId) {
          try {
            const connRes = await axios.get(`${API_BASE}/mentorship/connections/${profileId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setConnections(connRes.data || []);
          } catch (e) {
            setConnections([]);
          }
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [viewedUserId]);

  const handleSendRequest = async () => {
    setIsSendingRequest(true);
    try {
      if (!requestData.message.trim()) {
        toast.error("Please enter a short message");
        setIsSendingRequest(false);
        return;
      }
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/mentorship/request`, {
        alumniId: viewedUserId,
        requestType: requestData.requestType,
        message: requestData.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Mentorship request sent!");
      setMentorshipStatus('pending');
      setShowRequestModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const uploadToBackend = async (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const token = localStorage.getItem('token');
    
    const res = await axios.post(`${API_BASE}/users/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.url;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);

      if (profileData.resumeUrl && profileData.careerInterest) {
        toast.promise(
          axios.post(`${API_BASE}/ai-analysis/generate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          {
            loading: 'Running AI CV Analysis...',
            success: 'AI Analysis Complete!',
            error: 'Failed to generate AI Analysis.'
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const url = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profilePicture: url }));
      
      try {
        const uploadedUrl = await uploadToBackend(file, 'avatars');
        setProfileData(prev => ({ ...prev, profilePicture: uploadedUrl }));
        toast.success("Profile picture uploaded!");
      } catch (err) {
        toast.error("Avatar upload failed");
      }
    }
  };

  const [removingPicture, setRemovingPicture] = useState(false);

  const handleRemoveProfilePicture = async () => {
    if (!profileData.profilePicture) return;
    setRemovingPicture(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/users/profile-picture`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(prev => ({ ...prev, profilePicture: '' }));
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove profile picture");
    } finally {
      setRemovingPicture(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading("Uploading CV...", { id: "resumeUpload" });
        const uploadedUrl = await uploadToBackend(file, 'resumes');
        setProfileData(prev => ({ ...prev, resumeUrl: uploadedUrl }));
        toast.success("CV uploaded! Please save your profile to trigger AI Analysis.", { id: "resumeUpload" });
      } catch (err) {
        toast.error("CV upload failed", { id: "resumeUpload" });
      }
    }
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({ ...profileData, interests: [...profileData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setProfileData({ ...profileData, interests: profileData.interests.filter(i => i !== interestToRemove) });
  };

  const saveProject = (proj) => { setProfileData({...profileData, projects: [proj, ...profileData.projects]}); setAddingProject(false); };
  const saveResearch = (res) => { setProfileData({...profileData, research: [res, ...profileData.research]}); setAddingResearch(false); };
  const saveCert = (cert) => { setProfileData({...profileData, certificates: [cert, ...profileData.certificates]}); setAddingCert(false); };

  const deleteItem = (type, id) => {
    setProfileData({ ...profileData, [type]: profileData[type].filter(item => item._id !== id) });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader className="w-10 h-10 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="relative min-h-screen pb-20">
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        accept=".pdf,.doc,.docx" 
        className="hidden" 
        ref={resumeInputRef} 
        onChange={handleResumeChange} 
      />

      {/* Background Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto py-6 relative z-10 space-y-6">
        
        {/* TOP SECTION: Clean White Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          {/* Subtle bottom shadow/border effect via gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-transparent"></div>

          {/* Avatar (Left) */}
          <div className="relative w-36 h-36 shrink-0 group">
            <div className="w-full h-full rounded-2xl p-1.5 bg-white shadow-md relative z-10 border border-gray-100">
              <Avatar src={profileData.profilePicture} alt="Profile" size={144} className="border-4 border-gray-200" />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm z-20"></div>
              {isEditing && (
                <div className="absolute inset-1.5 bg-black/60 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-30 flex-col gap-1.5 cursor-pointer">
                  <button onClick={handleAvatarClick} className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform px-4 py-1">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold tracking-wider">CHANGE</span>
                  </button>
                  {profileData.profilePicture && (
                    <>
                      <div className="w-8 h-px bg-white/20"></div>
                      <button onClick={handleRemoveProfilePicture} disabled={removingPicture} className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform px-4 py-1 disabled:opacity-50">
                        {removingPicture ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span className="text-[9px] font-bold tracking-wider">{removingPicture ? 'REMOVING' : 'REMOVE'}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Info (Right) */}
          <div className="flex-1 w-full relative pt-2">
            
            {/* Edit / Save Button - Top Right Absolute inside Header */}
            {isEditable && (
              <div className="absolute top-0 right-0 z-20">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={isSaving} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-sm rounded-lg shadow-md shadow-purple-500/20 hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-70">
                      {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2 bg-white border border-gray-200 text-gray-800 font-bold text-sm rounded-lg hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>
            )}

            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 pr-32">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</label>
                  <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all">
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Department</label>
                  <input type="text" value={profileData.department} onChange={e => setProfileData({...profileData, department: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all" placeholder="e.g. CS" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Session</label>
                  <input type="text" value={profileData.session} onChange={e => setProfileData({...profileData, session: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all" placeholder="e.g. 2022-2026" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student ID</label>
                  <input type="text" value={profileData.studentId} onChange={e => setProfileData({...profileData, studentId: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all" placeholder="e.g. 1234567" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Career Interest</label>
                  <select value={profileData.careerInterest} onChange={e => setProfileData({...profileData, careerInterest: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all">
                    <option value="">Select Career Path</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Research">Research</option>
                    <option value="Business Analytics">Business Analytics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Professional Bio</label>
                  <textarea rows="2" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-medium resize-none transition-all" placeholder="Short bio..." />
                </div>
              </div>
            ) : (
              <div className="text-center md:text-left pt-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{profileData.name || "Student Name"}</h2>
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-md border border-purple-100">
                    {profileData.role}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" /> {profileData.department || "Dept not set"}
                  </span>
                  {profileData.session && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-500" /> {profileData.session}
                    </span>
                  )}
                  {profileData.studentId && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                      <Hash className="w-3.5 h-3.5 text-gray-500" /> {profileData.studentId}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium max-w-3xl mb-4">
                  {profileData.bio || "Craft a compelling bio to stand out to mentors and recruiters."}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 font-medium mb-4">
                  <BookOpen className="w-4 h-4" /> {profileData?.email || user?.email || "student@university.edu"}
                </div>
                {profileData.careerInterest && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mt-1">
                    <Briefcase className="w-4 h-4 text-purple-500" /> Aiming for: <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">{profileData.careerInterest}</span>
                  </div>
                )}
                
                {/* Mentorship Connection Logic */}
                {!isEditable && user?.role === 'student' && profileData.role === 'alumni' && (
                  <div className="mt-4 border-t border-gray-100 pt-4 flex gap-3">
                    {mentorshipStatus === 'accepted' ? (
                      <button className="px-5 py-2.5 bg-green-500 text-white font-bold text-sm rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Connection Accepted
                      </button>
                    ) : mentorshipStatus === 'pending' ? (
                      <button disabled className="px-5 py-2.5 bg-gray-200 text-gray-600 font-bold text-sm rounded-xl flex items-center gap-2 cursor-not-allowed">
                        <Loader className="w-4 h-4 animate-spin" /> Request Pending
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowRequestModal(true)}
                        disabled={isSendingRequest}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-purple-500/20 hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" /> Send Mentorship Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CONTENT GRID - HORIZONTAL ROWS */}
        <div className="flex flex-col gap-6">
          
          {/* ROW 1: Interests & Mentors */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg shrink-0">
              <Award className="w-5 h-5 text-purple-500" /> Interests & Focus Areas
            </h3>
            
            <div className="flex-1 flex flex-col">
              {isEditing && (
                <form onSubmit={handleAddInterest} className="flex gap-2 mb-5 shrink-0">
                  <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="E.g. Machine Learning" className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-200 outline-none" />
                  <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">Add</button>
                </form>
              )}

              <div className="flex flex-wrap gap-2.5">
                {profileData.interests.length === 0 ? (
                  <p className="text-sm text-gray-500 w-full py-4 italic">No interests added yet.</p>
                ) : (
                  profileData.interests.map((interest, idx) => (
                    <span key={idx} className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm transition-all hover:border-purple-300 hover:text-purple-700 cursor-default">
                      {interest}
                      {isEditing && (
                        <button onClick={() => removeInterest(interest)} className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6 shrink-0">
              <Users className="w-5 h-5 text-blue-500" /> {(profileData.role || '').toLowerCase() === 'student' ? 'Connected Mentors' : 'Connected Students'}
            </h3>
            <div className="flex-1">
              {connections.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={(profileData.role || '').toLowerCase() === 'student' ? 'No Connected Mentors' : 'No Connected Students'}
                  desc={(profileData.role || '').toLowerCase() === 'student' ? 'This student is not connected with any alumni yet.' : 'This alumni is not connected with any students yet.'}
                />
              ) : (
                <div className="grid gap-4">
                  {connections.map(person => (
                    <div key={person._id} className="flex items-center gap-4 p-4 bg-white/80 border border-gray-100 shadow-sm rounded-2xl">
                      {person.profilePicture ? (
                        <img src={person.profilePicture} alt={person.name} className="w-12 h-12 bg-blue-50 rounded-xl object-cover shadow-inner border border-blue-100 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-lg font-bold text-blue-600 shadow-inner border border-blue-100 shrink-0">{person.name?.[0] || 'U'}</div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{person.name}</h4>
                        <p className="text-xs text-gray-500 font-medium mb-1 truncate">{(profileData.role || '').toLowerCase() === 'student' ? 'Alumni' : 'Student'}{person.department ? ` · ${person.department}` : ''}</p>
                        <span className="inline-block text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Connected</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: Projects & Research */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-purple-500" /> Projects & Portfolio
              </h3>
              {isEditing && !addingProject && (
                <button onClick={() => setAddingProject(true)} className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-purple-200"><Plus className="w-3.5 h-3.5" /> Add</button>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence>{addingProject && <InlineProjectForm uploadToBackend={uploadToBackend} onSave={saveProject} onCancel={() => setAddingProject(false)} />}</AnimatePresence>
              {profileData.projects.length === 0 && !addingProject ? (
                <EmptyState icon={Briefcase} title="Showcase Your Work" desc="Upload technical projects to stand out." actionText="Add Project" onAction={() => setAddingProject(true)} isEditing={isEditing} />
              ) : (
                <div className="space-y-4">
                  {profileData.projects.map((proj) => (
                    <div key={proj._id || proj.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative group flex gap-4">
                      {proj.image && (
                         <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 hidden sm:block cursor-pointer" onClick={() => window.open(proj.image, '_blank')}>
                            <img src={proj.image} alt={proj.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                         </div>
                      )}
                      <div className="flex-1">
                        {isEditing && <button onClick={() => deleteItem('projects', proj._id || proj.id)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>}
                        <h4 className="font-bold text-gray-900 text-sm mb-1 pr-8">{proj.title}</h4>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 pr-8">{proj.desc}</p>
                        {proj.tech && <div className="flex flex-wrap gap-1 mb-3">{proj.tech.split(',').map((t, i) => <span key={i} className="text-[9px] font-bold uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t.trim()}</span>)}</div>}
                        <div className="flex gap-2">
                          {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded hover:bg-gray-800"><Code className="w-3 h-3" /> Code</a>}
                          {proj.demo && <a href={proj.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded hover:bg-blue-100"><ExternalLink className="w-3 h-3" /> Demo</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-cyan-500" /> Research & Papers
              </h3>
              {isEditing && !addingResearch && (
                <button onClick={() => setAddingResearch(true)} className="text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-cyan-200"><Plus className="w-3.5 h-3.5" /> Add</button>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence>{addingResearch && <InlineResearchForm uploadToBackend={uploadToBackend} onSave={saveResearch} onCancel={() => setAddingResearch(false)} />}</AnimatePresence>
              {profileData.research.length === 0 && !addingResearch ? (
                <EmptyState icon={BookOpen} title="No Publications" desc="Upload your research papers or academic articles." actionText="Add Paper" onAction={() => setAddingResearch(true)} isEditing={isEditing} />
              ) : (
                <div className="space-y-4">
                  {profileData.research.map((res) => (
                    <div key={res._id || res.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative group">
                      {isEditing && <button onClick={() => deleteItem('research', res._id || res.id)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>}
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{res.title}</h4>
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-2">{res.journal}</p>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{res.desc}</p>
                      {res.pdfUrl && <a href={res.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-50"><FileText className="w-3 h-3" /> PDF</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ROW 4: Certificates & CV */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-emerald-500" /> Certificates
              </h3>
              {isEditing && !addingCert && (
                <button onClick={() => setAddingCert(true)} className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"><Plus className="w-3.5 h-3.5" /> Add</button>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence>{addingCert && <InlineCertificateForm uploadToBackend={uploadToBackend} onSave={saveCert} onCancel={() => setAddingCert(false)} />}</AnimatePresence>
              {profileData.certificates.length === 0 && !addingCert ? (
                <EmptyState icon={Award} title="No Certificates" desc="Upload your course certificates or awards." actionText="Add Certificate" onAction={() => setAddingCert(true)} isEditing={isEditing} />
              ) : (
                <div className="grid gap-4">
                  {profileData.certificates.map(cert => (
                    <div key={cert._id || cert.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm relative group">
                      {isEditing && <button onClick={() => deleteItem('certificates', cert._id || cert.id)} className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>}
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100"><Award className="w-5 h-5 text-emerald-500" /></div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-0.5">{cert.title}</h4>
                        <p className="text-[10px] font-semibold text-emerald-600 mb-1">{cert.org}</p>
                        {(cert.link || cert.fileUrl) && <a href={cert.link || cert.fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600 hover:underline">Verify <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg shrink-0">
              <FileText className="w-5 h-5 text-blue-500" /> Professional Resume
            </h3>
            
            <div className="flex-1 flex flex-col">
              {!profileData.resumeUrl && !isEditing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">No CV Uploaded</p>
                </div>
              ) : (
                <div onClick={() => isEditing && resumeInputRef.current?.click()} className={`flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-white transition-colors group relative overflow-hidden ${isEditing ? 'hover:bg-blue-50/30 cursor-pointer' : ''}`}>
                  <FileText className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 group-hover:text-blue-500 transition-all" />
                  <p className="text-sm font-bold text-gray-800 mb-1 z-10">
                    {profileData.resumeUrl ? <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline text-blue-600">View CV</a> : "Upload your CV"}
                  </p>
                  {isEditing && <p className="text-xs text-gray-500 font-medium">{profileData.resumeUrl ? "Click to replace" : "Supports PDF, DOCX"}</p>}
                </div>
              )}
            </div>
          </div>

          {/* ROW 5: Published Class Notes (Student Only) — directly under Professional Resume */}
          {(profileData.role === 'student' || profileData.role === 'Student') && (
            <div className="grid grid-cols-1">
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 flex flex-col transition-all duration-300">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-blue-500" /> Published Class Notes
                  </h3>
                  {isEditing && !addingNote && (
                    <button onClick={() => setAddingNote(true)} className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"><Plus className="w-3.5 h-3.5" /> Add Note</button>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <AnimatePresence>
                    {addingNote && <InlineClassNoteForm uploadToBackend={uploadToBackend} onSave={async (noteData) => {
                      try {
                        const token = localStorage.getItem('token');
                        const res = await axios.post(`${API_BASE}/notes`, noteData, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setClassNotes([res.data, ...classNotes]);
                        setAddingNote(false);
                      } catch (err) {
                        toast.error("Failed to publish note");
                      }
                    }} onCancel={() => setAddingNote(false)} />}
                  </AnimatePresence>
                  
                  {classNotes.length === 0 && !addingNote ? (
                    <EmptyState icon={FileText} title="No Class Notes" desc="Publish your study notes to help others." actionText="Publish Note" onAction={() => setAddingNote(true)} isEditing={isEditing} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classNotes.map(note => (
                        <div key={note._id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm relative group">
                          {isEditing && (
                            <button onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                await axios.delete(`${API_BASE}/notes/${note._id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setClassNotes(classNotes.filter(n => n._id !== note._id));
                              } catch(err) {
                                toast.error("Failed to delete note");
                              }
                            }} className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                          )}
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 border border-blue-100"><FileText className="w-5 h-5 text-blue-500" /></div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{note.title}</h4>
                            <p className="text-[10px] font-semibold text-blue-600 mb-1">{note.subject}</p>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{note.description}</p>
                            <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md">View PDF <ExternalLink className="w-3 h-3" /></a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Request Mentorship Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Request Mentorship</h3>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-500 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Request Type</label>
                  <select 
                    value={requestData.requestType} 
                    onChange={e => setRequestData({...requestData, requestType: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none text-sm font-medium text-gray-700"
                  >
                    <option value="Mentorship">Mentorship</option>
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Project Review">Project Review</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Short Message</label>
                  <textarea 
                    rows="3" 
                    placeholder="Briefly explain why you want to connect..."
                    value={requestData.message} 
                    onChange={e => setRequestData({...requestData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none resize-none text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowRequestModal(false)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm">Cancel</button>
                <button onClick={handleSendRequest} disabled={isSendingRequest || !requestData.message.trim()} className="flex-1 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSendingRequest ? <Loader className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  {isSendingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
