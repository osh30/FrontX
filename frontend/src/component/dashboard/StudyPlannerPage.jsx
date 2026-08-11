import { API_URL } from '../../config/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar, BookOpen, FileText, Upload, Download, CheckCircle, AlertTriangle,
  Clock, Loader, ChevronRight, ArrowLeft, Plus, Trash2, GraduationCap, Eye,
  BarChart3, Target, X, ChevronDown, ClipboardList, Lock, Unlock, Globe
} from 'lucide-react';

import axios from 'axios';
import toast from 'react-hot-toast';
import StudyPlannerAISection from './StudyPlannerAISection';
import AcademicCalendarModal from './AcademicCalendarModal';

const API = API_URL;

const MARK_DIST = {
  '1.0': [
    { component: 'Attendance & Class Performance', marks: 10 },
    { component: 'Continuous Assessment', marks: 30 },
    { component: 'Midterm Evaluation', marks: 24 },
    { component: 'Final Evaluation', marks: 36 },
    { component: 'Total', marks: 100 }
  ],
  '3.0': [
    { component: 'Attendance & Class Performance', marks: 30 },
    { component: 'Continuous Assessment', marks: 90 },
    { component: 'Midterm Evaluation', marks: 72 },
    { component: 'Final Evaluation', marks: 108 },
    { component: 'Total', marks: 300 }
  ]
};

