import { API_BASE, SOCKET_URL } from '../../config/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Bell, Search, MessageCircle, ChevronDown, ChevronLeft, ChevronRight, Activity, Clock, Users, ArrowRight, X, Loader2, SlidersHorizontal, Calendar, Briefcase, GraduationCap, FileText, BookOpen } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import {
  WelcomeSection, RecommendedMentors, UpcomingSessions,
  CareerOpportunities, AISkillAnalysis, ProgressTrackerPreview,
  ResourceHub, RecommendedLearning, AnonymousSharing,
  StudentNetwork, CollaborationSection
} from './DashboardSections';
import PremiumProgressPage from './PremiumProgressPage';
import PremiumResourceHubPage from './PremiumResourceHubPage';
import CommunityFeed from './CommunityFeed';
import CreateCommunityPostPage from '../../pages/CreateCommunityPostPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import CommunityFeedPreview from './CommunityFeedPreview';
import AISkillAnalysisPage from './AISkillAnalysisPage';
import { GlobalChat } from './GlobalChat';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsPage } from './NotificationsPage';
import { CollaborationPage } from './CollaborationPage';
import SessionsPage from './SessionsPage';
import StudentSessionDetailsPage from './StudentSessionDetailsPage';
import { User as UserIcon } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import ResourceDetailsPage from '../../pages/ResourceDetailsPage';
import LearningsPage from './LearningsPage';
import LearningDetailsPage from './LearningDetailsPage';
import StudyPlannerPage from './StudyPlannerPage';
import BlogPage from './BlogPage';
import CreateBlogPage from './CreateBlogPage';
import BlogDetailsPage from './BlogDetailsPage';
import SavedBlogsPage from './SavedBlogsPage';
import StudentInterviews from './StudentInterviews';
import Avatar from './Avatar';
import PremiumCareerOpportunities from './PremiumCareerOpportunities';
import OpportunityDetailsRouter from './OpportunityDetailsRouter';
import ApplicationFormPage from './ApplicationFormPage';
import MyApplicationsPage from './MyApplicationsPage';
import PremiumAdminResourceHub from './PremiumAdminResourceHub';

const SIDEBAR_KEY = 'frontx_dashboard_sidebar_collapsed';
const RIGHT_SIDEBAR_KEY = 'frontx_dashboard_right_sidebar_collapsed';

