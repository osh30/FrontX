import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const dashboardMap = { student: '/dashboard/student', alumni: '/dashboard/alumni', recruiter: '/dashboard/recruiter' };
    return <Navigate to={dashboardMap[user.role] || '/dashboard/student'} />;
  }

  return children;
};

export default PrivateRoute;