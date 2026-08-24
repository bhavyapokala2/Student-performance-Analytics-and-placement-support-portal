-- Fix Database Schema for Student Portal
-- This script fixes the column size issues that prevent data from being saved

-- Expand student_id column in marks table to accommodate longer IDs like 23251A1253
ALTER TABLE marks MODIFY COLUMN student_id VARCHAR(20);

-- Expand student_id column in attendance table to accommodate longer IDs
ALTER TABLE attendance MODIFY COLUMN student_id VARCHAR(20);

