import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, getClientIP, extractEmailDomain } from '@/lib/database'
import { AssessmentScore } from '@/lib/scoringEngine'

interface AssessmentResult {
  questionId: string
  value: number
  percent: number
  question: number
}

interface SaveResultsRequest {
  results: AssessmentResult[]
  scores: AssessmentScore
  customCode?: string
  emailDomain?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveResultsRequest = await request.json()
    
    // Validate required data
    if (!body.scores || !body.scores.coordinates) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment scores provided' },
        { status: 400 }
      )
    }

    // Extract metadata from request
    const userAgent = request.headers.get('user-agent') || undefined
    const clientIP = getClientIP(request)
    
    // Process email domain if provided
    let processedEmailDomain = body.emailDomain
    if (processedEmailDomain && processedEmailDomain.includes('@')) {
      // Extract domain if full email was provided by mistake
      processedEmailDomain = extractEmailDomain(processedEmailDomain)
    }

    // Determine style name from coordinates (optional - could be enhanced)
    const styleName = determineStyleName(body.scores.coordinates)

    // Prepare database record
    const assessmentRecord = {
      x_coordinate: body.scores.coordinates.x,
      y_coordinate: body.scores.coordinates.y,
      custom_code: body.customCode || undefined,
      email_domain: processedEmailDomain || undefined,
      user_agent: userAgent,
      ip_address: clientIP || undefined,
      style_name: styleName,
      completed_at: new Date(body.timestamp)
    }

    // Save to database
    const dbResult = await DatabaseService.saveAssessmentResult(assessmentRecord)
    
    if (!dbResult.success) {
      console.error('Database save failed:', dbResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to save to database' },
        { status: 500 }
      )
    }

    console.log('Assessment result saved successfully:', {
      id: dbResult.id,
      coordinates: body.scores.coordinates,
      customCode: body.customCode,
      emailDomain: processedEmailDomain
    })
    
    // Return success response
    const responseData = {
      id: dbResult.id,
      totalQuestions: body.results.length,
      coordinates: body.scores.coordinates,
      completedAt: body.timestamp,
      customCode: body.customCode,
      saved: true
    }
    
    return NextResponse.json({
      success: true,
      message: 'Results saved successfully',
      data: responseData
    })
    
  } catch (error) {
    console.error('Error saving results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save results' },
      { status: 500 }
    )
  }
}

/**
 * Determine style name based on coordinates
 * This is a simplified version - could be enhanced to use the actual style definitions
 */
function determineStyleName(coordinates: { x: number, y: number }): string {
  const { x, y } = coordinates
  
  // Simple quadrant determination
  if (x > 0 && y > 0) return 'Breakaway'
  if (x < 0 && y > 0) return 'Incremental'
  if (x < 0 && y < 0) return 'Focused'
  if (x > 0 && y < 0) return 'Playful'
  
  // Handle near-center cases
  if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) return 'Fully kinetic thinker'
  
  // Handle border cases
  if (Math.abs(x) < 0.1) {
    return y > 0 ? 'Kinetic within openness' : 'Kinetic within structure'
  }
  if (Math.abs(y) < 0.1) {
    return x > 0 ? 'Kinetic within play' : 'Kinetic within reason'
  }
  
  return 'Balanced Thinker'
}