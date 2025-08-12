import { sql } from '@vercel/postgres';

export interface AssessmentResultRecord {
  id?: number;
  x_coordinate: number;
  y_coordinate: number;
  custom_code?: string;
  email_domain?: string;
  user_agent?: string;
  ip_address?: string;
  style_name?: string;
  completed_at?: Date;
  created_at?: Date;
}

export class DatabaseService {
  /**
   * Save assessment result to database
   */
  static async saveAssessmentResult(data: AssessmentResultRecord): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const result = await sql`
        INSERT INTO assessment_results (
          x_coordinate, 
          y_coordinate, 
          custom_code, 
          email_domain, 
          user_agent, 
          ip_address, 
          style_name,
          completed_at
        )
        VALUES (
          ${data.x_coordinate}, 
          ${data.y_coordinate}, 
          ${data.custom_code || null}, 
          ${data.email_domain || null}, 
          ${data.user_agent || null}, 
          ${data.ip_address || null}, 
          ${data.style_name || null},
          ${(data.completed_at || new Date()).toISOString()}
        )
        RETURNING id
      `;

      const insertedId = result.rows[0]?.id;
      return { success: true, id: insertedId };

    } catch (error) {
      console.error('Database error saving assessment result:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }

  /**
   * Get assessment results by custom code for analytics
   */
  static async getResultsByCustomCode(customCode: string): Promise<AssessmentResultRecord[]> {
    try {
      const result = await sql`
        SELECT * FROM assessment_results 
        WHERE custom_code = ${customCode}
        ORDER BY completed_at DESC
      `;
      
      return result.rows as AssessmentResultRecord[];
    } catch (error) {
      console.error('Database error fetching results:', error);
      return [];
    }
  }

  /**
   * Get analytics summary by custom code
   */
  static async getAnalyticsByCustomCode(customCode: string) {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total_assessments,
          AVG(x_coordinate) as avg_x,
          AVG(y_coordinate) as avg_y,
          MIN(completed_at) as first_assessment,
          MAX(completed_at) as last_assessment
        FROM assessment_results 
        WHERE custom_code = ${customCode}
      `;
      
      return result.rows[0];
    } catch (error) {
      console.error('Database error fetching analytics:', error);
      return null;
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await sql`SELECT 1 as test`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

/**
 * Helper function to extract email domain from email address
 */
export function extractEmailDomain(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Helper function to get client IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }
  
  return null;
}