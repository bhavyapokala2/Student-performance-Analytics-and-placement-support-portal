import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const AdminDashboard = () => {
    // 1. State Management
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: 'student', roll_no: '', branch: '' 
    });
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // 2. Fetch the user list from the backend
    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
        } catch (err) { 
            console.error("Error fetching users", err); 
        }
    };

    useEffect(() => { 
        fetchUsers(); 
    }, []);

    // 3. Create User Handler
    const handleCreate = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/admin/create-user', formData)
            .then(() => {
                alert("USER ACCOUNT CREATED SUCCESSFULLY!");
                setFormData({ name: '', email: '', password: '', role: 'student', roll_no: '', branch: '' });
                fetchUsers(); // Refresh the list automatically
            })
            .catch(() => alert("ERROR: EMAIL MAY ALREADY EXIST."));
    };

    // 4. Delete User Handler
    const handleDelete = (id, name) => {
        if (window.confirm(`ARE YOU SURE YOU WANT TO DELETE ${name.toUpperCase()}?`)) {
            axios.delete(`http://localhost:5000/api/admin/delete-user/${id}`)
                .then(() => {
                    alert("USER DELETED!");
                    fetchUsers(); // Refresh the list
                })
                .catch(() => alert("ERROR DELETING USER"));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // 5. Search Filtering
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="login-page" style={{ display: 'block', overflowY: 'auto', paddingBottom: '50px' }}>
            {/* Top Navigation */}
            <button onClick={handleLogout} className="logout-btn" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                LOGOUT
            </button>

            {/* Section 1: Registration Form */}
            <div className="login-wrapper">
                <div className="glass-card" style={{ maxWidth: '500px', margin: '40px auto' }}>
                    <h2 className="main-heading">ADMIN: USER REGISTRATION</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        <input type="text" className="standard-text" placeholder="FULL NAME" required 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <input type="email" className="standard-text" placeholder="EMAIL" required 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        
                        <input type="password" className="standard-text" placeholder="PASSWORD" required 
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ color: '#718096', fontWeight: 'bold' }}>ROLE:</label>
                            <select className="standard-text" style={{ flex: 1 }} 
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="student">STUDENT</option>
                                <option value="faculty">FACULTY</option>
                            </select>
                        </div>

                        {formData.role === 'student' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input type="text" className="standard-text" placeholder="ROLL NO" required 
                                    value={formData.roll_no} onChange={e => setFormData({...formData, roll_no: e.target.value})} />
                                <input type="text" className="standard-text" placeholder="BRANCH (e.g. CSE)" required 
                                    value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                            </div>
                        )}

                        <button type="submit" className="login-btn" style={{ background: '#ff8a80', marginTop: '10px' }}>
                            CREATE ACCOUNT
                        </button>
                    </form>
                </div>
            </div>

            {/* Section 2: User Management Table */}
            <div className="glass-card" style={{ maxWidth: '1000px', margin: '40px auto', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="main-heading" style={{ margin: 0, fontSize: '1.5rem' }}>MANAGE USERS</h3>
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="standard-text" 
                        style={{ width: '250px', margin: 0 }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7', color: '#4a5568' }}>
                                <th style={{ padding: '12px' }}>NAME</th>
                                <th style={{ padding: '12px' }}>EMAIL</th>
                                <th style={{ padding: '12px' }}>ROLE</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.user_id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{user.name}</td>
                                    <td style={{ padding: '12px' }}>{user.email}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '11px', 
                                            fontWeight: 'bold',
                                            background: user.role === 'faculty' ? '#fff5f5' : '#ebf8ff',
                                            color: user.role === 'faculty' ? '#c53030' : '#2b6cb0'
                                        }}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDelete(user.user_id, user.name)}
                                            style={{ background: 'none', border: 'none', color: '#ff4b2b', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;