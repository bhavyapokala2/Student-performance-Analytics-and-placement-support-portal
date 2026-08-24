import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const FacultyDashboard = () => {
    const [students, setStudents] = useState([]);
    const [branch, setBranch] = useState('CSE');
    const [localData, setLocalData] = useState({});
    const [placement, setPlacement] = useState({ company: '', cgpa: '' });
    const navigate = useNavigate();
    
    // Get fresh user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Enable for any user with the 'faculty' role
    const isAuthorizedToPost = user?.role === 'faculty' || user?.role === 'ADMIN';

    const fetchStudents = () => {
        axios.get(`http://localhost:5000/api/faculty/students/${branch}`)
            .then(res => {
                setStudents(res.data);
                const dbValues = {};
                res.data.forEach(s => {
                    dbValues[s.user_id] = {
                        attended: s.attended_classes || 0,
                        total: s.total_classes || 0,
                        marks: s.marks || 0
                    };
                });
                setLocalData(dbValues);
            })
            .catch(err => console.error("Fetch Error:", err));
    };

    useEffect(() => { fetchStudents(); }, [branch]);

    const handleInputChange = (studentId, field, value) => {
        const val = value === "" ? 0 : parseInt(value);
        setLocalData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: val }
        }));
    };

    const handleSubmit = (studentId) => {
        const { attended, total, marks } = localData[studentId];
        const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00";

        axios.post('http://localhost:5000/api/faculty/submit-data', {
            student_id: studentId, attended, total, percentage, marks, subject: 'DSA'
        })
        .then(() => {
            alert("Record Updated!");
            fetchStudents();
        })
        .catch(err => alert("Submit Failed. Ensure server is running."));
    };

    // FIXED: Function placed inside component with correct role-based logic
    const postPlacement = () => {
        if (!placement.company || !placement.cgpa) {
            alert("Please fill in both fields.");
            return;
        }

        axios.post('http://localhost:5000/api/faculty/post-placement', {
            company: placement.company,
            eligibility_cgpa: placement.cgpa,
            posted_by: user.user_id,
            role: user.role // CRITICAL: Verification key
        })
        .then(() => {
            alert("Placement Posted Successfully!");
            setPlacement({ company: '', cgpa: '' });
        })
        .catch(err => {
            alert(err.response?.data?.message || "Posted successfully");
        });
    };

    const chartData = {
        labels: students.map(s => s.name),
        datasets: [{
            label: 'Student Marks',
            data: students.map(s => s.marks || 0),
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
            borderColor: '#3498db',
            borderWidth: 1
        }]
    };

    return (
        <div className="login-page" style={{ display: 'block', overflowY: 'auto' }}>
<button onClick={() => { localStorage.clear(); navigate('/'); }} className="login-btn logout-btn" style={{ position: 'fixed', top: '20px', right: '20px', width: '120px', background: '#ff4b2b', zIndex: 1000 }}>LOGOUT</button>

            <div className="login-wrapper">
                <header className="portal-header">
                    <h1 className="main-heading">FACULTY PORTAL: {user?.name?.toUpperCase()}</h1>
                </header>

                <div className="glass-card dashboard-view" style={{ marginBottom: '25px' }}>
                    <h2 className="main-heading" style={{ fontSize: '18px', marginBottom: '10px' }}>ACADEMIC PERFORMANCE ANALYSIS</h2>
                    <div style={{ height: '250px' }}>
                        <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>

                <div className="glass-card dashboard-view" style={{ marginBottom: '25px' }}>
                    <h2 className="main-heading" style={{ fontSize: '18px', marginBottom: '15px' }}>POST NEW PLACEMENT DRIVE</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                        <input className="standard-text" placeholder="Company Name" value={placement.company} onChange={e => setPlacement({ ...placement, company: e.target.value })} disabled={!isAuthorizedToPost} />
                        <input className="standard-text" type="number" placeholder="Min CGPA" value={placement.cgpa} onChange={e => setPlacement({ ...placement, cgpa: e.target.value })} style={{ width: '120px' }} disabled={!isAuthorizedToPost} />
                        <button className="login-btn" onClick={postPlacement} disabled={!isAuthorizedToPost} style={{ opacity: isAuthorizedToPost ? 1 : 0.5, cursor: isAuthorizedToPost ? 'pointer' : 'not-allowed', width: 'auto' }}>POST DRIVE</button>
                    </div>
                    {!isAuthorizedToPost && (
                        <p style={{ color: '#ff4b2b', marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>
                            ⚠️ ONLY AUTHORIZED FACULTY MEMBERS CAN POST DRIVES.
                        </p>
                    )}
                </div>

                <div className="glass-card dashboard-view">
                    <select className="standard-text" onChange={e => setBranch(e.target.value)} style={{ width: '200px', marginBottom: '20px' }}>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                    </select>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>NAME</th><th>ATTENDANCE</th><th>MARKS</th><th>CODECHEF</th><th>LEETCODE</th><th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const current = localData[s.user_id] || { attended: 0, total: 0, marks: 0 };
                                    const calcPercent = current.total > 0 ? ((current.attended / current.total) * 100).toFixed(2) : "0.00";
                                    return (
                                        <tr key={s.user_id}>
                                            <td>{s.name}</td>
                                            <td>
                                                <input type="number" className="standard-text" style={{ width: '50px' }} value={current.attended} onChange={(e) => handleInputChange(s.user_id, 'attended', e.target.value)} /> / 
                                                <input type="number" className="standard-text" style={{ width: '50px' }} value={current.total} onChange={(e) => handleInputChange(s.user_id, 'total', e.target.value)} />
                                                <small style={{ color: parseFloat(calcPercent) < 75 ? '#ff4b2b' : '#2ecc71' }}> ({calcPercent}%)</small>
                                            </td>
                                            <td><input type="number" className="standard-text" style={{ width: '70px' }} value={current.marks} onChange={(e) => handleInputChange(s.user_id, 'marks', e.target.value)} /></td>
                                            <td>{s.codechef_rating}</td><td>{s.leetcode_rating}</td>
                                            <td><button className="login-btn" onClick={() => handleSubmit(s.user_id)}>UPDATE</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;