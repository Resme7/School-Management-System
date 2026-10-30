import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/userAuth';
import { homePath } from './auth/homePath';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { GradesPage } from './pages/shared/GradesPage';
import { MyReportPage } from './pages/student/MyReportPage';
import { LoginPage } from './pages/LoginPage';
import { StudentsPage } from './pages/admin/StudentPage';
import { TeachersPage } from './pages/admin/TeacherPage';
import { ClassDetailPage } from './pages/shared/ClassDetailPage';
import { ClassesPage } from './pages/shared/ClassesPage';
import { StudentDetailPage } from './pages/admin/StudentDetailPage';


function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<RootRedirect />} />

              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/:id" element={<StudentDetailPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['ADMIN', 'TEACHER']} />}>
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/classes/:id" element={<ClassDetailPage />} />
                <Route path="/grades" element={<GradesPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['STUDENT']} />}>
                <Route path="/me" element={<MyReportPage />} /> 
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}