import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventDetailPage from './pages/EventDetailPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiting-room"
          element={
            <ProtectedRoute>
              <WaitingRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Redirección automática de la raíz a /events */}
        <Route path="/" element={<Navigate to="/events" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
