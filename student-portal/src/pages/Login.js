import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [loginType, setLoginType] = useState('STUDENT'); // Matches your toggle logic
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend must be running on port 5000
            const res = await axios.post('http://localhost:5000/api/login', { 
                email: email.trim(), 
                password: password.trim() 
            });
            
            const user = res.data;
            const userRole = user.role.toUpperCase();

            // Validate Role Mismatch
            if (loginType === 'STAFF' && (userRole === 'FACULTY' || userRole === 'ADMIN')) {
                localStorage.setItem('user', JSON.stringify(user));
                navigate(userRole === 'ADMIN' ? '/admin-dashboard' : '/faculty-dashboard');
            } else if (loginType === 'STUDENT' && userRole === 'STUDENT') {
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/student-dashboard');
            } else {
                alert(`ACCESS DENIED: ROLE MISMATCH. YOU ARE A ${userRole}`);
            }
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            alert("LOGIN FAILED: ENSURE BACKEND IS RUNNING ON PORT 5000.");
        }
    };

    return (
        <div className="login-page" style={{ flexDirection: 'column', gap: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            
            {/* 1. Portal Title */}
<h1 className="main-heading" style={{ fontSize: '28px', textAlign: 'center', marginBottom: '10px' }}>
                STUDENT PERFORMANCE ANALYTICS AND PLACEMENT SUPPORT PORTAL
            </h1>

            <div className="glass-card">
                {/* 2. Login Type Toggle */}
                <div className="tab-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <button 
                        className={loginType === 'STAFF' ? 'tab active staff' : 'tab'} 
                        onClick={() => setLoginType('STAFF')}
                    >
                        STAFF LOGIN
                    </button>
                    <button 
                        className={loginType === 'STUDENT' ? 'tab active student' : 'tab'} 
                        onClick={() => setLoginType('STUDENT')}
                    >
                        STUDENT LOGIN
                    </button>
                </div>

                {/* 3. Login Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="email" 
                        placeholder="EMAIL ID" 
                        className="standard-text"
                        value={email}
                        // Forces lowercase for logic but allows normal typing
                        onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                        style={{ textTransform: 'none' }} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="PASSWORD" 
                        className="standard-text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="login-btn">
                        LOGIN AS {loginType}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;