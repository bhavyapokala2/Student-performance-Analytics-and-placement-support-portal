import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const MockTest = () => {
    const { subject } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(600); 
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true); 
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/api/questions/${subject}`)
            .then(res => {
                setQuestions(res.data); 
                setLoading(false); 
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setLoading(false);
            });
    }, [subject]);

    useEffect(() => {
        if (isFinished) return;
        if (timeLeft <= 0) { handleFinish(); return; }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished]);

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [currentIdx]: option });
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            const correct = q.correct_option || q.correct_ans;
            if (answers[idx] === correct) score++;
        });
        return score;
    };

    const handleFinish = () => {
        const score = calculateScore();
        axios.post('http://localhost:5000/api/student/submit-test', {
            student_id: user.user_id,
            subject: subject,
            marks: score
        })
        .then(() => setIsFinished(true))
        .catch(() => setIsFinished(true)); 
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // --- MOVE THIS BLOCK INSIDE THE COMPONENT ---
    if (isFinished) {
        const score = calculateScore();
        const totalQuestions = questions.length || 10;

        let feedbackMessage;
        if (score >= 8) {
            feedbackMessage = <p style={{ color: '#2ecc71' }}>🥳 Hurray, you did it! 🌟</p>;
        } else if (score >= 5) {
            feedbackMessage = <p style={{ color: '#f1c40f' }}>⚖️ Need to improve! 📈</p>;
        } else {
            feedbackMessage = <p style={{ color: '#ff4b2b' }}>💪 Work hard! ✍️</p>;
        }

        return (
            <div className="login-page">
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h1 className="main-heading">TEST COMPLETED</h1>
                    <h2 style={{ color: '#00d2ff', margin: '20px 0' }}>Score: {score} / {totalQuestions}</h2>
                    <div style={{ marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
                        {feedbackMessage}
                    </div>
                    <button className="login-btn" onClick={() => navigate('/student-dashboard')}>
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    const q = questions.length > 0 ? questions[currentIdx] : null;

    return (
        <div className="login-page">
            <div className="glass-card" style={{ width: '85%', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                    <h2 className="main-heading">{subject?.toUpperCase()} ASSESSMENT</h2>
                    <h2 style={{ color: timeLeft < 60 ? '#ff4b2b' : '#00d2ff' }}>⏱️ {formatTime(timeLeft)}</h2>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '50px', color: '#2c3e50' }}>Loading questions...</p>
                ) : q ? (
                    <div style={{ marginTop: '20px', textAlign: 'left' }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
                            Q{currentIdx + 1}: {q.question_text || q.question}
                        </h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {['a', 'b', 'c', 'd'].map(opt => (
                                <button 
                                    key={opt}
                                    className="tab"
                                    style={{ 
                                        textAlign: 'left',
                                        padding: '15px',
                                        background: answers[currentIdx] === opt.toUpperCase() ? '#34495e' : '#f8f9fa',
                                        color: answers[currentIdx] === opt.toUpperCase() ? 'white' : '#2c3e50',
                                        border: '1px solid #dee2e6'
                                    }}
                                    onClick={() => handleOptionSelect(opt.toUpperCase())}
                                >
                                    <strong>{opt.toUpperCase()}:</strong> {q[`option_${opt}`] || q[opt]}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="login-btn" disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}>PREVIOUS</button>
                            {currentIdx === questions.length - 1 ? (
                                <button className="login-btn" style={{ background: '#2ecc71' }} onClick={handleFinish}>FINISH TEST</button>
                            ) : (
                                <button className="login-btn" onClick={() => setCurrentIdx(prev => prev + 1)}>NEXT</button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <p style={{ color: '#2c3e50' }}>No questions found for {subject}.</p>
                        <button className="login-btn" onClick={() => navigate('/student-dashboard')}>GO BACK</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockTest;