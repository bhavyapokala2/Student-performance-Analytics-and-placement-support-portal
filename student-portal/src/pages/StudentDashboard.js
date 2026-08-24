import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const StudentDashboard = () => {
    const [data, setData] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [eligibleJobs, setEligibleJobs] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user?.user_id) {
            // 1. Fetch Analytics & Attendance (FR1.1, FR1.2)
            axios.get(`http://localhost:5000/api/student/dashboard-v3/${user.user_id}`)
                .then(res => setData(res.data))
                .catch(err => console.error("Dashboard Fetch Error:", err));
            
            // 2. Fetch Study Materials (FR1.4)
            axios.get(`http://localhost:5000/api/study-materials`)
                .then(res => setMaterials(res.data))
                .catch(err => console.error("Materials Fetch Error:", err));

            // 3. Fetch Placement Eligibility (FR1.5)
            axios.get(`http://localhost:5000/api/student/placements/${user.user_id}`)
                .then(res => setEligibleJobs(res.data))
                .catch(err => console.error("Placement Fetch Error:", err));
        }
    }, [user?.user_id]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Deduplicate attendance subjects for the table
    const uniqueAttendance = data.reduce((acc, current) => {
        if (current.subject && !acc.find(item => item.subject === current.subject)) {
            acc.push(current);
        }
        return acc;
    }, []);

    return (
        <div className="login-page" style={{ display: 'block', overflowY: 'auto' }}>
            <button onClick={handleLogout} className="login-btn" style={{ position: 'fixed', top: '20px', right: '20px', width: '120px', background: '#ff4b2b', zIndex: 1000 }}>
                LOGOUT
            </button>

            <div className="login-wrapper">
                <header className="portal-header">
                    <h1 className="main-heading">HII {user?.name?.toUpperCase()}!</h1>
                </header>

                {/* --- PLACEMENT NOTIFICATIONS SECTION --- */}
                <div className="glass-card" style={{ marginBottom: '30px', width: '90%' }}>
                    <h2 className="main-heading" style={{ fontSize: '20px' }}>ELIGIBLE PLACEMENT DRIVES</h2>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                        {eligibleJobs.length > 0 ? (
                            eligibleJobs.map((job, index) => (
                                <div key={index} style={badgeStyle}>
                                    {job.company.toUpperCase()} (Min: {job.eligibility_cgpa} CGPA)
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No eligible drives found for your current CGPA.</p>
                        )}
                    </div>
                </div>

                {/* --- ATTENDANCE REPORT --- */}
                <div className="glass-card" style={{ width: '90%', marginBottom: '30px' }}>
                    <h2 className="main-heading">ATTENDANCE REPORT</h2>
                    <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                <th style={{ padding: '15px', textAlign: 'left' }}>SUBJECT</th>
                                <th>PERCENTAGE (%)</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueAttendance.length > 0 ? uniqueAttendance.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{row.subject?.toUpperCase()}</td>
                                    <td style={{ textAlign: 'center' }}>{row.attendance_percentage}%</td>
                                    <td style={{ textAlign: 'center', color: row.attendance_percentage < 75 ? '#ff4b2b' : '#2ecc71', fontWeight: 'bold' }}>
                                        {row.attendance_percentage < 75 ? "⚠️ NEED TO IMPROVE " : "✅ SECURE"}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>NO ATTENDANCE DATA FOUND</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- ACTION TILES --- */}
                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '50px' }}>
                    
                    {/* WRITE MOCK TEST TILE */}
                    <div className="action-card" onClick={() => navigate('/mock-tests')} style={tileStyle}>
                        <h3 className="main-heading" style={{ fontSize: '18px', color: '#000000' }}>WRITE MOCK TEST</h3>
                        <p style={{ fontSize: '12px', color: '#000000' }}>Attempt subject-wise quizzes</p>
                    </div>

                    {/* STUDY MATERIALS TILE */}
                    <div className="action-card" style={tileStyle}>
                        <h3 className="main-heading" style={{ fontSize: '18px', color: '#000000' }}>STUDY MATERIALS</h3>
                        <div style={{ marginTop: '10px', textAlign: 'left', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                            {materials.length > 0 ? (
                                materials.map((m, i) => (
                                    <div key={i} style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                        <strong style={{ color: '#000000', fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                                            {m.subject.toUpperCase()}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '20px', paddingLeft: '5px' }}>
                                            <a href={m.link} target="_blank" rel="noopener noreferrer" style={{ ...materialLinkStyle, color: '#000000', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                🔗 <span style={{ textDecoration: 'underline' }}>Notes</span>
                                            </a>
                                            <a href={m.youtube} target="_blank" rel="noopener noreferrer" style={{ ...materialLinkStyle, color: '#000000', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                📺 <span style={{ textDecoration: 'underline' }}>Video</span>
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading materials...</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Styles
const badgeStyle = { background: '#00d2ff', color: 'black', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold' };
const tileStyle = { background: 'rgba(255,255,255,1)', padding: '25px', borderRadius: '20px', cursor: 'pointer', width: '320px', textAlign: 'center' };
const materialLinkStyle = { display: 'block', color: '#000000', textDecoration: 'none', fontSize: '14px', fontWeight: '500' };

export default StudentDashboard;
