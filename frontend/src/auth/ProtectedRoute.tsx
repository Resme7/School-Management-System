import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../api/types';
import { homePath } from './homePath';
import { useAuth } from './userAuth';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="status">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}
