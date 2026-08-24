const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to database\n');

    // Check all columns and data in students table
    const query = "SELECT * FROM students LIMIT 10";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Students table contents:');
            console.log(results);
        }

        // Also check the schema
        const schemaQuery = "DESCRIBE students";
        db.query(schemaQuery, (err, schema) => {
            if (err) {
                console.error('Schema error:', err);
            } else {
                console.log('\n\nStudents table schema:');
                console.log(schema);
            }
            db.end();
            process.exit(0);
        });
    });
});
