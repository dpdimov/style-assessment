import { AssessmentConfig, loadPhraseConfig, getStyleDefinitions } from '@/config/assessmentConfig'
import { GeneratedQuestion } from './assessmentGenerator'

export interface CategoryScore {
  category: string
  dimension: string
  rawScore: number
  normalizedScore: number // -1 to +1
  questionCount: number
}

export interface DimensionScore {
  dimension: string
  category1: string
  category2: string
  category1Score: number
  category2Score: number
  dimensionBalance: number // -1 to +1 (-1 = strongly category1, +1 = strongly category2)
  totalQuestions: number
}

export interface AssessmentScore {
  categoryScores: CategoryScore[]
  dimensionScores: DimensionScore[]
  coordinates: {
    x: number // Phase 1 result: -1 (Structured Planning) to +1 (Adaptive Flexibility)
    y: number // Phase 2 result: -1 (Individual Leadership) to +1 (Collaborative Teamwork)
  }
  totalQuestions: number
  completedAt: string
}

export interface ScoringResponse {
  questionId: string
  value: number // 0-10 slider value
  leftPhrase: string
  rightPhrase: string
  leftPhraseCategory: string
  rightPhraseCategory: string
  preferredCategory: string
  preferenceStrength: number // 0-5 (0 = neutral, 5 = strongest preference)
}

// Convert slider value (0-10) to preference direction and strength
export function calculatePreference(
  sliderValue: number,
  leftPhrase: string,
  rightPhrase: string,
  config: AssessmentConfig
): {
  preferredCategory: string | null
  preferenceStrength: number
  leftCategory: string
  rightCategory: string
} {
  // Get categories for each phrase
  const leftCategory = getPhraseCategory(leftPhrase, config)
  const rightCategory = getPhraseCategory(rightPhrase, config)
  
  if (!leftCategory || !rightCategory) {
    throw new Error(`Could not find categories for phrases: "${leftPhrase}" or "${rightPhrase}"`)
  }
  
  // Slider value 5 = neutral (no preference)
  if (sliderValue === 5) {
    return {
      preferredCategory: null,
      preferenceStrength: 0,
      leftCategory,
      rightCategory
    }
  }
  
  // Calculate preference strength (1-5) and direction
  let preferredCategory: string
  let preferenceStrength: number
  
  if (sliderValue < 5) {
    // Preference for left phrase
    preferredCategory = leftCategory
    preferenceStrength = 5 - sliderValue // 4,3,2,1 become 1,2,3,4
  } else {
    // Preference for right phrase  
    preferredCategory = rightCategory
    preferenceStrength = sliderValue - 5 // 6,7,8,9,10 become 1,2,3,4,5
  }
  
  return {
    preferredCategory,
    preferenceStrength,
    leftCategory,
    rightCategory
  }
}

// Find which category a phrase belongs to
function getPhraseCategory(phrase: string, config: AssessmentConfig): string | null {
  for (const phraseSet of config.phraseSets) {
    if (phraseSet.phrases.includes(phrase)) {
      return phraseSet.category
    }
  }
  return null
}

// Calculate final assessment scores
export async function calculateAssessmentScores(
  questions: GeneratedQuestion[],
  responses: { questionId: string; value: number }[]
): Promise<AssessmentScore> {
  const config = await loadPhraseConfig()
  const scoringResponses: ScoringResponse[] = []
  
  // Process each response
  for (const response of responses) {
    const question = questions.find(q => q.id === response.questionId)
    if (!question) continue
    
    const preference = calculatePreference(
      response.value,
      question.leftPhrase,
      question.rightPhrase,
      config
    )
    
    scoringResponses.push({
      questionId: response.questionId,
      value: response.value,
      leftPhrase: question.leftPhrase,
      rightPhrase: question.rightPhrase,
      leftPhraseCategory: preference.leftCategory,
      rightPhraseCategory: preference.rightCategory,
      preferredCategory: preference.preferredCategory || 'neutral',
      preferenceStrength: preference.preferenceStrength
    })
  }
  
  // Calculate category scores
  const categoryScores = calculateCategoryScores(scoringResponses, config)
  
  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(categoryScores, config)
  
  // Calculate X/Y coordinates for 2D mapping
  const coordinates = calculateCoordinates(dimensionScores, config)
  
  return {
    categoryScores,
    dimensionScores,
    coordinates,
    totalQuestions: responses.length,
    completedAt: new Date().toISOString()
  }
}

