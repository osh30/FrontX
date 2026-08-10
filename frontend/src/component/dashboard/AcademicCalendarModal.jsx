import { API_URL } from '../../config/api';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Upload, Loader, CheckCircle, Plus, Trash2, X, AlertTriangle, FileText, Sparkles, ChevronRight, Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = API_URL;

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AcademicCalendarModal = ({ isOpen, onClose, activePeriod = '', onCalendarPublished }) => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [selectedCal, setSelectedCal] = useState(null);

  // Form State
  const [academicPeriod, setAcademicPeriod] = useState(activePeriod || 'Spring 2026');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCalendars();
    }
  }, [isOpen]);

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/study-planner/calendars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendars(res.data);
      if (res.data.length > 0 && !selectedCal) {
        // Auto-select calendar matching activePeriod or latest
        const matched = res.data.find(c => c.academicPeriod === activePeriod) || res.data[0];
        setSelectedCal(matched);
      }
    } catch (err) {
      console.error('Failed to fetch calendars', err);
      toast.error('Failed to load academic calendars');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingPdf(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/api/study-planner/calendars/parse-pdf`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.academicPeriod) setAcademicPeriod(res.data.academicPeriod);
      if (res.data.title) setTitle(res.data.title);
      if (res.data.startDate) setStartDate(res.data.startDate);
      if (res.data.endDate) setEndDate(res.data.endDate);
      if (res.data.holidays) setHolidays(res.data.holidays);

      toast.success('Calendar PDF parsed successfully! Verify details below and publish.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse calendar PDF');
    } finally {
      setParsingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const addHoliday = () => {
    setHolidays([...holidays, { name: '', startDate: '', endDate: '', type: 'holiday' }]);
  };

  const updateHoliday = (idx, field, val) => {
    const updated = [...holidays];
    updated[idx] = { ...updated[idx], [field]: val };
    setHolidays(updated);
  };

  const removeHoliday = (idx) => {
    setHolidays(holidays.filter((_, i) => i !== idx));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!academicPeriod.trim()) return toast.error('Please enter an academic period (e.g. Spring 2026)');
    if (!startDate || !endDate) return toast.error('Start and End dates are required');
    if (new Date(endDate) <= new Date(startDate)) return toast.error('End date must be after start date');

    setPublishing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/study-planner/calendars`, {
        academicPeriod: academicPeriod.trim(),
        title: title.trim() || `${academicPeriod.trim()} Academic Calendar`,
        startDate,
        endDate,
        holidays
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Academic Calendar published for ${res.data.academicPeriod}!`);
      setShowPublishForm(false);
      await fetchCalendars();
      setSelectedCal(res.data);
      if (onCalendarPublished) onCalendarPublished(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish academic calendar');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this published academic calendar?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/study-planner/calendars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Academic calendar deleted');
      if (selectedCal && selectedCal._id === id) setSelectedCal(null);
      await fetchCalendars();
    } catch (err) {
      toast.error('Failed to delete calendar');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Global Academic Calendar</h2>
              <p className="text-blue-100/70 text-xs">Publish once, reuse 14 teaching weeks across all courses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-blue-100/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {showPublishForm ? (
            /* Publish Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Publish Academic Calendar
                </h3>
                <button onClick={() => setShowPublishForm(false)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">
                  Cancel & View Published
                </button>
              </div>

              {/* Quick AI Upload Option */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> Upload Calendar PDF (AI Auto-Extract)
                  </h4>
                  <p className="text-xs text-indigo-700/80 mt-1">
                    Upload your official university calendar PDF to automatically extract dates & holiday breaks.
                  </p>
                </div>
                <div>
                  <input type="file" accept=".pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" />
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={parsingPdf}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {parsingPdf ? <Loader className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Calendar PDF</>}
                  </button>
                </div>
              </div>

              <form onSubmit={handlePublish} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Academic Period / Session *</label>
                    <input
                      type="text"
                      placeholder="e.g. Spring 2026, January 2026, 6th Semester"
                      value={academicPeriod}
                      onChange={(e) => setAcademicPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Calendar Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Spring 2026 Academic Calendar"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Semester Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Semester End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                {/* Holidays / Breaks Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Holidays & University Breaks ({holidays.length})</label>
                      <p className="text-[11px] text-gray-500">Eid, Puja, mid-semester breaks, etc. (excluded from 14 teaching weeks)</p>
                    </div>
                    <button type="button" onClick={addHoliday} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Holiday/Break
                    </button>
                  </div>

                  {holidays.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">No holidays added yet. Click above to add holiday breaks.</p>
                  ) : (
                    <div className="space-y-2">
                      {holidays.map((h, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Holiday/Break Name (e.g. Eid-ul-Fitr)"
                            value={h.name}
                            onChange={(e) => updateHoliday(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <input
                            type="date"
                            value={h.startDate ? h.startDate.split('T')[0] : ''}
                            onChange={(e) => updateHoliday(idx, 'startDate', e.target.value)}
                            className="w-full md:w-36 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <span className="text-xs text-gray-400 font-bold hidden md:inline">to</span>
                          <input
                            type="date"
                            value={h.endDate ? h.endDate.split('T')[0] : ''}
                            onChange={(e) => updateHoliday(idx, 'endDate', e.target.value)}
                            className="w-full md:w-36 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <button type="button" onClick={() => removeHoliday(idx)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowPublishForm(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {publishing ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Publish Calendar</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* List Published Calendars & Active View */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Published Calendars</h3>
                  <p className="text-xs text-gray-500">Available globally across all courses in your Study Planner.</p>
                </div>
                <button
                  onClick={() => setShowPublishForm(true)}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Publish New Calendar
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : calendars.length === 0 ? (
                <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-700 text-base mb-1">No Published Academic Calendar</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                    Publish an Academic Calendar for your semester (e.g. Spring 2026) to calculate teaching weeks and enable course study plans.
                  </p>
                  <button
                    onClick={() => setShowPublishForm(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Publish Academic Calendar Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar list of calendars */}
                  <div className="space-y-3 md:col-span-1">
                    {calendars.map((cal) => (
                      <div
                        key={cal._id}
                        onClick={() => setSelectedCal(cal)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedCal && selectedCal._id === cal._id
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-sm'
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                            {cal.academicPeriod}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(cal._id); }}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            title="Delete calendar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm truncate">{cal.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {fmtDate(cal.startDate)} — {fmtDate(cal.endDate)}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {cal.teachingWeeks?.length || 14} Teaching Weeks
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Detail View */}
                  <div className="md:col-span-2 bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4">
                    {selectedCal ? (
                      <>
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-100 px-2 py-0.5 rounded-md">
                              {selectedCal.academicPeriod}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg mt-1">{selectedCal.title}</h3>
                            <p className="text-xs text-gray-500">
                              {fmtDate(selectedCal.startDate)} — {fmtDate(selectedCal.endDate)}
                            </p>
                          </div>
                        </div>

                        {/* Holidays */}
                        {selectedCal.holidays && selectedCal.holidays.length > 0 && (
                          <div>
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Holidays & Breaks</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedCal.holidays.map((h, i) => (
                                <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
                                  {h.name} ({fmtDate(h.startDate)} - {fmtDate(h.endDate)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Teaching Weeks */}
                        <div>
                          <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Calculated 14 Teaching Weeks</h5>
                          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                            {(selectedCal.teachingWeeks || []).map((w) => (
                              <div key={w.weekNumber} className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                <span className="font-bold text-gray-800">Week {w.weekNumber}</span>
                                <span className="text-gray-500">{fmtDate(w.startDate)} — {fmtDate(w.endDate)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-xs">Select a calendar on the left to view details.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AcademicCalendarModal;
