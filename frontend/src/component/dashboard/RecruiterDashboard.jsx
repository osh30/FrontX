import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';
import axios from 'axios';
import RecruiterSidebar from './recruiter/RecruiterSidebar';
import RecruiterHome from './recruiter/RecruiterHome';
import CompanyProfile from './recruiter/CompanyProfile';
import PostOpportunity from './recruiter/PostOpportunity';
import MyOpportunityRequests from './recruiter/MyOpportunityRequests';
import ManageOpportunities from './recruiter/ManageOpportunities';
import Applicants from './recruiter/Applicants';
import Interviews from './recruiter/Interviews';
import RecruiterAnalytics from './recruiter/RecruiterAnalytics';
import RecruiterNotifications from './recruiter/RecruiterNotifications';
import RecruiterSettings from './recruiter/RecruiterSettings';
import RecruiterProfile from './recruiter/RecruiterProfile';
import RecruiterCompanyReviews from './RecruiterCompanyReviews';

const RecruiterDashboard = ({ user }) => {
  const { loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);

  const pathTab = location.pathname.split('/dashboard/')[1];
  const validTabs = [
    'dashboard', 'company-profile', 'post-opportunity', 'my-opportunity-requests', 'manage-opportunities',
    'applicants', 'interviews', 'analytics',
    'notifications', 'settings', 'profile', 'company-reviews'
  ];
  const [activeTab, setActiveTab] = useState(validTabs.includes(pathTab) ? pathTab : 'dashboard');

  const API_URL = API_BASE;

  const fetchNotifCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/recruiter/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter: 'unread', limit: 1 }
      });
      setNotifUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathTab && validTabs.includes(pathTab)) {
      setActiveTab(pathTab);
    }
  }, [pathTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RecruiterHome user={user} />;
      case 'company-profile':
        return <CompanyProfile user={user} />;
      case 'post-opportunity':
        return <PostOpportunity />;
      case 'my-opportunity-requests':
        return <MyOpportunityRequests />;
      case 'manage-opportunities':
        return <ManageOpportunities />;
      case 'applicants':
        return <Applicants />;
      case 'interviews':
        return <Interviews />;
      case 'analytics':
        return <RecruiterAnalytics />;
      case 'notifications':
        return <RecruiterNotifications />;
      case 'settings':
        return <RecruiterSettings />;
      case 'profile':
        return <RecruiterProfile user={user} />;
      case 'company-reviews':
        return <RecruiterCompanyReviews />;
      default:
        return <RecruiterHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <RecruiterSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main content area - offset by sidebar width */}
      <div className="lg:pl-[264px] transition-all duration-300">
        {/* Top bar */}
        <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
            <h2 className="text-sm font-bold text-gray-900 capitalize hidden lg:block">
              {activeTab.replace(/-/g, ' ')}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block">{user?.companyName || 'Recruiter'}</span>
              <button onClick={() => handleTabChange('notifications')}
                className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                {notifUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[9px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white shadow-[0_2px_6px_rgba(239,68,68,0.4)]">
                    {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'R'}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
