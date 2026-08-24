const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// 2. Twilio Setup (For WhatsApp alerts)
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// --- AUTHENTICATION ROUTES ---

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT user_id, name, role FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) res.json(results[0]);
        else res.status(401).json({ message: "Invalid credentials" });
    });
});

// Sign-Up API (Role-based)
app.post('/api/signup', (req, res) => {
    const { name, email, password, role, roll_no, branch, year } = req.body;
    const userSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    
    db.query(userSql, [name, email, password, role], (err, result) => {
        if (err) return res.status(500).json({ error: "Email already exists" });
        const userId = result.insertId;

        if (role === 'student') {
            const studentSql = "INSERT INTO students (student_id, roll_no, branch, year, cgpa) VALUES (?, ?, ?, ?, 0)";
            db.query(studentSql, [userId, roll_no, branch, year], (err2) => {
                if (err2) return res.status(500).json(err2);
                res.json({ message: "Student registered!" });
            });
        } else {
            res.json({ message: "User registered!" });
        }
    });
});

// --- FACULTY ROUTES ---

// Upload marks and attendance
app.post('/api/faculty/upload-data', (req, res) => {
    const { student_id, subject, marks, attendance } = req.body;
    const markSql = "INSERT INTO marks (student_id, subject, marks) VALUES (?, ?, ?)";
    const attSql = "INSERT INTO attendance (student_id, subject, attendance_percentage) VALUES (?, ?, ?)";
    
    db.query(markSql, [student_id, subject, marks], (err) => {
        if (err) return res.status(500).json(err);
        db.query(attSql, [student_id, subject, attendance], (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Academic data updated!" });
        });
    });
});

// --- ADMIN / TWILIO ROUTES ---

// Send WhatsApp Alert for low attendance
app.post('/api/admin/notify-risk', (req, res) => {
    const riskQuery = "SELECT u.name, a.attendance_percentage FROM users u JOIN attendance a ON u.user_id = a.student_id WHERE a.attendance_percentage < 75";
    db.query(riskQuery, (err, results) => {
        results.forEach(student => {
            client.messages.create({
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: 'whatsapp:+91your_number', // Replace with dynamic phone number later
                body: `⚠️ Warning ${student.name}: Your attendance is ${student.attendance_percentage}%. You are at risk!`
            });
        });
        res.json({ message: `Alerts sent to ${results.length} students` });
    });
});

// 3. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));