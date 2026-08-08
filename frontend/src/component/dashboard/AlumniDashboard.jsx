import { API_BASE } from '../../config/api';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, MessageCircle, ChevronDown, ChevronLeft, ChevronRight, BookOpen, X, Clock, Calendar, User, ArrowRight, Activity, Award, Users, FileText, Briefcase } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import {
  WelcomeSection, StudentRequestsSection, MentorshipSessions,
  CareerOpportunitiesManagement, CollaborationResearch, CollaborationReview,
  CommunityManagement, ResourceSharingSection, AnalyticsSection,
  CommunityResourcesSection
} from './AlumniSections';
import CommunityFeed from './CommunityFeed';
import CreateCommunityPostPage from '../../pages/CreateCommunityPostPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { GlobalChat } from './GlobalChat';
import { NotificationsPage } from './NotificationsPage';
import ResourceDetailsPage from '../../pages/ResourceDetailsPage';
import Avatar from './Avatar';
import { NotificationDropdown } from './NotificationDropdown';
import BlogPage from './BlogPage';
import CreateBlogPage from './CreateBlogPage';
import BlogDetailsPage from './BlogDetailsPage';
import SavedBlogsPage from './SavedBlogsPage';
import AlumniOpportunitiesPage from './AlumniOpportunitiesPage';
import PremiumCareerOpportunities from './PremiumCareerOpportunities';
import OpportunityDetailsRouter from './OpportunityDetailsRouter';
import ApplicationFormPage from './ApplicationFormPage';
import MyApplicationsPage from './MyApplicationsPage';
import PremiumAdminResourceHub from './PremiumAdminResourceHub';


const SIDEBAR_KEY = 'frontx_dashboard_sidebar_collapsed';
const RIGHT_SIDEBAR_KEY = 'frontx_alumni_dashboard_right_sidebar_collapsed';

