-- Neon Postgres schema for assessment results
-- Create this table in your Neon database console

CREATE TABLE assessment_results (
  id SERIAL PRIMARY KEY,
  x_coordinate DECIMAL(10, 8) NOT NULL,
  y_coordinate DECIMAL(10, 8) NOT NULL,
  custom_code VARCHAR(50),
  email_domain VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  style_name VARCHAR(100),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_custom_code ON assessment_results(custom_code);
CREATE INDEX idx_email_domain ON assessment_results(email_domain);
CREATE INDEX idx_completed_at ON assessment_results(completed_at);

-- Optional: Create a view for easy analytics
CREATE VIEW assessment_analytics AS
SELECT 
  custom_code,
  email_domain,
  COUNT(*) as total_assessments,
  AVG(x_coordinate) as avg_x,
  AVG(y_coordinate) as avg_y,
  MIN(completed_at) as first_assessment,
  MAX(completed_at) as last_assessment
FROM assessment_results
WHERE custom_code IS NOT NULL
GROUP BY custom_code, email_domain
ORDER BY total_assessments DESC;