// Calculate raw and normalized scores for each category
function calculateCategoryScores(
  responses: ScoringResponse[],
  config: AssessmentConfig
): CategoryScore[] {
  const categoryTotals: { [category: string]: { total: number; count: number; dimension: string } } = {}
  
  // Initialize category totals
  config.phraseSets.forEach(phraseSet => {
    categoryTotals[phraseSet.category] = {
      total: 0,
      count: 0,
      dimension: phraseSet.dimension
    }
  })
  
  // Sum preferences for each category
  responses.forEach(response => {
    if (response.preferredCategory !== 'neutral') {
      if (categoryTotals[response.preferredCategory]) {
        categoryTotals[response.preferredCategory].total += response.preferenceStrength
        categoryTotals[response.preferredCategory].count += 1
      }
    }
    
    // Also count questions where this category appeared (for normalization)
    if (categoryTotals[response.leftPhraseCategory]) {
      if (response.preferredCategory !== response.leftPhraseCategory) {
        // Category appeared but wasn't preferred - this affects the denominator
      }
    }
    if (categoryTotals[response.rightPhraseCategory]) {
      if (response.preferredCategory !== response.rightPhraseCategory) {
        // Category appeared but wasn't preferred - this affects the denominator
      }
    }
  })
  
  // Calculate scores
  const categoryScores: CategoryScore[] = []
  
  Object.entries(categoryTotals).forEach(([category, data]) => {
    // Count how many times this category appeared in questions
    const categoryAppearances = responses.filter(r => 
      r.leftPhraseCategory === category || r.rightPhraseCategory === category
    ).length
    
    const rawScore = data.total
    // Normalize to -1 to +1 based on possible range
    // Max possible score = categoryAppearances * 5 (if always chosen with max strength)
    // Min possible score = 0 (if never chosen)
    const maxPossible = categoryAppearances * 5
    const normalizedScore = maxPossible > 0 ? (rawScore / maxPossible) : 0
    
    categoryScores.push({
      category,
      dimension: data.dimension,
      rawScore,
      normalizedScore,
      questionCount: categoryAppearances
    })
  })
  
  return categoryScores
}

// Calculate dimension-level scores from category scores
function calculateDimensionScores(
  categoryScores: CategoryScore[],
  config: AssessmentConfig
): DimensionScore[] {
  if (!config.dimensions) return []
  
  return config.dimensions.map(dimension => {
    const [category1Name, category2Name] = dimension.categories
    const category1Score = categoryScores.find(cs => cs.category === category1Name)
    const category2Score = categoryScores.find(cs => cs.category === category2Name)
    
    const cat1Score = category1Score?.normalizedScore || 0
    const cat2Score = category2Score?.normalizedScore || 0
    const totalQuestions = (category1Score?.questionCount || 0) + (category2Score?.questionCount || 0)
    
    // Calculate dimension balance (-1 to +1)
    // -1 means strongly category1, +1 means strongly category2
    let dimensionBalance = 0
    if (cat1Score + cat2Score > 0) {
      dimensionBalance = (cat2Score - cat1Score) / (cat1Score + cat2Score)
    }
    
    return {
      dimension: dimension.name,
      category1: category1Name,
      category2: category2Name,
      category1Score: cat1Score,
      category2Score: cat2Score,
      dimensionBalance,
      totalQuestions
    }
  })
}

