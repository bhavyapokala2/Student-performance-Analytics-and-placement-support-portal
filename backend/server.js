const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (Promise-based) ---
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'student_analytics'
}).promise(); 

// --- TWILIO SETUP ---
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = new twilio(accountSid, authToken);
const twilioNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`; 

// Helper function to send WhatsApp messages
const sendWhatsApp = async (phone, message) => {
    try {
        await client.messages.create({
            from: twilioNumber,
            body: message,
            to: `whatsapp:${phone}`
        });
        console.log(`✅ Notification sent to ${phone}`);
    } catch (error) {
        console.error("❌ Twilio Error:", error.message);
    }
};

// --- 1. AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT user_id, name, role FROM users WHERE UPPER(TRIM(email)) = UPPER(TRIM(?)) AND password = ?";
    try {
        const [results] = await db.query(query, [email, password]);
        if (results.length > 0) res.json(results[0]);
        else res.status(401).json({ message: "INVALID CREDENTIALS" });
    } catch (err) { res.status(500).json(err); }
});

// --- 2. FACULTY: STUDENT DATA MANAGEMENT ---
app.get('/api/faculty/students/:branch', async (req, res) => {
    const query = `
        SELECT u.user_id, u.name, 
               IFNULL(cp.codechef_rating, 'N/A') as codechef_rating, 
               IFNULL(cp.leetcode_rating, 'N/A') as leetcode_rating,
               IFNULL(MAX(a.attended_classes), 0) as attended_classes, 
               IFNULL(MAX(a.total_classes), 0) as total_classes, 
               IFNULL(MAX(a.attendance_percentage), 0) as attendance_percentage,
               IFNULL(MAX(m.marks), 0) as marks
        FROM users u
        JOIN students s ON u.user_id = s.student_id
        LEFT JOIN coding_profiles cp ON u.user_id = cp.student_id
        LEFT JOIN attendance a ON u.user_id = a.student_id
        LEFT JOIN marks m ON u.user_id = m.student_id
        WHERE s.branch = ?
        GROUP BY u.user_id, u.name, cp.codechef_rating, cp.leetcode_rating`;
    try {
        const [result] = await db.query(query, [req.params.branch]);
        res.json(result);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/faculty/submit-data', async (req, res) => {
    const { student_id, attended, total, percentage, marks, subject } = req.body;
    try {
        await db.query(`
            INSERT INTO attendance (student_id, subject, attended_classes, total_classes, attendance_percentage)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                attended_classes = VALUES(attended_classes), 
                total_classes = VALUES(total_classes), 
                attendance_percentage = VALUES(attendance_percentage)`, 
            [student_id, subject, attended, total, percentage]);

        await db.query(`
            INSERT INTO marks (student_id, subject, marks) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE marks = VALUES(marks)`, 
            [student_id, subject, marks]);

        if (parseFloat(percentage) < 75) {
            const [rows] = await db.query("SELECT phone, name FROM users WHERE user_id = ?", [student_id]);
            if (rows.length > 0 && rows[0].phone) {
                const message = `⚠️ Attendance Alert: Hello ${rows[0].name}, your attendance in ${subject} is ${percentage}%. Please attend classes regularly.`;
                await sendWhatsApp(rows[0].phone, message);
            }
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Database error" }); }
});

// --- 3. PLACEMENTS ---
app.post('/api/faculty/post-placement', async (req, res) => {
    const { company, eligibility_cgpa, posted_by, role } = req.body;
    const userRole = role ? role.toUpperCase() : "";
    
    if (userRole !== 'FACULTY' && userRole !== 'ADMIN') {
        return res.status(403).json({ message: "FORBIDDEN: Unauthorized Role" });
    }

    try {
        await db.query("INSERT INTO placements (company, eligibility_cgpa, posted_by) VALUES (?, ?, ?)", [company, eligibility_cgpa, posted_by]);
        const [eligible] = await db.query(
            "SELECT u.phone, u.name FROM students s JOIN users u ON s.student_id = u.user_id WHERE s.cgpa >= ?", 
            [eligibility_cgpa]
        );

        eligible.forEach(async (student) => {
            if (student.phone) {
                const msg = `🎓 New Drive Alert! Dear ${student.name}, you are eligible for the ${company} placement drive (Min CGPA: ${eligibility_cgpa}). Check your portal!`;
                await sendWhatsApp(student.phone, msg);
            }
        });
        res.json({ success: true, message: "Drive posted and students notified!" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "This drive has already been posted." });
        res.status(500).json({ error: "Failed to post drive" });
    }
});

// --- 4. ADMIN MANAGEMENT ---
app.post('/api/admin/create-user', async (req, res) => {
    const { name, email, password, role, roll_no, branch } = req.body;
    try {
        const [userResult] = await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
        const userId = userResult.insertId;
        if (role === 'student') {
            await db.query("INSERT INTO students (student_id, roll_no, branch, year, cgpa) VALUES (?, ?, ?, 1, 0)", [userId, roll_no, branch]);
        }
        res.json({ success: true, message: "User Created" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') res.status(400).json({ message: "ERROR: EMAIL MAY ALREADY EXIST." });
        else res.status(500).json({ error: "Registration failed" });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.query("SELECT user_id, name, email, role, phone FROM users ORDER BY user_id DESC");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.delete('/api/admin/delete-user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query("DELETE FROM students WHERE student_id = ?", [userId]);
        await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// --- 5. STUDENT DASHBOARD & ASSESSMENT ---
app.get('/api/student/dashboard-v3/:id', async (req, res) => {
    const query = `SELECT u.name, IFNULL(a.subject, 'General') as subject, IFNULL(a.attendance_percentage, 0) as attendance_percentage, IFNULL(m.marks, 0) as marks FROM users u LEFT JOIN attendance a ON u.user_id = a.student_id LEFT JOIN marks m ON u.user_id = m.student_id AND (m.subject = a.subject OR a.subject IS NULL) WHERE u.user_id = ?`;
    try {
        const [results] = await db.query(query, [req.params.id]);
        res.json(results);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/student/placements/:id', async (req, res) => {
    try {
        const [studentData] = await db.query("SELECT cgpa FROM students WHERE student_id = ?", [req.params.id]);
        if (studentData.length === 0 || studentData[0].cgpa === null) return res.json([]); 
        const [eligible] = await db.query("SELECT company, eligibility_cgpa FROM placements WHERE eligibility_cgpa <= ?", [studentData[0].cgpa]);
        res.json(eligible);
    } catch (err) { res.status(500).json({ error: "Failed to fetch drives" }); }
});

app.get('/api/questions/:subject', async (req, res) => {
    const query = "SELECT * FROM mock_tests WHERE UPPER(category) = UPPER(?) ORDER BY RAND() LIMIT 10";
    try {
        const [results] = await db.query(query, [req.params.subject]);
        res.json(results);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/study-materials', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM study_materials");
        res.json(results);
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SYSTEM RUNNING ON PORT ${PORT}`));