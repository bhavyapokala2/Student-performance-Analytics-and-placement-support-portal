import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const MockTestSelection = () => {
    const navigate = useNavigate();
    const categories = ['DSA', 'JAVA', 'PYTHON', 'OS'];

    return (
        <div className="login-page">
            <ul className="circles">
                <li></li><li></li><li></li><li></li><li></li>
            </ul>
            <div className="login-wrapper">
                <header className="portal-header">
                    <h1 className="main-heading">SELECT ASSESSMENT CATEGORY</h1>
                </header>
                <div className="glass-card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {categories.map((cat) => (
                            <button key={cat} className="login-btn" onClick={() => navigate(`/mock-test/${cat}`)} style={{ height: '100px' }}>{cat}</button>
                        ))}
                    </div>
                    <button onClick={() => navigate('/student-dashboard')} className="login-btn" style={{ marginTop: '30px', background: '#7f8c8d', color: 'white' }}>BACK TO DASHBOARD</button>
                </div>
            </div>
        </div>
    );
};

export default MockTestSelection;