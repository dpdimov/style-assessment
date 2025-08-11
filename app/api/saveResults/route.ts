import { NextRequest, NextResponse } from 'next/server'

interface AssessmentResult {
  questionId: string
  value: number
  percent: number
  question: number
}

interface SaveResultsRequest {
  results: AssessmentResult[]
  count1: number
  count2: number
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveResultsRequest = await request.json()
    
    // Here you would typically:
    // 1. Validate the user/session
    // 2. Save to your database
    // 3. Process the results
    // 4. Return processed data or confirmation
    
    // For now, we'll just log and return the processed data
    console.log('Received assessment results:', {
      resultsCount: body.results.length,
      count1: body.count1,
      count2: body.count2,
      timestamp: body.timestamp
    })
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return success response with processed results
    const processedResults = {
      id: Date.now().toString(),
      totalQuestions: body.results.length,
      overallScore1: body.count1,
      overallScore2: body.count2,
      completedAt: body.timestamp,
      analysis: generateAnalysis(body.count1, body.count2),
      recommendations: generateRecommendations(body.count1, body.count2)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Results saved successfully',
      data: processedResults
    })
    
  } catch (error) {
    console.error('Error saving results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save results' },
      { status: 500 }
    )
  }
}

function generateAnalysis(count1: number, count2: number): string {
  // Simple analysis based on the counts
  const total = count1 + count2
  const ratio = count1 / (count1 + count2)
  
  if (ratio > 0.6) {
    return 'You tend to have a more structured and analytical approach to work.'
  } else if (ratio < 0.4) {
    return 'You tend to have a more flexible and intuitive approach to work.'
  } else {
    return 'You demonstrate a balanced approach, adapting your style based on the situation.'
  }
}

function generateRecommendations(count1: number, count2: number): string[] {
  const recommendations = []
  const ratio = count1 / (count1 + count2)
  
  if (ratio > 0.6) {
    recommendations.push('Consider incorporating more flexibility in your planning')
    recommendations.push('Practice active listening in team discussions')
    recommendations.push('Explore creative problem-solving techniques')
  } else if (ratio < 0.4) {
    recommendations.push('Develop more structured approaches to complex tasks')
    recommendations.push('Practice time management and deadline setting')
    recommendations.push('Consider analytical frameworks for decision making')
  } else {
    recommendations.push('Continue leveraging your adaptable working style')
    recommendations.push('Share your balanced perspective with team members')
    recommendations.push('Consider mentoring others on situational leadership')
  }
  
  return recommendations
}