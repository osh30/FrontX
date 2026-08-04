import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('[AdminRoute] loading:', loading, '| isAuthenticated:', isAuthenticated, '| user:', user?.role || user);

  if (loading) {
    return <LoadingScreen dark />;
  }

  if (!isAuthenticated) {
    console.log('[AdminRoute] NOT authenticated -> redirect to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  if (user && user.role !== 'admin') {
    console.log('[AdminRoute] role is', user.role, '-> redirect to dashboard');
    const dashboardMap = { student: '/dashboard/student', alumni: '/dashboard/alumni', recruiter: '/dashboard/recruiter' };
    return <Navigate to={dashboardMap[user.role] || '/dashboard/student'} replace />;
  }

  console.log('[AdminRoute] admin confirmed -> rendering children');
  return children;
};

export default AdminRoute;
