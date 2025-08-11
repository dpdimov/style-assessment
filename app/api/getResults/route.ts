import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'en'
    const userId = searchParams.get('userId')
    
    // Here you would typically:
    // 1. Validate the user/session
    // 2. Fetch results from your database
    // 3. Format results based on language preference
    
    // For now, return mock data
    const mockResults = {
      id: '123456',
      completedAt: new Date().toISOString(),
      overallScore1: 3.2,
      overallScore2: 2.8,
      totalQuestions: 20,
      analysis: lang === 'es' 
        ? 'Tiende a tener un enfoque más estructurado y analítico del trabajo.'
        : 'You tend to have a more structured and analytical approach to work.',
      recommendations: lang === 'es' 
        ? [
            'Considere incorporar más flexibilidad en su planificación',
            'Practique la escucha activa en las discusiones del equipo',
            'Explore técnicas creativas de resolución de problemas'
          ]
        : [
            'Consider incorporating more flexibility in your planning',
            'Practice active listening in team discussions',
            'Explore creative problem-solving techniques'
          ],
      categories: {
        'Planning vs Flexibility': 0.7,
        'Leadership vs Collaboration': 0.6,
        'Concrete vs Abstract': 0.4,
        'Thinking vs Feeling': 0.8,
        'Individual vs Team': 0.3
      }
    }
    
    return NextResponse.json({
      success: true,
      data: mockResults
    })
    
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}