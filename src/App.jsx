import React from 'react';
import './App.css';
import LoginPage from './page/login/login.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Example future page */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Trang này là placeholder để bạn phát triển sau.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 - Page Not Found</h2>
      <p>Đường dẫn không tồn tại.</p>
    </div>
  );
}

export default App
