import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MarkAttendance from './pages/attendance/MarkAttendance';
import DefaultersPage from './pages/attendance/DefaultersPage';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import StudentsPage from './pages/management/StudentsPage';
import FacultyPage from './pages/management/FacultyPage';
import SubjectsPage from './pages/management/SubjectsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  // Read verified user session from storage; defaults strictly to null (Logged Out)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('attendease_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('attendease_auth_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Session save error:', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('attendease_auth_user');
    } catch (e) {
      console.error('Session clear error:', e);
    }
  };

  // STRICT ACCESS LOCK: If user is not authenticated, platform is completely locked
  // Direct access to any platform route without logging in redirects straight to /login
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          {/* Every single path without login redirects strictly to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // AUTHENTICATED PLATFORM: Accessible only after valid login
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Render Sidebar with logged-in user role context */}
        <Sidebar user={user} />

        <div className="main-content">
          <Navbar user={user} onLogout={handleLogout} />

          <main className="page-wrapper">
            <Routes>
              {/* If logged in, visiting /login redirects to dashboard */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />

              {/* Core Platform Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />

              {/* Core Attendance */}
              <Route path="/attendance/mark" element={<MarkAttendance user={user} />} />
              <Route path="/attendance/defaulters" element={<DefaultersPage />} />
              <Route path="/attendance/history" element={<AttendanceHistory />} />

              {/* Academic Directory & Management */}
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/faculty" element={<FacultyPage user={user} />} />
              <Route path="/subjects" element={<SubjectsPage user={user} />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* Catch-all route redirects to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