const StudentDashboard = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 && pathParts[2] ? pathParts[2] : 'dashboard';

  const showRightPanel = activeTab !== 'profile' && activeTab !== 'settings' && activeTab !== 'progress' && activeTab !== 'mentorship' && activeTab !== 'messages' && activeTab !== 'collaboration' && activeTab !== 'sessions' && activeTab !== 'meetings' && activeTab !== 'career' && activeTab !== 'skills' && activeTab !== 'ai-skill-analysis' && activeTab !== 'resources' && activeTab !== 'community' && activeTab !== 'learnings' && activeTab !== 'blog' && activeTab !== 'interviews';

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [viewedUserId, setViewedUserId] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], alumni: [], resources: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const [rightCollapsed, setRightCollapsed] = useState(() => {
    try { return localStorage.getItem(RIGHT_SIDEBAR_KEY) === '1'; } catch { return false; }
  });

  const handleCollapseToggle = (v) => {
    setCollapsed(v);
    try { localStorage.setItem(SIDEBAR_KEY, String(v)); } catch {}
  };

  const handleRightToggle = () => {
    setRightCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(RIGHT_SIDEBAR_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Sync viewedUserId from URL search params (for GlobalChat View Profile)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId && activeTab === 'profile') {
      setViewedUserId(userId);
      setIsProfileEditable(false);
    }
  }, [location.search, activeTab]);


  const handleViewProfile = (userId) => {
    setViewedUserId(userId);
    setIsProfileEditable(false);
    navigate(`/dashboard/profile/${userId}`);
  };

  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults({ students: [], alumni: [], resources: [] });
      setShowSearchDropdown(false);
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
        setShowSearchDropdown(true);
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
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ students: [], alumni: [], resources: [] });
    setShowSearchDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalSearchResults = searchResults.students.length + searchResults.alumni.length + searchResults.resources.length;

  const SectionHeader = ({ title, viewAllPath }) => {
    const navigate = useNavigate();

    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => navigate(viewAllPath)}
          className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <WelcomeSection userName={user?.name?.split(' ')[0] || 'Nure'} />
            <CollaborationSection onViewProfile={handleViewProfile} />
            <RecommendedMentors onViewProfile={handleViewProfile} />
            <SectionHeader title="Upcoming Sessions" viewAllPath="/dashboard/sessions" />
            <UpcomingSessions />
            <CareerOpportunities />
            <SectionHeader title="Analysis" viewAllPath="/dashboard/ai-skill-analysis" />
            <AISkillAnalysis />
            <SectionHeader title="Progress" viewAllPath="/dashboard/progress" />
            <ProgressTrackerPreview setActiveTab={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`)} />
            <SectionHeader title="Resources" viewAllPath="/dashboard/resources" />
            <ResourceHub />
            <RecommendedLearning />
            <SectionHeader title="Community" viewAllPath="/dashboard/community" />
            <CommunityFeedPreview setActiveTab={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`)} />
            <div className="mt-8"><StudentNetwork onViewProfile={handleViewProfile} /></div>
          </>
        );
      case 'collaboration':
        return <CollaborationPage onViewProfile={handleViewProfile} />;
      case 'mentorship':
        return <MentorshipPage onViewProfile={handleViewProfile} />;
      case 'sessions':
        return pathParts[3] ? (
          <StudentSessionDetailsPage />
        ) : (
          <SessionsPage />
        );
      case 'career':
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
      case 'interviews':
        return (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <StudentInterviews />
          </div>
        );
        case 'skills':
        return (
          <div className="p-8 max-w-7xl mx-auto w-full">
            <AISkillAnalysis />
          </div>
        );
      case 'resources':
        return pathParts[3] ? (
          <ResourceDetailsPage resourceId={pathParts[3]} standalone={false} />
        ) : (
          <div className="p-8 max-w-8xl mx-auto w-full">
            <PremiumAdminResourceHub fullPage={true} />
          </div>
        );
      case 'progress':
        return <PremiumProgressPage 
          setActiveTab={(tab) => {
            navigate(tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`);
            if (tab === 'profile') setIsProfileEditable(true);
          }} 
        />;
      case 'ai-skill-analysis':
        return <AISkillAnalysisPage />;
      case 'learnings':
        return pathParts[3] ? (
          <LearningDetailsPage />
        ) : (
          <LearningsPage />
        );
      case 'blog':
        if (pathParts[3] === 'create') return <CreateBlogPage />;
        if (pathParts[3] === 'saved') return <SavedBlogsPage />;
        if (pathParts[3]) return <BlogDetailsPage />;
        return <BlogPage />;
      case 'study-planner':
        return <StudyPlannerPage />;
      case 'community':
        return pathParts[3] === 'create-post' ? <CreateCommunityPostPage /> : <CommunityFeed />;
      case 'network':
        return <StudentNetwork onViewProfile={handleViewProfile} /> ;
      case 'messages':
        return <GlobalChat user={user} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage user={user} />;
      case 'profile': {
        const profileUserId = pathParts.length > 3 && pathParts[3] ? pathParts[3] : viewedUserId;
        return <ProfilePage user={user} isEditable={isProfileEditable && !profileUserId} viewedUserId={profileUserId} />;
      }
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50">
            <h2 className="text-xl text-gray-500 font-medium">Coming Soon: {activeTab}</h2>
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
          navigate(tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`);
          if (tab === 'profile') {
            setIsProfileEditable(false);
            setViewedUserId(null);
          }
        }} 
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                onFocus={() => { if (totalSearchResults > 0) setShowSearchDropdown(true); }}
                placeholder="Search students, alumni, resources..."
                className="pl-10 pr-10 py-2.5 w-48 md:w-64 xl:w-80 bg-white/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && (
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
                    ) : totalSearchResults === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No matching students, alumni, or resources found.</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.students.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">Students</div>
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
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">Alumni</div>
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
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">Resources</div>
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
                  navigate('/dashboard/messages');
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
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'Student Name'}</p>
                    </div>
                    {['My Profile', 'Settings'].map((item) => (
                      <button 
                        key={item} 
                        onClick={() => {
                          if (item === 'Settings') navigate('/dashboard/settings');
                          else {
                            navigate('/dashboard/profile');
                            setIsProfileOpen(false);
                            setIsProfileEditable(true);
                          }
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
              <ErrorBoundary>
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
              </ErrorBoundary>
            </div>

            {/* RIGHT SIDE PANEL */}
            {showRightPanel && (
              <AnimatePresence initial={false}>
                {!rightCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div className="w-full lg:w-80">
                      <ErrorBoundary>
                        <RightSidebar onToggle={handleRightToggle} />
                      </ErrorBoundary>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* FLOATING EXPAND BUTTON — shown when the activity panel is collapsed */}
            {showRightPanel && rightCollapsed && (
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

const MentorshipPage = ({ onViewProfile }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef(null);

  const fetchAlumni = useCallback(async (pageNum = 1, append = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!append) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department) params.set('department', department);
      params.set('page', pageNum);
      params.set('limit', '9');

      const res = await fetch(`${API_BASE}/users/mentors?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setAlumni(prev => [...prev, ...data.mentors]);
        } else {
          setAlumni(data.mentors);
          setDepartments(data.departments || []);
        }
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (err) {
      console.error('Failed to fetch alumni', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, department]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAlumni(1);
    }, 300);
    const socket = io(SOCKET_URL);
    socket.on('new_alumni_registered', () => fetchAlumni(1));
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      socket.disconnect();
    };
  }, [search, department, fetchAlumni]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchAlumni(page + 1, true);
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
  };

  const hasActiveFilters = search || department;
  const displayedCount = alumni.length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] shadow-2xl shadow-blue-900/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/10 shadow-[0_0_80px_40px_rgba(255,255,255,0.05)]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">Recommended Mentors</h1>
          <p className="text-blue-100/80 max-w-xl mx-auto leading-relaxed">
            Connect with experienced alumni mentors who can guide you through your academic and professional journey.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, department, or interest..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer min-w-[180px]">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-6">
          {total > 0 ? `Showing ${displayedCount} of ${total} alumni` : 'No alumni found'}
          {hasActiveFilters && ' matching your filters'}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : alumni.length === 0 ? (
        <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No alumni available at the moment.</p>
          <p className="text-sm text-gray-500">Check back later as new mentors join the platform.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((person) => (
              <div
                key={person._id}
                className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                onClick={() => onViewProfile && onViewProfile(person._id)}
              >
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar src={person.profilePicture} alt={person.name} size={80} className="border-2 border-white shadow-md mb-4" />
                    <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{person.department || 'Alumni'}</p>
                    {person.graduationYear && (
                      <p className="text-xs text-gray-500 mb-1">Graduated: {person.graduationYear}</p>
                    )}
                    <p className="text-sm font-medium text-purple-600 mb-4">
                      {person.careerInterest || person.bio?.split('.')[0] || 'Alumni Mentor'}
                    </p>
                    {person.interests && person.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {person.interests.slice(0, 3).map((interest, i) => (
                          <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors shadow-md"
                    onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(person._id); }}
                  >
                    View Profile
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {page < totalPages && (
            <div className="flex justify-center mt-10">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleLoadMore} disabled={loadingMore}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 hover:text-purple-700 transition-all flex items-center gap-2 disabled:opacity-50">
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {loadingMore ? 'Loading...' : `Load More (${total - displayedCount} remaining)`}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const notifIcons = {
  job: Briefcase,
  mentor: GraduationCap,
  message: MessageCircle,
  system: Bell,
  application: FileText,
  mentorship: Calendar
};

function RightSidebar({ onToggle }) {
  const [notifications, setNotifications] = useState([]);
  const [nearestSession, setNearestSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 2));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchNearestSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const [sessionsRes, groupRes] = await Promise.all([
        fetch(`${API_BASE}/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/mentorship-sessions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      let all = [];
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        all = all.concat(data);
      }
      if (groupRes.ok) {
        const data = await groupRes.json();
        all = all.concat(data.map(s => ({
          ...s,
          title: s.sessionTitle,
          date: s.sessionDate,
          time: s.sessionTime,
          alumni: s.alumniId,
          _sessionType: 'group'
        })));
      }
      const upcoming = all
        .filter(s => s.status === 'Scheduled' || s.status === 'Upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setNearestSession(upcoming[0] || null);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNearestSession();
    const socket = io(SOCKET_URL);
    socket.on('new_notification', () => { fetchNotifications(); });
    socket.on('notification:new', () => { fetchNotifications(); });
    socket.on('session_updated', () => { fetchNearestSession(); });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!nearestSession) return;
    const tick = () => {
      const now = new Date();
      const sessionDate = new Date(nearestSession.date);
      if (nearestSession.time) {
        const [h, m] = nearestSession.time.split(':').map(Number);
        sessionDate.setHours(h || 0, m || 0, 0, 0);
      }
      const diff = sessionDate - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      });
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [nearestSession]);

  const formatRelTime = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const sessionDateObj = nearestSession ? new Date(nearestSession.date) : null;
  const sessionDateStr = sessionDateObj
    ? sessionDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';
  const totalMs = nearestSession ? (() => {
    const created = new Date(nearestSession.createdAt || Date.now());
    const sessionD = new Date(nearestSession.date);
    if (nearestSession.time) {
      const [h, m] = nearestSession.time.split(':').map(Number);
      sessionD.setHours(h || 0, m || 0, 0, 0);
    }
    return sessionD - created;
  })() : 1;
  const elapsedMs = nearestSession ? (() => {
    const created = new Date(nearestSession.createdAt || Date.now());
    return Date.now() - created;
  })() : 0;
  const progressPct = Math.min(Math.max((elapsedMs / totalMs) * 100, 0), 100);

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm sticky top-6">
      {/* Recent Activity */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" /> Recent Activity
        </h3>
        <button
          onClick={onToggle}
          title="Hide Activity Panel"
          aria-label="Hide Activity Panel"
          className="p-2 rounded-full bg-white border border-gray-100 text-[#0B1120] shadow-sm hover:scale-110 hover:shadow-md hover:border-gray-200 active:scale-95 transition-all duration-200 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          notifications.map((n) => {
            const Icon = notifIcons[n.type] || Bell;
            return (
              <div key={n._id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{n.message || n.title}</p>
                  <p className="text-xs text-gray-500">{formatRelTime(n.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-purple-200/50 to-transparent my-5" />

      {/* Upcoming Deadline */}
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" /> Upcoming Deadline
      </h3>
      {!nearestSession ? (
        <p className="text-sm text-gray-500 text-center py-4">No upcoming sessions</p>
      ) : (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100/60">
            <p className="text-xs font-bold text-blue-700 mb-1.5">Next Session</p>
            <p className="text-sm font-bold text-gray-900 mb-0.5">{nearestSession.title}</p>
            <p className="text-xs text-gray-500 mb-1">
              {(nearestSession.alumni?.name || nearestSession.alumniId?.name || 'Mentor')}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3 h-3" /> {sessionDateStr}
              {nearestSession.time && <span className="text-gray-300">|</span>}
              {nearestSession.time && <Clock className="w-3 h-3" />}
              {nearestSession.time && <span>{nearestSession.time}</span>}
            </div>
          </div>

          {/* Countdown */}
          {(timeLeft.days > 0 || timeLeft.hours > 0) && (
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                <span className="text-blue-600 text-lg font-bold">{timeLeft.days}</span> Days{' '}
                <span className="text-blue-600 text-lg font-bold">{timeLeft.hours}</span> Hours Left
              </p>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - progressPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;