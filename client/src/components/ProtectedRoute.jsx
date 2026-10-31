import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // If not logged in, go to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, but don't have the right role, kick them out
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Send customers to home
  }

  // If they pass the checks, show the page
  return <Outlet />;
}