const getGradeTable = (credit) => {
  const total = credit === 3.0 ? 300 : 100;
  const base = [
    { grade: 'A+', min: 80 }, { grade: 'A', min: 70 }, { grade: 'A-', min: 65 },
    { grade: 'B+', min: 60 }, { grade: 'B', min: 55 }, { grade: 'B-', min: 50 },
    { grade: 'C+', min: 45 }, { grade: 'C', min: 40 }, { grade: 'D', min: 33 },
    { grade: 'F', min: 0 }
  ];
  return base.map((g, i) => ({
    grade: g.grade,
    minMarks: Math.round((g.min / 100) * total * 10) / 10,
    maxMarks: i === 0 ? total : Math.round((base[i - 1].min / 100) * total * 10) / 10 - 0.1
  }));
};

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDateLong = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const StudyPlannerPage = () => {
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [generatingReminders, setGeneratingReminders] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);


  useEffect(() => {
    fetchPlanner();
    fetchStats();
  }, []);

  const fetchPlanner = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/study-planner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanner(res.data);
    } catch (err) {
      console.error('Failed to fetch planner', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/study-planner/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleGenerateReminders = async () => {
    try {
      setGeneratingReminders(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/study-planner/reminders`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.remindersCreated > 0) {
        toast.success(`${res.data.remindersCreated} reminder(s) generated`);
      } else {
        toast('No pending weeks to remind about');
      }
    } catch (err) {
      toast.error('Failed to generate reminders');
    } finally {
      setGeneratingReminders(false);
    }
  };

  const handleAddCourse = async (courseData) => {
    setAddingCourse(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/study-planner/courses`, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanner(res.data);
      fetchStats();
      toast.success('Course added successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add course');
      return false;
    } finally {
      setAddingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This will remove all its weeks and uploaded files.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API}/api/study-planner/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanner(res.data);
      if (selectedCourse && selectedCourse._id === courseId) setSelectedCourse(null);
      fetchStats();
      toast.success('Course deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const showSetup = !planner?.isSetupComplete;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {showSetup ? (
        <SetupView onComplete={(data) => { setPlanner(data); fetchStats(); }} />
      ) : selectedCourse ? (
        <CourseDetailView
          course={selectedCourse}
          planner={planner}
          onBack={() => setSelectedCourse(null)}
          onRefresh={() => { fetchPlanner(); fetchStats(); }}
          onDeleteCourse={handleDeleteCourse}
          onOpenCalendarModal={() => setShowCalendarModal(true)}
        />
      ) : (
        <DashboardView
          planner={planner}
          stats={stats}
          onSelectCourse={(course) => setSelectedCourse(course)}
          onRefresh={() => { fetchPlanner(); fetchStats(); }}
          onGenerateReminders={handleGenerateReminders}
          generatingReminders={generatingReminders}
          onAddCourse={handleAddCourse}
          addingCourse={addingCourse}
          onDeleteCourse={handleDeleteCourse}
          onOpenCalendarModal={() => setShowCalendarModal(true)}
        />
      )}

      <AcademicCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        activePeriod={planner?.semester || ''}
        onCalendarPublished={() => {
          fetchPlanner();
          fetchStats();
        }}
      />
    </div>
  );
};


/* ───────────────── SETUP VIEW ───────────────── */
const SetupView = ({ onComplete }) => {
  const [semester, setSemester] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courses, setCourses] = useState([{ courseCode: '', courseName: '', credit: 3.0 }]);
  const [saving, setSaving] = useState(false);

  const addCourse = () => {
    if (courses.length >= 7) return toast.error('Maximum 7 courses allowed');
    setCourses([...courses, { courseCode: '', courseName: '', credit: 3.0 }]);
  };

  const removeCourse = (idx) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const updateCourse = (idx, field, value) => {
    const updated = [...courses];
    updated[idx] = { ...updated[idx], [field]: value };
    setCourses(updated);
  };

  const handleSubmit = async () => {
    if (!semester.trim()) return toast.error('Please select a semester');
    if (!startDate) return toast.error('Please select a semester start date');
    if (!endDate) return toast.error('Please select a semester end date');
    if (new Date(endDate) <= new Date(startDate)) return toast.error('End date must be after start date');
    for (let i = 0; i < courses.length; i++) {
      if (!courses[i].courseCode.trim() || !courses[i].courseName.trim()) {
        return toast.error(`Course ${i + 1}: code and name are required`);
      }
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/study-planner/setup`, {
        semester,
        semesterStartDate: startDate,
        semesterEndDate: endDate,
        courses
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Study planner created!');
      onComplete(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Study Planner</h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Set up your semester to organize courses, track weekly progress, and never fall behind.
          </p>
        </div>
      </div>

      {/* Setup Form */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" /> First Time Setup
        </h2>

        {/* Semester + Dates */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Semester</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}
            className="w-full md:w-64 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none mb-4">
            <option value="">Select Semester</option>
            <option>1st Semester</option><option>2nd Semester</option><option>3rd Semester</option>
            <option>4th Semester</option><option>5th Semester</option><option>6th Semester</option>
            <option>7th Semester</option><option>8th Semester</option>
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Semester Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Semester End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none" />
            </div>
          </div>
          {startDate && endDate && new Date(endDate) > new Date(startDate) && (
            <p className="text-xs text-indigo-600 mt-2 font-medium">
              <Calendar className="w-3 h-3 inline mr-1" />
              {Math.ceil((new Date(endDate) - new Date(startDate)) / (7 * 24 * 60 * 60 * 1000))} weeks scheduled ({fmtDateLong(startDate)} — {fmtDateLong(endDate)})
            </p>
          )}
        </div>

        {/* Courses */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Courses ({courses.length}/7)</h3>
            <button onClick={addCourse} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Course
            </button>
          </div>

          <AnimatePresence>
            {courses.map((course, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Course Code</label>
                  <input type="text" placeholder="e.g. CSE-301" value={course.courseCode}
                    onChange={(e) => updateCourse(idx, 'courseCode', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Course Name</label>
                  <input type="text" placeholder="e.g. Database Systems" value={course.courseName}
                    onChange={(e) => updateCourse(idx, 'courseName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div className="w-full md:w-36">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Credit</label>
                  <select value={course.credit} onChange={(e) => updateCourse(idx, 'credit', parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value={1.0}>1.0 Credit</option>
                    <option value={3.0}>3.0 Credits</option>
                  </select>
                </div>
                {courses.length > 1 && (
                  <button onClick={() => removeCourse(idx)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button onClick={handleSubmit} disabled={saving}
          className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <><Calendar className="w-4 h-4" /> Save & Continue</>}
        </button>
      </div>
    </motion.div>
  );
};

/* ───────────────── DASHBOARD VIEW ───────────────── */
const DashboardView = ({ planner, stats, onSelectCourse, onRefresh, onGenerateReminders, generatingReminders, onAddCourse, addingCourse, onDeleteCourse, onOpenCalendarModal }) => {

  const [showAddCourse, setShowAddCourse] = useState(false);
  const canAddCourse = planner.courses.length < 7;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Study Planner</h1>
            <p className="text-blue-100/80">{planner.semester} — {planner.courses.length} Courses</p>
            {planner.semesterStartDate && (
              <p className="text-blue-100/50 text-xs mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                {fmtDateLong(planner.semesterStartDate)} — {fmtDateLong(planner.semesterEndDate)}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={onOpenCalendarModal}
              className="px-4 py-2.5 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg">
              <Calendar className="w-4 h-4" /> Academic Calendar
            </button>
            <button onClick={onGenerateReminders} disabled={generatingReminders}
              className="px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2">
              {generatingReminders ? <Loader className="w-4 h-4 animate-spin" /> : <BellIcon className="w-4 h-4" />} Generate Reminders
            </button>
          </div>
        </div>
      </div>


      {/* Global Academic Calendar Banner */}
      {planner.academicCalendar ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md">
                  Active Calendar
                </span>
                <span className="text-xs font-bold text-gray-700">{planner.academicCalendar.academicPeriod}</span>
              </div>
              <p className="font-bold text-gray-900">{planner.academicCalendar.title}</p>
              <p className="text-xs text-gray-500">
                {planner.academicCalendar.teachingWeeks?.length || 14} Teaching Weeks calculated (holidays & breaks excluded)
              </p>
            </div>
          </div>
          <button onClick={onOpenCalendarModal} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm">
            View / Change Calendar
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">No Academic Calendar Published for {planner.semester || 'Your Semester'}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Publish an Academic Calendar once to automatically calculate 14 teaching weeks for all your courses.
              </p>
            </div>
          </div>
          <button onClick={onOpenCalendarModal} className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-md shrink-0">
            Publish Academic Calendar
          </button>
        </motion.div>
      )}


      {/* Stats Bar */}
      {stats && stats.totalWeeks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
            { label: 'Total Weeks', value: stats.totalWeeks, icon: Calendar, color: 'from-purple-500 to-violet-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
          {/* Progress Bar */}
          <div className="col-span-2 md:col-span-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700">Semester Progress</p>
              <p className="text-sm font-bold text-indigo-600">{stats.percentage}%</p>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Mark Distribution + Grade Tables */}
      <MarkDistributionSection />

      {/* Course Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <button onClick={() => setShowAddCourse(true)} disabled={!canAddCourse || addingCourse}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${
              canAddCourse
                ? 'bg-gray-900 text-white hover:bg-indigo-600'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}>
            <Plus className="w-4 h-4" /> {addingCourse ? 'Adding...' : 'Add Course'}
          </button>
        </div>
        {!canAddCourse && (
          <p className="text-xs text-gray-500 mb-4">Maximum 7 courses allowed.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {planner.courses.map((course, i) => {
            const completedWeeks = course.weeks.filter(w => w.status === 'completed').length;
            const totalWeeks = course.weeks.length;
            const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

            return (
              <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="h-28 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10 text-center">
                    <GraduationCap className="w-8 h-8 text-white/80 mx-auto mb-1" />
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{course.courseCode}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCourse(course._id); }}
                      title="Delete course"
                      className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                      {course.credit} CR
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.courseName}</h3>
                  <p className="text-xs text-gray-500 mb-3">{completedWeeks}/{totalWeeks} weeks completed</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600">{progress}% complete</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showAddCourse && (
          <AddCourseModal
            onClose={() => setShowAddCourse(false)}
            onAddCourse={onAddCourse}
            addingCourse={addingCourse}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ───────────────── ADD COURSE MODAL ───────────────── */
const AddCourseModal = ({ onClose, onAddCourse, addingCourse }) => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credit, setCredit] = useState(3.0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      return toast.error('Course code and name are required');
    }
    const ok = await onAddCourse({
      courseCode: courseCode.trim(),
      courseName: courseName.trim(),
      credit
    });
    if (ok) {
      setCourseCode('');
      setCourseName('');
      setCredit(3.0);
      onClose();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Add Course</h3>
              <p className="text-blue-100/60 text-xs">Add a course for self-development</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-blue-100/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Course Code</label>
            <input type="text" placeholder="e.g. CSE-301" value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Course Name</label>
            <input type="text" placeholder="e.g. Database Systems" value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Credit</label>
            <select value={credit} onChange={(e) => setCredit(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
              <option value={1.0}>1.0 Credit</option>
              <option value={3.0}>3.0 Credits</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={addingCourse}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
              {addingCourse ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Course</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
};


/* ───────────────── MARK DISTRIBUTION + GRADES ───────────────── */
const MarkDistributionSection = () => {
  const creditRows = [
    { credit: 3.0, marks: MARK_DIST['3.0'], total: 300 },
    { credit: 1.0, marks: MARK_DIST['1.0'], total: 100 }
  ];

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mark Distribution & Grades</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {creditRows.map(({ credit, marks, total }) => {
          const gradeTable = getGradeTable(credit);

          return (
            <div key={credit} className="space-y-4">
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-2xl p-6 shadow-xl shadow-blue-900/20 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-300" />
                  <h3 className="font-bold text-sm">{credit} Credit — Mark Distribution</h3>
                  <span className="ml-auto text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md">
                    {credit} Credit = {total} Marks
                  </span>
                </div>
                <div className="space-y-2">
                  {marks.map((m, i) => (
                    <div key={i} className={`flex items-center justify-between py-2 ${i < marks.length - 1 ? 'border-b border-white/10' : 'pt-3'}`}>
                      <span className={`text-sm ${i === marks.length - 1 ? 'font-bold text-white' : 'text-blue-100/80'}`}>{m.component}</span>
                      <span className={`text-sm font-bold ${i === marks.length - 1 ? 'text-emerald-400' : 'text-white'}`}>{m.marks}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-gray-900">Grade Requirements (out of {total})</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Grade</th>
                        <th className="text-right px-4 py-2.5 font-bold text-gray-500 uppercase">Min Marks</th>
                        <th className="text-right px-4 py-2.5 font-bold text-gray-500 uppercase">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeTable.map((g, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-2 font-bold text-gray-900">{g.grade}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{g.minMarks}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{g.maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────── COURSE DETAIL VIEW ───────────────── */
const CourseDetailView = ({ course: initialCourse, planner, onBack, onRefresh, onDeleteCourse, onOpenCalendarModal }) => {


  const [course, setCourse] = useState(initialCourse);
  const [uploadingOutline, setUploadingOutline] = useState(false);
  const [uploadingWeekId, setUploadingWeekId] = useState(null);
  const [publishingWeekId, setPublishingWeekId] = useState(null);
  const outlineInputRef = useRef(null);

  const refreshCourse = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/study-planner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data.courses.find(c => c._id === course._id);
      if (updated) setCourse(updated);
    } catch (err) {
      console.error(err);
    }
  }, [course._id]);

  const handleOutlineUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingOutline(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/api/study-planner/courses/${course._id}/outline`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Course outline uploaded! Weekly topics generated.');
      setCourse(res.data.course);
      onRefresh();
    } catch (err) {
      if (err.response?.data?.calendarMissing) {
        toast.error(err.response.data.message, { duration: 6000 });
        if (onOpenCalendarModal) onOpenCalendarModal();
      } else {
        toast.error(err.response?.data?.message || 'Failed to upload outline');
      }
    } finally {
      setUploadingOutline(false);
      if (outlineInputRef.current) outlineInputRef.current.value = '';
    }
  };

  const handleWeekNoteUpload = async (weekId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingWeekId(weekId);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/api/study-planner/courses/${course._id}/weeks/${weekId}/note`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const v = res.data.week.geminiVerification;
      if (v.matched) {
        toast.success(`Topic Matched! Confidence: ${v.confidence}%`);
      } else {
        toast.error('This uploaded note does not match this week\'s assigned topic. Please upload the correct note.');
      }
      await refreshCourse();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload note');
    } finally {
      setUploadingWeekId(null);
    }
  };

  const handlePublishNote = async (weekId) => {
    setPublishingWeekId(weekId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/study-planner/courses/${course._id}/weeks/${weekId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Note published successfully. Other students can now view it in Learnings.');
      await refreshCourse();
      onRefresh();
    } catch (err) {
      console.error('Failed to publish note', err);
      toast.error(err.response?.data?.message || 'Failed to publish study note');
    } finally {
      setPublishingWeekId(null);
    }
  };

  const totalWeeks = course.weeks.length;
  const completedWeeks = course.weeks.filter(w => w.status === 'completed').length;
  const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Planner
      </button>

      {/* Course Hero */}
      <div className="relative overflow-hidden rounded-[24px] p-8 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg">{course.courseCode}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg">{course.credit} Credit</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg">{planner.semester}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{course.courseName}</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-3xl font-bold text-white">{progress}%</p>
              <p className="text-blue-100/60 text-xs">{completedWeeks}/{totalWeeks} weeks</p>
              <button onClick={() => onDeleteCourse(course._id)}
                className="px-3 py-2 bg-red-500/20 backdrop-blur-md border border-red-300/30 text-red-100 rounded-xl text-xs font-semibold hover:bg-red-500/40 transition-all flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete Course
              </button>
            </div>
          </div>
          <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Outline Upload */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Course Outline
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {course.outlineUploaded
                ? 'Outline uploaded. Weekly topics generated and mapped to your semester calendar.'
                : 'Upload your course outline PDF to auto-generate weekly topics with date ranges.'}
            </p>
          </div>
          <div>
            <input type="file" accept=".pdf" ref={outlineInputRef} onChange={handleOutlineUpload} className="hidden" />
            <button onClick={() => outlineInputRef.current?.click()} disabled={uploadingOutline}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${
                course.outlineUploaded
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-gray-900 text-white hover:bg-indigo-600'
              } disabled:opacity-50`}>
              {uploadingOutline ? <Loader className="w-4 h-4 animate-spin" /> :
                course.outlineUploaded ? <><CheckCircle className="w-4 h-4" /> Re-upload</> : <><Upload className="w-4 h-4" /> Upload Outline</>}
            </button>
          </div>
        </div>
        {course.outlineUploaded && course.outlinePdfUrl && (
          <a href={course.outlinePdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            <Eye className="w-3.5 h-3.5" /> View Uploaded Outline
          </a>
        )}
      </div>

      {/* Weekly Planner */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Planner</h2>
        {!course.weeksGenerated ? (
          <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No weekly topics yet.</p>
            <p className="text-sm text-gray-500">Upload the course outline to automatically generate weekly topics and map them to your semester calendar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.weeks.sort((a, b) => a.weekNumber - b.weekNumber).map((week) => (
              <WeekCard
                key={week._id}
                week={week}
                courseId={course._id}
                uploading={uploadingWeekId === week._id}
                onUpload={(e) => handleWeekNoteUpload(week._id, e)}
                publishing={publishingWeekId === week._id}
                onPublish={() => handlePublishNote(week._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Learning Resources */}
      <StudyPlannerAISection course={course} />
    </motion.div>
  );
};

/* ───────────────── WEEK CARD ───────────────── */
const WeekCard = ({ week, courseId, uploading, onUpload, publishing, onPublish }) => {
  const fileInputRef = useRef(null);
  const isCompleted = week.status === 'completed';
  const isMissed = week.status === 'missed';
  const isNotApplicable = week.status === 'not-applicable';
  const isUpcoming = week.status === 'upcoming';
  const isVerified = week.geminiVerification?.matched;
  const hasNote = !!week.notePdfUrl;
  const isPublished = week.isPublished === true;
  const isLocked = week.locked === true && !isMissed && !isCompleted;
  const isActive = week.isActive === true || week.status === 'pending';

  const getStatusBarColor = () => {
    if (isPublished) return 'bg-emerald-500';
    if (isCompleted) return 'bg-indigo-500';
    if (isMissed) return 'bg-red-500';
    if (isNotApplicable) return 'bg-gray-300';
    if (isActive) return 'bg-indigo-500';
    if (isLocked) return 'bg-gray-300';
    return 'bg-amber-400';
  };

  const getStatusBadge = () => {
    if (isPublished) return { text: 'Published ✓', classes: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' };
    if (isCompleted) return { text: 'Uploaded', classes: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold' };
    if (isMissed) return { text: 'Missed', classes: 'bg-red-50 text-red-700 font-bold border border-red-200' };
    if (isNotApplicable) return { text: 'Not Applicable', classes: 'bg-gray-100 text-gray-500 border border-gray-200' };
    if (isUpcoming) return { text: 'Upcoming', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
    if (isActive) return { text: 'Pending', classes: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold' };
    if (isLocked) return { text: 'Locked', classes: 'bg-gray-100 text-gray-500 border border-gray-200' };
    return { text: 'Pending', classes: 'bg-amber-50 text-amber-700 border border-amber-200' };
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isPublished ? 'border-emerald-300 shadow-emerald-50' :
        isCompleted ? 'border-indigo-200 shadow-indigo-50' :
        isMissed ? 'border-red-200 bg-red-50/10 shadow-red-50 ring-1 ring-red-200' :
        isNotApplicable ? 'border-gray-200 opacity-60 bg-gray-50/50' :
        isActive ? 'border-indigo-200 shadow-indigo-50 ring-1 ring-indigo-100' :
        isLocked ? 'border-gray-200 opacity-75' : 'border-gray-100'
      }`}>
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Left: Status indicator */}
        <div className={`w-full md:w-2 shrink-0 ${getStatusBarColor()}`} />

        <div className="flex-1 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Week number */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isPublished ? 'bg-emerald-100 text-emerald-700' :
            isCompleted ? 'bg-indigo-100 text-indigo-600' :
            isMissed ? 'bg-red-100 text-red-600' :
            isNotApplicable ? 'bg-gray-100 text-gray-400' :
            isActive ? 'bg-indigo-100 text-indigo-600' :
            isLocked ? 'bg-gray-100 text-gray-500' :
            'bg-amber-100 text-amber-600'
          }`}>
            {isLocked && !isMissed ? <Lock className="w-5 h-5" /> : <span className="text-lg font-bold">{week.weekNumber}</span>}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">Week {week.weekNumber}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${statusBadge.classes}`}>
                {statusBadge.text}
              </span>
              {isActive && !isCompleted && !isMissed && !isNotApplicable && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500 text-white animate-pulse">
                  Current Week
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-1">{week.topic}</p>

            {/* Date range & Deadline */}
            {isNotApplicable ? (
              <p className="text-[11px] text-gray-500 italic mt-1">
                Skipped — Course added after this week.
              </p>
            ) : week.startDate && week.endDate && (
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(week.startDate)} — {fmtDate(week.endDate)}
                </span>
                {week.endDate && !isCompleted && !hasNote && (
                  <span className={`flex items-center gap-1 text-[11px] ${isMissed ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    Deadline: {fmtDate(week.endDate)} {isMissed && '(Passed)'}
                  </span>
                )}
              </div>
            )}

            {/* Missed Warning */}
            {isMissed && !hasNote && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="font-medium">
                  Upload Missing Note Required. Uploading will automatically restore Career Opportunities.
                </span>
              </div>
            )}

            {/* Verification result */}
            {hasNote && week.geminiVerification?.verifiedAt && (
              <div className={`flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs ${
                isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {isVerified ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span className="font-medium">
                  {isVerified
                    ? `Topic Matched — Confidence: ${week.geminiVerification.confidence}%`
                    : week.geminiVerification.feedback || 'This uploaded note does not match this week\'s assigned topic.'}
                </span>
              </div>
            )}

            {/* Locked message */}
            {isLocked && !isMissed && !isNotApplicable && week.startDate && (
              <p className="text-[11px] text-gray-500 mt-1.5 italic">
                <Lock className="w-3 h-3 inline mr-1" />
                Unlocks on {fmtDateLong(week.startDate)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {hasNote && (
              <a href={week.notePdfUrl} target="_blank" rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View Note
              </a>
            )}
            {!isNotApplicable && (!isLocked || isMissed) && (
              <>
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={onUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                      : isMissed
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 font-bold'
                      : 'bg-gray-900 text-white hover:bg-indigo-600'
                  } disabled:opacity-50`}>
                  {uploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> :
                    hasNote ? <><Upload className="w-3.5 h-3.5" /> Re-upload</> :
                    isMissed ? <><Upload className="w-3.5 h-3.5" /> Upload Missing Note</> :
                    <><Upload className="w-3.5 h-3.5" /> Upload Note</>}
                </button>

                {isPublished ? (
                  <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Published ✓
                  </span>
                ) : (
                  <button
                    onClick={onPublish}
                    disabled={!hasNote || publishing}
                    title={!hasNote ? "Upload a study note first to enable publishing to Learnings" : "Publish your note so all FrontX students can view it in Learnings"}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      !hasNote
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white cursor-pointer shadow-indigo-200'
                    } disabled:opacity-60`}
                  >
                    {publishing ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <><Globe className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};



const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default StudyPlannerPage;
