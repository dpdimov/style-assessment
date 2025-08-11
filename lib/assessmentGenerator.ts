import { loadPhraseConfig, flattenPhrases, AssessmentConfig, DEFAULT_SETTINGS, getAssessmentSettings, getRecommendedQuestionCount } from '@/config/assessmentConfig'

// Cache for loaded configuration
let configCache: AssessmentConfig | null = null
let phrasePoolCache: string[] | null = null

export interface GeneratedQuestion {
  id: string
  leftPhrase: string
  rightPhrase: string
  leftPhraseId: number  // Index in phrase pool
  rightPhraseId: number // Index in phrase pool
  pair: string
}

// Load phrase pool from configuration
async function getPhrasePool(): Promise<string[]> {
  if (phrasePoolCache) {
    return phrasePoolCache
  }
  
  if (!configCache) {
    configCache = await loadPhraseConfig()
  }
  
  phrasePoolCache = flattenPhrases(configCache)
  return phrasePoolCache
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate random phrase pairs for assessment
export async function generateAssessmentQuestions(numQuestions?: number): Promise<GeneratedQuestion[]> {
  if (!configCache) {
    configCache = await loadPhraseConfig()
  }
  
  const settings = getAssessmentSettings(configCache)
  
  // Use provided number or get recommended count from config
  const questionCount = numQuestions ?? getRecommendedQuestionCount(configCache)
  
  console.log(`Generating ${questionCount} questions using ${settings?.pairingStrategy || 'random'} strategy`)
  
  if (settings?.pairingStrategy === 'dimension-focused') {
    return generateDimensionFocusedQuestions(questionCount)
  } else {
    return generateRandomQuestions(questionCount)
  }
}

// Generate questions that focus on dimension contrasts
async function generateDimensionFocusedQuestions(questionCount: number): Promise<GeneratedQuestion[]> {
  if (!configCache) {
    configCache = await loadPhraseConfig()
  }
  
  const questions: GeneratedQuestion[] = []
  const phrasePool = await getPhrasePool()
  const settings = getAssessmentSettings(configCache)
  
  // Group phrases by category
  const categorizedPhrases: { [category: string]: string[] } = {}
  
  configCache.phraseSets.forEach(phraseSet => {
    categorizedPhrases[phraseSet.category] = [...phraseSet.phrases]
  })
  
  // If we have dimensions defined, create phase-based questions
  if (configCache.dimensions && settings?.ensureEqualDimensionCoverage) {
    const questionsPerDimension = Math.floor(questionCount / configCache.dimensions.length)
    
    // Generate questions for each dimension in order (for phases)
    configCache.dimensions.forEach((dimension, dimIndex) => {
      const [category1, category2] = dimension.categories
      const phrases1 = shuffleArray(categorizedPhrases[category1] || [])
      const phrases2 = shuffleArray(categorizedPhrases[category2] || [])
      
      // Generate questions for this dimension
      for (let i = 0; i < questionsPerDimension && i < Math.min(phrases1.length, phrases2.length); i++) {
        const phrase1 = phrases1[i]
        const phrase2 = phrases2[i]
        const phrase1Index = phrasePool.indexOf(phrase1)
        const phrase2Index = phrasePool.indexOf(phrase2)
        
        const leftFirst = Math.random() < 0.5
        
        questions.push({
          id: `q${questions.length + 1}`,
          leftPhrase: leftFirst ? phrase1 : phrase2,
          rightPhrase: leftFirst ? phrase2 : phrase1,
          leftPhraseId: leftFirst ? phrase1Index : phrase2Index,
          rightPhraseId: leftFirst ? phrase2Index : phrase1Index,
          pair: `phase${dimIndex + 1}-${dimension.name}-${category1}-vs-${category2}`
        })
      }
    })
  } else {
    // Fallback to random pairing if no proper dimension structure
    return generateRandomQuestions(questionCount)
  }
  
  // Don't shuffle - keep dimension order for phases
  return questions
}

// Generate questions with random pairing (original method)
async function generateRandomQuestions(questionCount: number): Promise<GeneratedQuestion[]> {
  const phrasePool = await getPhrasePool()
  const maxPossible = Math.floor(phrasePool.length / 2)
  const actualCount = Math.min(questionCount, maxPossible)
  
  const shuffledPhrases = shuffleArray(phrasePool)
  const questions: GeneratedQuestion[] = []
  
  for (let i = 0; i < actualCount && i * 2 + 1 < shuffledPhrases.length; i++) {
    const phrase1 = shuffledPhrases[i * 2]
    const phrase2 = shuffledPhrases[i * 2 + 1]
    const phrase1Index = phrasePool.indexOf(phrase1)
    const phrase2Index = phrasePool.indexOf(phrase2)
    
    const leftFirst = Math.random() < 0.5
    
    questions.push({
      id: `q${i + 1}`,
      leftPhrase: leftFirst ? phrase1 : phrase2,
      rightPhrase: leftFirst ? phrase2 : phrase1,
      leftPhraseId: leftFirst ? phrase1Index : phrase2Index,
      rightPhraseId: leftFirst ? phrase2Index : phrase1Index,
      pair: `${Math.min(phrase1Index, phrase2Index)}-vs-${Math.max(phrase1Index, phrase2Index)}`
    })
  }
  
  return questions
}

// Synchronous version using cached data (for fallback)
export function generateAssessmentQuestionsSync(numQuestions: number = DEFAULT_SETTINGS.defaultQuestionCount): GeneratedQuestion[] {
  if (!phrasePoolCache) {
    // Use minimal fallback if no cache available
    const fallbackPhrases = [
      'I prefer detailed plans',
      'I prefer flexibility',
      'I like to lead',
      'I prefer collaboration',
      'I focus on facts',
      'I explore possibilities',
      'I make logical decisions',
      'I consider feelings'
    ]
    return generateQuestionsFromPool(fallbackPhrases, numQuestions)
  }
  
  return generateQuestionsFromPool(phrasePoolCache, numQuestions)
}

function generateQuestionsFromPool(phrasePool: string[], numQuestions: number): GeneratedQuestion[] {
  const shuffledPhrases = shuffleArray(phrasePool)
  const questions: GeneratedQuestion[] = []
  
  for (let i = 0; i < numQuestions && i * 2 + 1 < shuffledPhrases.length; i++) {
    const phrase1 = shuffledPhrases[i * 2]
    const phrase2 = shuffledPhrases[i * 2 + 1]
    const phrase1Index = phrasePool.indexOf(phrase1)
    const phrase2Index = phrasePool.indexOf(phrase2)
    
    const leftFirst = Math.random() < 0.5
    
    questions.push({
      id: `q${i + 1}`,
      leftPhrase: leftFirst ? phrase1 : phrase2,
      rightPhrase: leftFirst ? phrase2 : phrase1,
      leftPhraseId: leftFirst ? phrase1Index : phrase2Index,
      rightPhraseId: leftFirst ? phrase2Index : phrase1Index,
      pair: `${Math.min(phrase1Index, phrase2Index)}-vs-${Math.max(phrase1Index, phrase2Index)}`
    })
  }
  
  return questions
}

// Generate assessment with seeded randomization (for reproducible tests)
export function generateSeededAssessment(seed: string, numQuestions: number = 5): GeneratedQuestion[] {
  // Use phrase cache if available, otherwise fallback phrases
  const phrasePool = phrasePoolCache || [
    'I prefer detailed plans',
    'I prefer flexibility',
    'I like to lead',
    'I prefer collaboration',
    'I focus on facts',
    'I explore possibilities',
    'I make logical decisions',
    'I consider feelings'
  ]
  
  // Simple seeded random number generator
  let seedNum = 0
  for (let i = 0; i < seed.length; i++) {
    seedNum += seed.charCodeAt(i)
  }
  
  const seededRandom = (function(seed: number) {
    let state = seed
    return function() {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  })(seedNum)
  
  // Shuffle using seeded random
  const shuffled = [...phrasePool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  const questions: GeneratedQuestion[] = []
  
  for (let i = 0; i < numQuestions && i * 2 + 1 < shuffled.length; i++) {
    const phrase1 = shuffled[i * 2]
    const phrase2 = shuffled[i * 2 + 1]
    const phrase1Index = phrasePool.indexOf(phrase1)
    const phrase2Index = phrasePool.indexOf(phrase2)
    
    // Use seeded random for left/right placement
    const leftFirst = seededRandom() < 0.5
    
    questions.push({
      id: `q${i + 1}`,
      leftPhrase: leftFirst ? phrase1 : phrase2,
      rightPhrase: leftFirst ? phrase2 : phrase1,
      leftPhraseId: leftFirst ? phrase1Index : phrase2Index,
      rightPhraseId: leftFirst ? phrase2Index : phrase1Index,
      pair: `${Math.min(phrase1Index, phrase2Index)}-vs-${Math.max(phrase1Index, phrase2Index)}`
    })
  }
  
  return questions
}