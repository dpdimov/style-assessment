-- Migration to add assessment_id field to existing assessment_results table
-- Run this SQL in your Neon database console if you have an existing table

-- Step 1: Add the assessment_id column with default value
ALTER TABLE assessment_results 
ADD COLUMN assessment_id VARCHAR(100) NOT NULL DEFAULT 'default';

-- Step 2: Add new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_id ON assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_custom ON assessment_results(assessment_id, custom_code);

-- Step 3: Drop the old analytics view
DROP VIEW IF EXISTS assessment_analytics;

-- Step 4: Recreate the analytics view with assessment_id
CREATE VIEW assessment_analytics AS
SELECT 
  assessment_id,
  custom_code,
  email_domain,
  COUNT(*) as total_assessments,
  AVG(x_coordinate) as avg_x,
  AVG(y_coordinate) as avg_y,
  MIN(completed_at) as first_assessment,
  MAX(completed_at) as last_assessment
FROM assessment_results
WHERE custom_code IS NOT NULL
GROUP BY assessment_id, custom_code, email_domain
ORDER BY total_assessments DESC;

-- Optional: Update existing records with specific assessment IDs if needed
-- UPDATE assessment_results SET assessment_id = 'leadership-v1' WHERE created_at < '2024-01-01';
-- UPDATE assessment_results SET assessment_id = 'personality-v2' WHERE custom_code LIKE 'PERS%';

-- Verify the migration
SELECT 
  assessment_id, 
  COUNT(*) as record_count,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM assessment_results 
GROUP BY assessment_id 
ORDER BY assessment_id;