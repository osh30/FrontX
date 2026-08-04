import { useAuth } from '../../context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import LoadingScreen from '../LoadingScreen';

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }



  // Role-based dashboard rendering
  if (user.role === 'student') {
    return <StudentDashboard user={user} />;
  }

  if (user.role === 'alumni') {
    return <AlumniDashboard user={user} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  if (user.role === 'recruiter') {
    return <RecruiterDashboard user={user} />;
  }

  return <StudentDashboard user={user} />;
};

export default DashboardRouter;