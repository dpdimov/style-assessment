# Database Setup Instructions

## Setting up Neon Postgres Database

### 1. Create Neon Project
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up/Sign in with your GitHub account
3. Create a new project
4. Choose a name for your project (e.g., "style-assessment")

### 2. Get Database Connection String
1. In your Neon dashboard, go to "Connection Details"
2. Copy the connection string that looks like:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

### 3. Set up Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:

```
POSTGRES_URL=your_neon_connection_string_here
POSTGRES_PRISMA_URL=your_neon_connection_string_here
POSTGRES_URL_NON_POOLING=your_neon_connection_string_here
POSTGRES_USER=your_username
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database_name
```

### 4. Create Database Schema
1. In your Neon SQL Editor, run the SQL from `lib/database.sql`:

```sql
-- Copy and paste the contents of lib/database.sql here
```

### 5. Install Dependencies
Make sure you have the required dependency installed:

```bash
npm install @vercel/postgres
```

### 6. Test the Connection
After setting up the environment variables and deploying to Vercel, the database connection will be automatically available.

## Database Schema

### Tables

#### `assessment_results`
- `id` (Serial Primary Key)
- `x_coordinate` (Decimal) - X axis result (-1 to 1)
- `y_coordinate` (Decimal) - Y axis result (-1 to 1)  
- `custom_code` (VARCHAR) - Custom group code for result grouping
- `email_domain` (VARCHAR) - Email domain for organization analytics
- `user_agent` (TEXT) - Browser/device information
- `ip_address` (INET) - Client IP address
- `style_name` (VARCHAR) - Determined style name
- `completed_at` (TIMESTAMP) - When assessment was completed
- `created_at` (TIMESTAMP) - When record was created

### Views

#### `assessment_analytics`
Provides summary statistics grouped by custom_code and email_domain:
- Total assessments
- Average coordinates
- Date range of assessments

## Usage Examples

### Query Results by Custom Code
```sql
SELECT * FROM assessment_results 
WHERE custom_code = 'COMPANY2024'
ORDER BY completed_at DESC;
```

### Get Analytics Summary
```sql
SELECT * FROM assessment_analytics 
WHERE custom_code = 'COMPANY2024';
```

### Export Results for Analysis
```sql
SELECT 
  custom_code,
  email_domain,
  x_coordinate,
  y_coordinate,
  style_name,
  completed_at
FROM assessment_results
WHERE completed_at >= '2024-01-01'
ORDER BY completed_at DESC;
```

## Security Notes

- Email domains are stored (not full email addresses)
- IP addresses are collected for analytics but can be anonymized
- No personally identifiable information is stored beyond what users voluntarily provide
- Custom codes should be treated as potentially sensitive grouping information