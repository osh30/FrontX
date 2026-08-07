import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './component/PrivateRoute';
import AdminRoute from './component/AdminRoute';
import StudentRoute from './component/StudentRoute';
import AlumniRoute from './component/AlumniRoute';
import RecruiterRoute from './component/RecruiterRoute';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import CareerOpportunitiesPage from './pages/CareerOpportunitiesPage';
import CollaborationTopicsPage from './pages/CollaborationTopicsPage';
import CreateCommunityPostPage from './pages/CreateCommunityPostPage';
import UploadResourcePage from './pages/UploadResourcePage';
import AlumniCreateResourcePage from './pages/AlumniCreateResourcePage';
import AISkillAnalysisPage from './component/dashboard/AISkillAnalysisPage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateResearchTopicPage from './pages/CreateResearchTopicPage';
import ResearchDetailsPage from './pages/ResearchDetailsPage';
import ApplyForResearchPage from './pages/ApplyForResearchPage';
import ReviewApplicationsPage from './pages/ReviewApplicationsPage';
import GlobalMeetingOverlay from './meeting/meeting/GlobalMeetingOverlay';
import { UserCheck, Microscope, Briefcase, BookOpen, Users, Handshake } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import SplashScreen from './component/SplashScreen';
import LandingPage from './pages/Landing/LandingPage';
import Register from './pages/Register';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import HelpCenterPage from './pages/HelpCenterPage';
import DonatePage from './pages/DonatePage';
import AdminLayout from './component/dashboard/AdminLayout';
import AdminDashboard from './component/dashboard/AdminDashboard';
import AdminCommunity from './component/dashboard/AdminCommunity';
import AdminUsers from './component/dashboard/AdminUsers';
import AdminBlogs from './component/dashboard/AdminBlogs';
import AdminBlogEditor from './component/dashboard/AdminBlogEditor';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import AdminResources from './component/dashboard/AdminResources';
import AdminCreateResourcePage from './component/dashboard/AdminCreateResourcePage';
import AdminEditResourcePage from './component/dashboard/AdminEditResourcePage';
import AdminOpportunities from './component/dashboard/AdminOpportunities';
import AdminOpportunityCreate from './component/dashboard/AdminOpportunityCreate';
import AdminOpportunityRequests from './component/dashboard/AdminOpportunityRequests';
import AdminAnnouncements from './component/dashboard/AdminAnnouncements';
import AdminAnnouncementCreate from './component/dashboard/AdminAnnouncementCreate';
import AdminAnnouncementEdit from './component/dashboard/AdminAnnouncementEdit';
import AnnouncementsView from './component/dashboard/AnnouncementsView';
import AdminAnalytics from './component/dashboard/AdminAnalytics';
import AdminSettings from './component/dashboard/AdminSettings';
import AdminPlacementStatistics from './component/dashboard/AdminPlacementStatistics';
import AdminCompanyReviews from './component/dashboard/AdminCompanyReviews';
import Interviews from './component/dashboard/recruiter/Interviews';

const Jobs = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Jobs Page (Coming Soon)</div>;
const More = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">More (Coming Soon)</div>;

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <GlobalMeetingOverlay />
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      {splashDone && (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/more" element={<More />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/create-community-post" element={<PrivateRoute><CreateCommunityPostPage /></PrivateRoute>} />
        <Route path="/alumni/resources/upload" element={<PrivateRoute><UploadResourcePage /></PrivateRoute>} />
        <Route path="/alumni/resources/create" element={<PrivateRoute><AlumniCreateResourcePage /></PrivateRoute>} />
        {/* Dashboard Route - Protected */}
        <Route path="/dashboard/*" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/announcements" element={
          <PrivateRoute>
            <AnnouncementsView />
          </PrivateRoute>
        } />

        {/* Recruiter Interviews - Recruiter only */}
        <Route path="/recruiter/interviews" element={
          <RecruiterRoute>
            <Interviews />
          </RecruiterRoute>
        } />

        {/* Admin Dashboard - Admin only */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="community" element={<AdminCommunity />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blogs/create" element={<AdminBlogEditor />} />
          <Route path="blogs/edit/:id" element={<AdminBlogEditor />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="resources/create" element={<AdminCreateResourcePage />} />
          <Route path="resources/edit/:id" element={<AdminEditResourcePage />} />
          <Route path="opportunities" element={<AdminOpportunities />} />
          <Route path="opportunities/create" element={<AdminOpportunityCreate />} />
          <Route path="opportunity-requests" element={<AdminOpportunityRequests />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="announcements/create" element={<AdminAnnouncementCreate />} />
          <Route path="announcements/edit/:id" element={<AdminAnnouncementEdit />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="placement-statistics" element={<AdminPlacementStatistics />} />
          <Route path="review-moderation" element={<AdminCompanyReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/alumni/mentorship/create-session" element={
          <AlumniRoute>
            <CreateSessionPage />
          </AlumniRoute>
        } />
        <Route path="/alumni/collaboration/create-topic" element={
          <AlumniRoute>
            <CreateResearchTopicPage />
          </AlumniRoute>
        } />
        <Route path="/alumni/collaboration/:id/review" element={
          <AlumniRoute>
            <ReviewApplicationsPage />
          </AlumniRoute>
        } />
        <Route path="/dashboard/collaboration/:id" element={
          <PrivateRoute>
            <ResearchDetailsPage />
          </PrivateRoute>
        } />
        <Route path="/dashboard/collaboration/:id/apply" element={
          <PrivateRoute>
            <ApplyForResearchPage />
          </PrivateRoute>
        } />
      </Routes>
      )}
    </Router>
  );
}

export default App;