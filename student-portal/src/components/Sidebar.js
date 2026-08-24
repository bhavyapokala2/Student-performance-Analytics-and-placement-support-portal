import React from 'react';
import { Link } from 'react-router-dom';
import { User, Upload, BarChart, BookOpen, LogOut } from 'lucide-react';

const Sidebar = ({ role }) => {
  return (
    <div className="sidebar" style={{ width: '250px', height: '100vh', background: '#2c3e50', color: 'white', padding: '20px' }}>
      <h2>Analytics Portal</h2>
      <hr />
      <nav>
        {role === 'student' && (
          <>
            <Link to="/student-dashboard"><BarChart /> Dashboard</Link>
            <Link to="/mock-tests"><BookOpen /> Take Mock Test</Link>
          </>
        )}
        {role === 'faculty' && (
          <>
            <Link to="/faculty-dashboard"><Upload /> Upload Data</Link>
            <Link to="/analytics"><BarChart /> Student Analysis</Link>
          </>
        )}
        {role === 'admin' && (
          <>
            <Link to="/admin-dashboard"><User /> User Mgmt</Link>
            <Link to="/system-control"><BarChart /> System Overview</Link>
          </>
        )}
        <button onClick={() => window.location.href='/'}><LogOut /> Logout</button>
      </nav>
    </div>
  );
};

export default Sidebar;