// Calculate X/Y coordinates from dimension scores
function calculateCoordinates(
  dimensionScores: DimensionScore[],
  config: AssessmentConfig
): { x: number; y: number } {
  if (!config.dimensions || config.dimensions.length < 2) {
    return { x: 0, y: 0 }
  }
  
  // Find the two dimensions from the actual config
  const dimension1 = dimensionScores.find(d => d.dimension === "Uncertainty Attitude")
  const dimension2 = dimensionScores.find(d => d.dimension === "Possibility Attitude")
  
  // X-axis: Uncertainty Attitude (-1 = Reason, +1 = Play)
  const x = dimension1?.dimensionBalance || 0
  
  // Y-axis: Possibility Attitude (-1 = Structure, +1 = Openness)  
  const y = dimension2?.dimensionBalance || 0
  
  return { x, y }
}

// Get human-readable interpretation of scores
export function interpretDimensionScore(dimensionScore: DimensionScore): {
  primary: string
  intensity: 'neutral' | 'slight' | 'moderate' | 'strong' | 'very strong'
  description: string
} {
  const absBalance = Math.abs(dimensionScore.dimensionBalance)
  const isCategory1 = dimensionScore.dimensionBalance < 0
  
  let intensity: 'neutral' | 'slight' | 'moderate' | 'strong' | 'very strong'
  if (absBalance < 0.1) intensity = 'neutral'
  else if (absBalance < 0.3) intensity = 'slight'
  else if (absBalance < 0.5) intensity = 'moderate'
  else if (absBalance < 0.7) intensity = 'strong'
  else intensity = 'very strong'
  
  const primary = intensity === 'neutral' ? 'balanced' : 
    isCategory1 ? dimensionScore.category1 : dimensionScore.category2
  
  const description = intensity === 'neutral' ? 
    `Balanced between ${dimensionScore.category1} and ${dimensionScore.category2}` :
    `${intensity} preference for ${primary}`
  
  return { primary, intensity, description }
}

// Interpret coordinates as style (9 possible positions)
export async function interpretCoordinates(coordinates: { x: number; y: number }): Promise<{
  position: string
  style: string
  description: string
  traits: string[]
}> {
  const config = await loadPhraseConfig()
  const { x, y } = coordinates
  
  // Define thresholds for neutral zones (adjust as needed)
  const neutralThreshold = 0.1
  
  let position: string
  let styleKey: string
  
  // Determine if coordinates are neutral, positive, or negative
  const xCategory = Math.abs(x) <= neutralThreshold ? 'neutral' : x > 0 ? 'positive' : 'negative'
  const yCategory = Math.abs(y) <= neutralThreshold ? 'neutral' : y > 0 ? 'positive' : 'negative'
  
  // Map to the 9 possible positions
  if (xCategory === 'neutral' && yCategory === 'neutral') {
    position = 'center'
    styleKey = 'center'
  } else if (xCategory === 'neutral' && yCategory === 'positive') {
    position = 'borderNorth'
    styleKey = 'borderNorth'
  } else if (xCategory === 'neutral' && yCategory === 'negative') {
    position = 'borderSouth'
    styleKey = 'borderSouth'
  } else if (xCategory === 'negative' && yCategory === 'neutral') {
    position = 'borderWest'
    styleKey = 'borderWest'
  } else if (xCategory === 'positive' && yCategory === 'neutral') {
    position = 'borderEast'
    styleKey = 'borderEast'
  } else if (xCategory === 'positive' && yCategory === 'positive') {
    position = 'quadrant1'
    styleKey = 'quadrant1'
  } else if (xCategory === 'negative' && yCategory === 'positive') {
    position = 'quadrant2'
    styleKey = 'quadrant2'
  } else if (xCategory === 'negative' && yCategory === 'negative') {
    position = 'quadrant3'
    styleKey = 'quadrant3'
  } else { // xCategory === 'positive' && yCategory === 'negative'
    position = 'quadrant4'
    styleKey = 'quadrant4'
  }
  
  // Get style info from configuration, with fallbacks
  const styleDefinitions = getStyleDefinitions(config)
  const styleInfo = styleDefinitions?.[styleKey as keyof typeof styleDefinitions]
  
  const style = styleInfo?.name || `${position} Style`
  const description = styleInfo?.description || `Style at position ${position}`
  const traits = styleInfo?.traits || []
  
  return { position, style, description, traits }
}