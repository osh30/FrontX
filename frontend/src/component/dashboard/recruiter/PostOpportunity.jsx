import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Briefcase, FileText, MapPin, Calendar, Loader2, Plus, X,
  CheckCircle, Upload, Eye, Globe, Building2, Users, GraduationCap,
  Clock, Target, Award, File, Trash2, Send, ChevronDown
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const OPPORTUNITY_TYPES = [
  'Government Job', 'Private Job', 'Internship', 'Remote Job',
  'Part-Time Job', 'Scholarship', 'Competition'
];

const EMPLOYMENT_MODES = ['On-site', 'Hybrid', 'Remote'];

const DEPARTMENTS = [
  'Educational Technology and Engineering'
];

const LANGUAGES = ['English', 'Bangla', 'Hindi', 'Arabic', 'Mandarin', 'Other'];

const PostOpportunity = () => {
  const [form, setForm] = useState({
    title: '', opportunityType: '', department: '', location: '',
    employmentMode: 'On-site', vacancies: '', salaryMin: '', salaryMax: '',
    deadline: '', joiningDate: '',
    about: '', responsibilities: '', requirements: '', benefits: '', additionalInfo: '',
    minCgpa: '', experienceRequired: ''
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [eligibleDepartments, setEligibleDepartments] = useState([]);
  const [graduationYears, setGraduationYears] = useState([]);
  const [gradYearInput, setGradYearInput] = useState('');
  const [languages, setLanguages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const docInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Skills
  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills(prev => [...prev, val]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  // Graduation years
  const addGradYear = () => {
    const val = gradYearInput.trim();
    if (val && !graduationYears.includes(val)) {
      setGraduationYears(prev => [...prev, val]);
      setGradYearInput('');
    }
  };
  const removeGradYear = (y) => setGraduationYears(prev => prev.filter(x => x !== y));

  // Departments toggle
  const toggleDept = (dept) => {
    setEligibleDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  // Languages toggle
  const toggleLang = (lang) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  // Document upload
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be less than 10MB', 'error');
      return;
    }
    setUploadingDoc(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await axios.post(`${API_URL}/recruiter/opportunities/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [...prev, { name: data.name, url: data.url, type: data.type }]);
      showToast('Document uploaded');
    } catch (err) {
      showToast('Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };
  const removeDoc = (idx) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.opportunityType) errs.opportunityType = 'Select opportunity type';
    if (!form.about.trim()) errs.about = 'About section is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Preview data
  const previewData = () => ({
    ...form,
    skills,
    eligibleDepartments,
    graduationYears,
    languages,
    documents,
    salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'BDT' },
    eligibility: {
      minCgpa: form.minCgpa,
      eligibleDepartments,
      eligibleGraduationYears: graduationYears,
      experienceRequired: form.experienceRequired,
      languageRequirements: languages
    },
    description: {
      about: form.about,
      responsibilities: form.responsibilities,
      requirements: form.requirements,
      benefits: form.benefits,
      additionalInfo: form.additionalInfo
    }
  });

  // Publish
  const handlePublish = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/recruiter/opportunities`, {
        title: form.title.trim(),
        opportunityType: form.opportunityType,
        department: form.department,
        location: form.location,
        employmentMode: form.employmentMode,
        vacancies: Number(form.vacancies) || 1,
        salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'BDT' },
        deadline: form.deadline || undefined,
        joiningDate: form.joiningDate || undefined,
        description: {
          about: form.about,
          responsibilities: form.responsibilities,
          requirements: form.requirements,
          benefits: form.benefits,
          additionalInfo: form.additionalInfo
        },
        eligibility: {
          minCgpa: form.minCgpa,
          eligibleDepartments,
          eligibleGraduationYears: graduationYears,
          experienceRequired: form.experienceRequired,
          languageRequirements: languages
        },
        skills,
        documents
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Your opportunity has been submitted to the Admin for review. It will be published after approval.');
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish opportunity', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '', opportunityType: '', department: '', location: '',
      employmentMode: 'On-site', vacancies: '', salaryMin: '', salaryMax: '',
      deadline: '', joiningDate: '',
      about: '', responsibilities: '', requirements: '', benefits: '', additionalInfo: '',
      minCgpa: '', experienceRequired: ''
    });
    setSkills([]);
    setEligibleDepartments([]);
    setGraduationYears([]);
    setLanguages([]);
    setDocuments([]);
    setErrors({});
  };

  const inputClass = (err) =>
    `w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
      err ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'
    }`;

  const sectionLabel = (icon, title, subtitle) => (
    <div className="mb-2">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700'
                : 'bg-red-50/90 border-red-200 text-red-700'
            }`}>
            {toast.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-emerald-500" />
              : <X className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-8 sm:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Post Opportunity</h1>
          <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-2xl leading-relaxed">
            Submit career opportunities for FrontX students and alumni. Your posting will be reviewed by an admin before being published.
          </p>
        </div>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={(e) => { e.preventDefault(); handlePublish(); }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Opportunity Type */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          {sectionLabel(<Briefcase className="w-5 h-5 text-blue-600" />, 'Opportunity Type', 'Select the category that best describes this posting.')}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
            {OPPORTUNITY_TYPES.map(type => (
              <button key={type} type="button" onClick={() => { setForm(prev => ({ ...prev, opportunityType: type })); setErrors(prev => ({ ...prev, opportunityType: '' })); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  form.opportunityType === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}>
                {type}
              </button>
            ))}
          </div>
          {errors.opportunityType && <p className="text-xs text-red-500 mt-2">{errors.opportunityType}</p>}
        </div>

        {/* Basic Information */}
        <div className="p-6 sm:p-8 border-b border-gray-100 space-y-5">
          {sectionLabel(<Building2 className="w-5 h-5 text-blue-600" />, 'Basic Information', 'Core details about the opportunity.')}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Opportunity Title *</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Frontend Developer, Marketing Intern" className={inputClass(errors.title)} />
            </div>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department / Eligible Programs</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="department" value={form.department} onChange={handleChange}
                  className={`${inputClass(false)} appearance-none cursor-pointer`}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="Dhaka, Bangladesh" className={inputClass(false)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employment Mode</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="employmentMode" value={form.employmentMode} onChange={handleChange}
                  className={`${inputClass(false)} appearance-none cursor-pointer`}>
                  {EMPLOYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Vacancies</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" name="vacancies" value={form.vacancies} onChange={handleChange}
                  placeholder="1" min="1" className={inputClass(false)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary / Stipend (BDT)</label>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">৳</span>
                    <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange}
                      placeholder="Min" className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">৳</span>
                    <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange}
                      placeholder="Max" className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                  className={inputClass(false)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Joining Date (Optional)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange}
                  className={inputClass(false)} />
              </div>
            </div>
          </div>
        </div>

        {/* Description Sections */}
        <div className="p-6 sm:p-8 border-b border-gray-100 space-y-5">
          {sectionLabel(<FileText className="w-5 h-5 text-blue-600" />, 'Description', 'Provide detailed information about the opportunity.')}
          {[
            { name: 'about', label: 'About Opportunity *', rows: 4, placeholder: 'Describe the opportunity, its purpose, and what makes it unique...' },
            { name: 'responsibilities', label: 'Responsibilities', rows: 3, placeholder: 'Key responsibilities for this role...' },
            { name: 'requirements', label: 'Requirements', rows: 3, placeholder: 'Required qualifications, skills, and experience...' },
            { name: 'benefits', label: 'Benefits', rows: 2, placeholder: 'Perks, benefits, and what the candidate will gain...' },
            { name: 'additionalInfo', label: 'Additional Information', rows: 2, placeholder: 'Any other relevant details...' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
              <textarea name={field.name} value={form[field.name]} onChange={handleChange}
                rows={field.rows} placeholder={field.placeholder}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 resize-none ${
                  errors[field.name] ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'
                }`} />
              {errors[field.name] && <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>}
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="p-6 sm:p-8 border-b border-gray-100 space-y-5">
          {sectionLabel(<Target className="w-5 h-5 text-blue-600" />, 'Eligibility', 'Define who can apply for this opportunity.')}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum CGPA</label>
              <input name="minCgpa" value={form.minCgpa} onChange={handleChange}
                placeholder="e.g. 3.00" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience Required</label>
              <input name="experienceRequired" value={form.experienceRequired} onChange={handleChange}
                placeholder="e.g. 1-2 years" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Department(s)</label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dept => (
                <button key={dept} type="button" onClick={() => toggleDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    eligibleDepartments.includes(dept)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Graduation Year(s)</label>
            <div className="flex gap-2">
              <input value={gradYearInput} onChange={(e) => setGradYearInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGradYear(); } }}
                placeholder="Type year and press Enter" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              <button type="button" onClick={addGradYear}
                className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {graduationYears.map(y => (
                <span key={y} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                  {y}
                  <button type="button" onClick={() => removeGradYear(y)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type skill and press Enter" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              <button type="button" onClick={addSkill}
                className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language Requirements</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} type="button" onClick={() => toggleLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    languages.includes(lang)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="p-6 sm:p-8 border-b border-gray-100 space-y-4">
          {sectionLabel(<File className="w-5 h-5 text-blue-600" />, 'Documents', 'Upload optional supporting documents (PDF, Images). Max 10MB.')}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploadingDoc}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50">
              {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingDoc ? 'Uploading...' : 'Upload Document'}
            </button>
            <input ref={docInputRef} type="file" accept=".pdf,image/*" onChange={handleDocUpload} className="hidden" />
          </div>
          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                  </div>
                  <button type="button" onClick={() => removeDoc(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Method */}
        <div className="p-6 sm:p-8 border-b border-gray-100 space-y-5">
          {sectionLabel(<Send className="w-5 h-5 text-blue-600" />, 'Application Method', 'How candidates will apply for this opportunity.')}

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Inside FrontX</p>
                <p className="text-xs text-gray-500 mt-0.5">Recruiters will manage the complete hiring process inside FrontX (applications, shortlisting, interviews, offer letters).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 bg-gray-50/50">
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={resetForm} disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={() => { if (validate()) setShowPreview(true); }} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Submitting...' : 'Submit Opportunity'}
            </button>
          </div>
        </div>
      </motion.form>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
              {/* Preview Header */}
              <div className="relative bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#162a50] p-6 sm:p-8">
                <button onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-blue-400/20 text-blue-200 text-xs font-bold rounded-lg">{form.opportunityType || 'Opportunity'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{form.title || 'Untitled Opportunity'}</h2>
                <p className="text-sm text-blue-200/70 mt-2">{form.department || 'Department'} {form.location ? `• ${form.location}` : ''} {form.employmentMode ? `• ${form.employmentMode}` : ''}</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Key Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {form.vacancies && (
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Vacancies</p>
                      <p className="text-sm font-bold text-gray-900">{form.vacancies}</p>
                    </div>
                  )}
                  {(form.salaryMin || form.salaryMax) && (
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <span className="block text-lg font-bold text-emerald-600 mb-1">৳</span>
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="text-sm font-bold text-gray-900">{form.salaryMin || '0'} - {form.salaryMax || '0'}</p>
                    </div>
                  )}
                  {form.deadline && (
                    <div className="text-center p-3 bg-amber-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(form.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  {form.minCgpa && (
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Min CGPA</p>
                      <p className="text-sm font-bold text-gray-900">{form.minCgpa}</p>
                    </div>
                  )}
                </div>

                {/* Description sections */}
                {[
                  { label: 'About', content: form.about },
                  { label: 'Responsibilities', content: form.responsibilities },
                  { label: 'Requirements', content: form.requirements },
                  { label: 'Benefits', content: form.benefits },
                  { label: 'Additional Info', content: form.additionalInfo }
                ].filter(s => s.content).map(s => (
                  <div key={s.label}>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{s.label}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{s.content}</p>
                  </div>
                ))}

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility */}
                {(eligibleDepartments.length > 0 || graduationYears.length > 0 || languages.length > 0) && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Eligibility</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {eligibleDepartments.length > 0 && <p><span className="font-semibold text-gray-700">Departments:</span> {eligibleDepartments.join(', ')}</p>}
                      {graduationYears.length > 0 && <p><span className="font-semibold text-gray-700">Graduation Years:</span> {graduationYears.join(', ')}</p>}
                      {languages.length > 0 && <p><span className="font-semibold text-gray-700">Languages:</span> {languages.join(', ')}</p>}
                      {form.experienceRequired && <p><span className="font-semibold text-gray-700">Experience:</span> {form.experienceRequired}</p>}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Attached Documents</h4>
                    <div className="space-y-2">
                      {documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Method */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-700">
                      Application: <span className="text-blue-700">Inside FrontX</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Manage the complete hiring process inside FrontX.</p>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowPreview(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                  Close
                </button>
                <button onClick={() => { setShowPreview(false); handlePublish(); }} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {saving ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostOpportunity;
