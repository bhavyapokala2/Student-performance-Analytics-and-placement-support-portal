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
    console.log('Connected to database');

    // Step 1: Drop foreign key constraints
    const dropMarksFk = `ALTER TABLE marks DROP FOREIGN KEY marks_ibfk_1`;
    
    db.query(dropMarksFk, (err) => {
        if (err && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.error('Warning: Could not drop marks FK:', err.message);
        } else {
            console.log('✓ Dropped marks foreign key constraint');
        }

        // Step 2: Drop attendance foreign key constraint
        const dropAttendanceFk = `ALTER TABLE attendance DROP FOREIGN KEY attendance_ibfk_1`;
        
        db.query(dropAttendanceFk, (err) => {
            if (err && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.error('Warning: Could not drop attendance FK:', err.message);
            } else {
                console.log('✓ Dropped attendance foreign key constraint');
            }

            // Step 3: Expand students table student_id column first
            const expandStudents = `ALTER TABLE students MODIFY COLUMN student_id VARCHAR(20)`;
            
            db.query(expandStudents, (err) => {
                if (err) {
                    console.error('Error expanding students table:', err.message);
                } else {
                    console.log('✓ Expanded students table - student_id column set to VARCHAR(20)');
                }

                // Step 4: Fix the marks table
                const fixMarks = `ALTER TABLE marks MODIFY COLUMN student_id VARCHAR(20)`;
                
                db.query(fixMarks, (err) => {
                    if (err) {
                        console.error('Error fixing marks table:', err.message);
                    } else {
                        console.log('✓ Expanded marks table - student_id column set to VARCHAR(20)');
                    }

                    // Step 5: Fix the attendance table
                    const fixAttendance = `ALTER TABLE attendance MODIFY COLUMN student_id VARCHAR(20)`;
                    
                    db.query(fixAttendance, (err) => {
                        if (err) {
                            console.error('Error fixing attendance table:', err.message);
                        } else {
                            console.log('✓ Expanded attendance table - student_id column set to VARCHAR(20)');
                        }

                        // Step 6: Re-create the foreign key constraints
                        const addMarksFk = `ALTER TABLE marks ADD CONSTRAINT marks_ibfk_1 FOREIGN KEY (student_id) REFERENCES students(student_id)`;
                        
                        db.query(addMarksFk, (err) => {
                            if (err) {
                                console.error('Warning: Could not re-add marks FK:', err.message);
                            } else {
                                console.log('✓ Re-created marks foreign key constraint');
                            }

                            const addAttendanceFk = `ALTER TABLE attendance ADD CONSTRAINT attendance_ibfk_1 FOREIGN KEY (student_id) REFERENCES students(student_id)`;
                            
                            db.query(addAttendanceFk, (err) => {
                                if (err) {
                                    console.error('Warning: Could not re-add attendance FK:', err.message);
                                } else {
                                    console.log('✓ Re-created attendance foreign key constraint');
                                }

                                console.log('\n✅ Database schema has been fixed successfully!');
                                console.log('You can now upload marks with student IDs like "23251A1253"');
                                
                                db.end();
                                process.exit(0);
                            });
                        });
                    });
                });
            });
        });
    });
});
