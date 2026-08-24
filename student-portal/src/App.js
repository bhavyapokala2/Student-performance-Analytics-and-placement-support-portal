import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; 
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MockTestSelection from './pages/MockTestSelection'; 
import MockTest from './pages/MockTest';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Authentication */}
        <Route path="/" element={<Login />} />
        
        {/* Role-Based Dashboards */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Assessment Routes */}
        <Route path="/mock-tests" element={<MockTestSelection />} />
        
        {/* FIXED: Single route using :subject to match useParams() in MockTest.js */}
        <Route path="/mock-test/:subject" element={<MockTest />} />
      </Routes>
    </Router>
  );
}

export default App;