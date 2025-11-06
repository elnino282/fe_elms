import React from 'react';
import './App.css';
import LoginPage from './page/login/login.jsx';
import MyPage from './page/mypage/MyPage.jsx';
import ApprovalManagement from './page/approval_management/approval_management.jsx';
import Resignation from './page/resignation/Resignation.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/my-page" element={<MyPage />} />
      <Route path="/resignation" element={<Resignation />} />
      <Route path="/approval-management" element={<ApprovalManagement />} />
      {/* 404 fallback to login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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
