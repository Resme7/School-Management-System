import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from '../auth/userAuth';

const NAV_LINKS: Record<Role, { to: string; label: string }[]> = {
  ADMIN: [
    { to: '/students', label: 'Students' },
    { to: '/teachers', label: 'Teachers' },
    { to: '/classes', label: 'Classes' },
    { to: '/grades', label: 'Grades' },
  ],
  TEACHER: [
    { to: '/classes', label: 'My classes' },
    { to: '/grades', label: 'Grades' },
  ],
  STUDENT: [{ to: '/me', label: 'My profile & grades' }],
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="topbar">
        <strong>School Management</strong>
        <nav>
          {NAV_LINKS[user.role].map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <span>
            {user.email} ({user.role.toLowerCase()})
          </span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}