const AlumniDashboard = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 && pathParts[2] ? pathParts[2] : 'dashboard';

  const setActiveTab = (tab) => {
    navigate(tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`);
  };

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const handleCollapseToggle = (v) => {
    setCollapsed(v);
    try { localStorage.setItem(SIDEBAR_KEY, String(v)); } catch {}
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [viewedUserId, setViewedUserId] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [previousTab, setPreviousTab] = useState('dashboard');

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [liveCountdown, setLiveCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rightCollapsed, setRightCollapsed] = useState(() => {
    try { return localStorage.getItem(RIGHT_SIDEBAR_KEY) === '1'; } catch { return false; }
  });

  const handleRightToggle = () => {
    setRightCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(RIGHT_SIDEBAR_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], alumni: [], resources: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults({ students: [], alumni: [], resources: [] });
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ students: [], alumni: [], resources: [] });
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [notifRes, sessionRes] = await Promise.all([
          fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/mentorship-sessions`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (notifRes.ok) {
          const allNotifs = await notifRes.json();
          setRecentNotifications(Array.isArray(allNotifs) ? allNotifs.slice(0, 2) : []);
        }
        if (sessionRes.ok) {
          const sessions = await sessionRes.json();
          setUpcomingSessions(Array.isArray(sessions) ? sessions.filter(s => s.status === 'Upcoming') : []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  // Sync viewedUserId from URL search params (for GlobalChat View Profile)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId && activeTab === 'profile') {
      setViewedUserId(userId);
      setIsProfileEditable(false);
    }
  }, [location.search, activeTab]);

  const totalResults = searchResults.students.length + searchResults.alumni.length + searchResults.resources.length;

  const nextSession = useMemo(() => {
    if (!Array.isArray(upcomingSessions) || upcomingSessions.length === 0) return null;
    const now = new Date();
    const future = upcomingSessions
      .filter(s => new Date(s.sessionDate) > now)
      .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
    return future.length > 0 ? future[0] : null;
  }, [upcomingSessions]);

  useEffect(() => {
    if (!nextSession) {
      setLiveCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const updateCountdown = () => {
      const diff = new Date(nextSession.sessionDate) - new Date();
      if (diff <= 0) {
        setLiveCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setLiveCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextSession]);

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'message': return { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50' };
      case 'mentorship': return { icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'mentor': return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'collaboration': return { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      case 'application': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'job': return { icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50' };
      default: return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const handleViewProfile = (userId) => {
    setViewedUserId(userId);
    setIsProfileEditable(false);
    setActiveTab('profile');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 pb-10">
            <WelcomeSection userName={user?.name?.split(' ')[0] || 'Rakib'} />
            <StudentRequestsSection isPreview={true} onViewAll={() => setActiveTab('student-requests')} onViewProfile={handleViewProfile} onViewChat={() => setActiveTab('messages')} />
            <MentorshipSessions isPreview={true} onViewAll={() => setActiveTab('mentorship-sessions')} />
            <CollaborationResearch isPreview={true} onViewAll={() => setActiveTab('collaboration')} onReview={handleViewProfile} />
            <CommunityManagement isPreview={true} onViewAll={() => setActiveTab('community')} />
            <ResourceSharingSection isPreview={true} onViewAll={() => setActiveTab('resources')} />
            <AnalyticsSection isPreview={true} onViewAll={() => setActiveTab('analytics')} />
          </div>
        );
      case 'student-requests':
        return <StudentRequestsSection onViewProfile={handleViewProfile} onViewChat={() => setActiveTab('messages')} />;
      case 'mentorship-sessions':
        return <MentorshipSessions />;
      case 'collaboration':
      case 'research':
        return <CollaborationResearch onReview={handleViewProfile} />;
      case 'community':
        return pathParts[3] === 'create-post' ? <CreateCommunityPostPage /> : <CommunityFeed />;
      case 'resources':
        return pathParts[3] ? (
          <ResourceDetailsPage resourceId={pathParts[3]} standalone={false} />
        ) : (
          <div className="p-8 max-w-8xl mx-auto w-full">
            <PremiumAdminResourceHub fullPage={true} onCreateResource={() => navigate('/alumni/resources/create')} />
          </div>
        );
      case 'messages':
        return <GlobalChat user={user} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'blog':
        if (pathParts[3] === 'create') return <CreateBlogPage />;
        if (pathParts[3] === 'saved') return <SavedBlogsPage />;
        if (pathParts[3]) return <BlogDetailsPage />;
        return <BlogPage />;
      case 'opportunities':
        if (pathParts[3] === 'my-applications') {
          return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <MyApplicationsPage />
            </div>
          );
        }
        if (pathParts[3] === 'apply' && pathParts[4]) {
          return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <ApplicationFormPage />
            </div>
          );
        }
        return pathParts[3] ? (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <OpportunityDetailsRouter />
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <PremiumCareerOpportunities limit={null} fullPage={true} />
          </div>
        );
      case 'settings':
        return <SettingsPage user={user} />;
      case 'profile':
        return <ProfilePage user={user} isEditable={isProfileEditable && !viewedUserId} viewedUserId={viewedUserId} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm">
            <h2 className="text-xl text-gray-500 font-medium capitalize">Coming Soon: {activeTab.replace('-', ' ')}</h2>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FE] overflow-hidden">
      {/* Animated Background Gradients for the whole dashboard layout */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-300/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-300/10 rounded-full blur-[100px]" />
      </div>

      {/* LEFT SIDEBAR */}
      <DashboardSidebar 
        activeTab={activeTab} 
        collapsed={collapsed}
        setCollapsed={handleCollapseToggle}
        setActiveTab={(tab) => {
          setPreviousTab(activeTab);
          setActiveTab(tab);
          if (tab === 'profile') {
            setIsProfileEditable(false);
            setViewedUserId(null);
          }
        }} 
        userRole="alumni"
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col h-full relative z-10 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 shrink-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden lg:block w-8" /> {/* Spacer for mobile menu button */}
            <h1 className="text-2xl font-bold text-gray-800 hidden md:block capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <div className="relative ml-10 lg:ml-0" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                onFocus={() => { if (totalResults > 0) setShowDropdown(true); }}
                placeholder="Search students, alumni, resources..."
                className="pl-10 pr-10 py-2.5 w-48 md:w-64 xl:w-80 bg-white/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : totalResults === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No matching students, alumni, or resources found.</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.students.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Students</div>
                            {searchResults.students.map((s) => (
                              <button
                                key={s._id}
                                onClick={() => { clearSearch(); handleViewProfile(s._id); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                              >
                                <Avatar src={s.profilePicture} alt="Student" size={32} className="border border-gray-200" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{s.department || 'Student'}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {searchResults.alumni.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Alumni</div>
                            {searchResults.alumni.map((a) => (
                              <button
                                key={a._id}
                                onClick={() => { clearSearch(); handleViewProfile(a._id); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                              >
                                <Avatar src={a.profilePicture} alt="Alumni" size={32} className="border border-gray-200" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{a.careerInterest || a.department || 'Alumni'}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {searchResults.resources.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Resources</div>
                            {searchResults.resources.map((r) => (
                              <button
                                key={r._id}
                                onClick={() => { clearSearch(); navigate(`/dashboard/resources/${r._id}`, { state: { resource: r } }); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                                  <BookOpen className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{r.category} — {r.alumniId?.name || 'Alumni'}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => { 
                  setIsNotificationsOpen(false); 
                  setIsProfileOpen(false);
                  if (activeTab === 'messages') {
                    setActiveTab(previousTab !== 'messages' ? previousTab : 'dashboard');
                  } else {
                    setPreviousTab(activeTab);
                    setActiveTab('messages');
                  }
                }}
                className="relative p-2.5 bg-white/80 border border-gray-100 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm group"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full group-hover:animate-ping"></span>
              </button>
            </div>
            <div className="relative">
              <button 
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
                className="relative p-2.5 bg-white/80 border border-gray-100 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm group"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
                {unreadNotifCount === 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full group-hover:animate-ping"></span>
                )}
              </button>
              <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} onUnreadCount={setUnreadNotifCount} />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
                className="flex items-center gap-2 p-1.5 pr-3 bg-white/80 border border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm ml-2"
              >
                <Avatar src={user?.profilePicture} alt="Avatar" size={32} className="border border-gray-200" />
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Avatar Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'Rakib'}</p>
                      <p className="text-xs text-gray-500">mentor@university.edu</p>
                    </div>
                    {['My Profile', 'Settings'].map((item) => (
                      <button 
                        key={item} 
                        onClick={() => {
                          if (item === 'Settings') setActiveTab('settings');
                          else {
                            setActiveTab('profile');
                            setIsProfileEditable(true);
                          }
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN & RIGHT PANEL WRAPPER */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-6 lg:p-8 max-w-screen-2xl mx-auto">
            
            {/* LEFT MAIN CONTENT */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT SIDE PANEL — only on home page */}
            {activeTab === 'dashboard' && (
              <AnimatePresence initial={false}>
                {!rightCollapsed && (
                  <motion.div
                    key="right-panel"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div className="w-full lg:w-80 space-y-6">
                      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg shadow-slate-900/5 sticky top-6 overflow-hidden">
                        {/* Panel Header — Recent Activity + collapse toggle */}
                        <div className="flex items-center justify-between gap-2 px-6 pt-5 pb-4">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#1E3A8A]" /> Recent Activity
                          </h3>
                          <button
                            onClick={handleRightToggle}
                            title="Hide Activity Panel"
                            aria-label="Hide Activity Panel"
                            className="p-2 rounded-full bg-white border border-gray-100 text-[#0B1120] shadow-sm hover:scale-110 hover:shadow-md hover:border-gray-200 active:scale-95 transition-all duration-200 shrink-0"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>

                        {/* ─── Section 1: Recent Activity ─── */}
                        <div className="px-6 pb-5">
                          {recentNotifications.length === 0 ? (
                            <div className="py-5 text-center">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                                <Bell className="w-4 h-4 text-gray-300" />
                              </div>
                              <p className="text-xs text-gray-400">No recent activity.</p>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {recentNotifications.map((notif) => {
                                const { icon: NotifIcon, color, bg } = getNotifIcon(notif.type);
                                return (
                                  <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                      !notif.isRead
                                        ? 'bg-blue-50/80 border border-blue-100/60'
                                        : 'bg-gray-50/50 border border-transparent hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                      <NotifIcon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] text-gray-700 leading-snug line-clamp-2">{notif.message}</p>
                                      <p className="text-[11px] text-gray-400 mt-1">{getRelativeTime(notif.createdAt)}</p>
                                    </div>
                                    {!notif.isRead && (
                                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 animate-pulse" />
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                        {/* ─── Section 2: Upcoming Session ─── */}
                        <div className="px-6 pt-5 pb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Upcoming Session</span>
                          </div>
                          {!nextSession ? (
                            <div className="py-5 text-center">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                                <Calendar className="w-4 h-4 text-gray-300" />
                              </div>
                              <p className="text-xs text-gray-400">No upcoming sessions scheduled.</p>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-br from-[#0F172A] via-[#162032] to-[#1E3A8A] rounded-2xl p-4 text-white shadow-lg shadow-blue-900/20"
                            >
                              {/* Session Info */}
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                                  <Calendar className="w-5 h-5 text-blue-300" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold leading-tight line-clamp-1">{nextSession.sessionTitle}</p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <User className="w-3 h-3 text-blue-300" />
                                    <p className="text-[11px] text-blue-200/80 truncate">
                                      {nextSession.selectedStudents?.length > 0
                                        ? `${nextSession.selectedStudents.length} student${nextSession.selectedStudents.length > 1 ? 's' : ''}`
                                        : 'No students yet'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Date & Time */}
                              <div className="flex items-center gap-3 mb-4 text-[11px] text-blue-200/70">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(nextSession.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-white/20">|</span>
                                <span>{nextSession.sessionTime}</span>
                              </div>

                              {/* Live Countdown */}
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 mb-2">Starts in</p>
                                <div className="flex items-center justify-center gap-1">
                                  {[
                                    { val: liveCountdown.days, label: 'Days' },
                                    { val: liveCountdown.hours, label: 'Hrs' },
                                    { val: liveCountdown.minutes, label: 'Min' },
                                    { val: liveCountdown.seconds, label: 'Sec' },
                                  ].map((unit, i) => (
                                    <div key={unit.label} className="flex items-center gap-1">
                                      <div className="text-center">
                                        <span className="text-lg font-extrabold tabular-nums drop-shadow-sm">
                                          {String(unit.val).padStart(2, '0')}
                                        </span>
                                        <p className="text-[9px] text-blue-300/60 font-medium uppercase mt-0.5">{unit.label}</p>
                                      </div>
                                      {i < 3 && <span className="text-blue-400/40 text-sm font-bold mt-[-10px]">:</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Footer Action */}
                        <div className="px-6 pb-5">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/dashboard/mentorship-sessions')}
                            className="w-full py-2.5 bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white rounded-xl text-sm font-medium shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                          >
                            Manage Schedule <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* FLOATING EXPAND BUTTON — shown when the activity panel is collapsed */}
            {activeTab === 'dashboard' && rightCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={handleRightToggle}
                title="Show Activity Panel"
                aria-label="Show Activity Panel"
                className="fixed top-24 right-4 z-40 p-2.5 rounded-full bg-white border border-gray-100 text-[#0B1120] shadow-lg shadow-gray-900/10 hover:scale-110 hover:bg-[#0B1120] hover:text-white hover:shadow-xl hover:shadow-[#0B1120]/20 active:scale-95 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default AlumniDashboard;