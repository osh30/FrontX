import { API_BASE, SOCKET_URL } from '../../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Users, Award, Briefcase, Share2, 
  Calendar, Download, FileText, CheckCircle, Clock, UserPlus, Upload, FileUp, Sparkles
} from 'lucide-react';

// Custom CountUp Component
const CountUp = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const endVal = parseFloat(end) || 0;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(ease * endVal);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  // If original string wasn't a pure number, maybe just return end if error
  if (isNaN(parseFloat(end))) return <span>{end}</span>;
  
  return <span>{Number.isInteger(parseFloat(end)) ? Math.floor(count) : count.toFixed(1)}{suffix}</span>;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const AlumniAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 7_days, 30_days, 3_months, 1_year, all
  const printRef = useRef();

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/alumni/analytics/dashboard?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
    
    const socket = io(SOCKET_URL);
    // Listen to real-time events that would affect metrics
    socket.on('request_updated', fetchAnalytics);
    socket.on('session_updated', fetchAnalytics);
    socket.on('new_resource', fetchAnalytics);
    socket.on('collaboration_updated', fetchAnalytics);
    socket.on('message_received', fetchAnalytics);

    return () => socket.disconnect();
  }, [filter]);

  const handleExportPDF = () => {
    window.print(); // Using native print, styled with CSS print media queries
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csvRows = [
      ["Metric", "Value"],
      ["Total Students Mentored", data.overview.totalStudentsMentored],
      ["Active Mentorships", data.overview.activeMentorships],
      ["Completed Mentorships", data.overview.completedMentorships],
      ["Collaboration Projects", data.overview.collaborationProjects],
      ["Total Messages Exchanged", data.overview.totalMessagesExchanged],
      ["Profile Views", data.overview.profileViews],
      ["Resources Shared", data.overview.resourcesShared]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mentorship_impact_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics.</div>;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 pb-10" ref={printRef}>
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Mentorship Impact</h2>
          <p className="text-gray-500 mt-1">Data-driven insights into your contributions.</p>
        </div>
        
        <div className="flex items-center gap-3 no-print">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-purple-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="7_days">Last 7 Days</option>
            <option value="30_days">Last 30 Days</option>
            <option value="3_months">Last 3 Months</option>
            <option value="1_year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm" title="Export CSV">
              <FileText className="w-5 h-5" />
            </button>
            <button onClick={handleExportPDF} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm" title="Export PDF">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", val: data.overview.totalStudentsMentored, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Mentorships", val: data.overview.activeMentorships, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed Sessions", val: data.overview.completedMentorships, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Collaborations", val: data.overview.collaborationProjects, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Resources Shared", val: data.overview.resourcesShared, icon: Share2, color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeInUp} className="bg-white/80 backdrop-blur-xl border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900"><CountUp end={stat.val} /></div>
              <div className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 9. SMART INSIGHTS */}
      {data.insights && data.insights.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">AI-Powered Insights</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {data.insights.map((insight, i) => (
              <div key={i} className="bg-white/60 p-4 rounded-xl border border-white text-sm font-medium text-gray-700">
                {insight}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 2. CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div variants={fadeInUp} className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Monthly Mentorship Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart1}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Line type="monotone" dataKey="requests" name="Requests Received" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="completed" name="Completed Sessions" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div variants={fadeInUp} className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Research Collaboration Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="topic" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="interested" name="Interested Students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM SECTIONS */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* 3. RECENT ACTIVITY TIMELINE */}
        <motion.div variants={fadeInUp} className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm h-96 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {data.timeline.length === 0 ? (
              <div className="text-gray-500 text-sm text-center mt-10">No recent activity.</div>
            ) : (
              data.timeline.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== data.timeline.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-100 -mb-6"></div>}
                  <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                    {item.icon === 'UserPlus' && <UserPlus className="w-4 h-4 text-purple-500" />}
                    {item.icon === 'Briefcase' && <Briefcase className="w-4 h-4 text-amber-500" />}
                    {item.icon === 'Upload' && <Upload className="w-4 h-4 text-blue-500" />}
                    {item.icon === 'CheckCircle' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          {/* 4. TOP PERFORMING CONTENT */}
          <motion.div variants={fadeInUp} className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Top Performing Content</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-purple-50 hover:border-purple-100 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Most Viewed Resource</div>
                  <div className="font-semibold text-gray-900 truncate max-w-[150px]" title={data.topContent.mostViewedResource.title}>{data.topContent.mostViewedResource.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-purple-600"><CountUp end={data.topContent.mostViewedResource.views} /></div>
                  <div className="text-xs text-purple-400">Views</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-blue-50 hover:border-blue-100 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Popular Research</div>
                  <div className="font-semibold text-gray-900 truncate max-w-[150px]" title={data.topContent.mostPopularResearch.title}>{data.topContent.mostPopularResearch.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-600"><CountUp end={data.topContent.mostPopularResearch.interested} /></div>
                  <div className="text-xs text-blue-400">Applied</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Most Downloaded</div>
                  <div className="font-semibold text-gray-900 truncate max-w-[150px]" title={data.topContent.mostDownloadedResource.title}>{data.topContent.mostDownloadedResource.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600"><CountUp end={data.topContent.mostDownloadedResource.downloads} /></div>
                  <div className="text-xs text-emerald-400">Downloads</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-pink-50 hover:border-pink-100 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Requested Topic</div>
                  <div className="font-semibold text-gray-900 truncate max-w-[150px]" title={data.topContent.mostRequestedTopic.title}>{data.topContent.mostRequestedTopic.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-pink-600"><CountUp end={data.topContent.mostRequestedTopic.requests} /></div>
                  <div className="text-xs text-pink-400">Requests</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. STUDENT ENGAGEMENT */}
          <motion.div variants={fadeInUp} className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Student Engagement</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center group relative">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900"><CountUp end={data.engagement.studentsConnected} /></div>
                <div className="text-xs font-semibold text-gray-500 mt-1">Connected</div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Unique students connected
                </div>
              </div>

              <div className="text-center group relative">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900">{data.engagement.avgResponseTime}</div>
                <div className="text-xs font-semibold text-gray-500 mt-1">Response Time</div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Avg time to respond
                </div>
              </div>

              <div className="text-center group relative">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                  <FileUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900"><CountUp end={data.engagement.pendingRequests} /></div>
                <div className="text-xs font-semibold text-gray-500 mt-1">Pending</div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Total pending requests
                </div>
              </div>

              <div className="text-center group relative">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900"><CountUp end={data.engagement.completedCollaborations} /></div>
                <div className="text-xs font-semibold text-gray-500 mt-1">Collabs Done</div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Completed research collabs
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </motion.div>
  );
};
