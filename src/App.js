import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Opportunities from './pages/Opportunities';
import Notices from './pages/Notices';
import Notifications from './pages/Notifications';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="notices" element={<Notices />} />
          </Route>

          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route
            path="/notifications"
            element={
              <PrivateRoute allowedRoles={['student', 'company']}>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/student"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <MainLayout>
                  <StudentDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/company"
            element={
              <PrivateRoute allowedRoles={['company']}>
                <MainLayout>
                  <CompanyDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;