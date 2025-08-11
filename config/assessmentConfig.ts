// Type definitions for assessment configuration
export interface Dimension {
  name: string
  description: string
  categories: string[]
}

export interface PhraseSet {
  category: string
  dimension: string
  phrases: string[]
}

export interface StyleDefinition {
  name: string
  description: string
  coordinates: {
    x: 'positive' | 'negative' | 'neutral'
    y: 'positive' | 'negative' | 'neutral'
  }
  traits: string[]
}

export interface UIText {
  homePage: {
    title: string
    subtitle: string
    whatYoullLearn: {
      heading: string
      items: string[]
    }
    assessmentDetails: {
      heading: string
      items: string[]
    }
    buttons: {
      startAssessment: string
      processing: string
      viewResults: string
    }
    footer: string
  }
  assessment: {
    title: string
    partIntros: {
      part1: string
      part2: string
    }
    instructions: string
  }
  auth: {
    welcomeBack: string
    logout: string
  }
}

export interface AssessmentConfig {
  dimensions?: Dimension[]
  phraseSets: PhraseSet[]
  assessmentSettings?: {
    defaultQuestionCount: number
    minQuestionCount: number
    maxQuestionCount: number
    allowDuplicatePhrases: boolean
    pairingStrategy: 'random' | 'category-mixed' | 'category-exclusive' | 'dimension-focused'
    ensureEqualDimensionCoverage?: boolean
  }
  styleDefinitions?: {
    quadrant1: StyleDefinition
    quadrant2: StyleDefinition  
    quadrant3: StyleDefinition
    quadrant4: StyleDefinition
    borderNorth: StyleDefinition
    borderSouth: StyleDefinition
    borderWest: StyleDefinition
    borderEast: StyleDefinition
    center: StyleDefinition
  }
  uiText?: UIText
  metadata: {
    version: string
    lastUpdated: string
    totalPhrases: number
    categories: number
    dimensions?: number
    description: string
  }
}

export interface AssessmentSettings {
  defaultQuestionCount: number
  allowDuplicatePhrases: boolean
  requireAllCategories: boolean
  shuffleWithinCategories: boolean
  pairingStrategy: 'random' | 'category-mixed' | 'category-exclusive'
}

// Default assessment settings
export const DEFAULT_SETTINGS: AssessmentSettings = {
  defaultQuestionCount: 5,
  allowDuplicatePhrases: false,
  requireAllCategories: false,
  shuffleWithinCategories: true,
  pairingStrategy: 'random'
}

// Load configuration from JSON file
export async function loadPhraseConfig(): Promise<AssessmentConfig> {
  try {
    const configModule = await import('./phrases.json')
    return configModule.default as AssessmentConfig
  } catch (error) {
    console.error('Failed to load phrase configuration:', error)
    // Return fallback configuration
    return getFallbackConfig()
  }
}

// Fallback configuration if JSON fails to load
function getFallbackConfig(): AssessmentConfig {
  return {
    phraseSets: [
      {
        category: "Planning vs Flexibility",
        dimension: "Decision Making Style",
        phrases: [
          "I prefer detailed plans and schedules",
          "I prefer flexibility and spontaneity",
          "I like structured approaches", 
          "I adapt as situations change"
        ]
      },
      {
        category: "Leadership vs Collaboration", 
        dimension: "Work Interaction Style",
        phrases: [
          "I like to take charge in groups",
          "I prefer collaborative decision-making",
          "I naturally assume leadership roles",
          "I value consensus building"
        ]
      }
    ],
    metadata: {
      version: "1.0.0-fallback",
      lastUpdated: new Date().toISOString().split('T')[0],
      totalPhrases: 8,
      categories: 2,
      description: "Fallback phrase configuration"
    }
  }
}

// Extract all phrases into a flat array
export function flattenPhrases(config: AssessmentConfig): string[] {
  return config.phraseSets.flatMap(set => set.phrases)
}

// Get phrases by category
export function getPhrasesByCategory(config: AssessmentConfig, category: string): string[] {
  const phraseSet = config.phraseSets.find(set => set.category === category)
  return phraseSet ? phraseSet.phrases : []
}

// Get all categories
export function getCategories(config: AssessmentConfig): string[] {
  return config.phraseSets.map(set => set.category)
}

// Get assessment settings from config or use defaults
export function getAssessmentSettings(config: AssessmentConfig): Required<AssessmentConfig['assessmentSettings']> {
  return {
    defaultQuestionCount: config.assessmentSettings?.defaultQuestionCount || DEFAULT_SETTINGS.defaultQuestionCount,
    minQuestionCount: config.assessmentSettings?.minQuestionCount || 1,
    maxQuestionCount: config.assessmentSettings?.maxQuestionCount || 20,
    allowDuplicatePhrases: config.assessmentSettings?.allowDuplicatePhrases || DEFAULT_SETTINGS.allowDuplicatePhrases,
    pairingStrategy: config.assessmentSettings?.pairingStrategy || DEFAULT_SETTINGS.pairingStrategy,
    ensureEqualDimensionCoverage: config.assessmentSettings?.ensureEqualDimensionCoverage || false
  }
}

// Calculate maximum possible questions based on phrase count
export function getMaxPossibleQuestions(config: AssessmentConfig): number {
  const totalPhrases = flattenPhrases(config).length
  const settings = getAssessmentSettings(config)
  
  if (settings?.allowDuplicatePhrases) {
    // With duplicates allowed, we can generate many more combinations
    return Math.min(settings.maxQuestionCount, totalPhrases * (totalPhrases - 1) / 2)
  } else {
    // Without duplicates, limited by phrase pairs
    return Math.min(settings?.maxQuestionCount || 20, Math.floor(totalPhrases / 2))
  }
}

// Get recommended question count based on available phrases
export function getRecommendedQuestionCount(config: AssessmentConfig): number {
  const maxPossible = getMaxPossibleQuestions(config)
  const settings = getAssessmentSettings(config)
  
  return Math.min(settings?.defaultQuestionCount || 5, maxPossible)
}

// Get UI text from config or use defaults
export function getUIText(config: AssessmentConfig): UIText {
  return config.uiText || {
    homePage: {
      title: "Kinetic Style Assessment",
      subtitle: "Discover your working style and behavioral preferences through our comprehensive assessment tool.",
      whatYoullLearn: {
        heading: "What You'll Learn:",
        items: [
          "Your preferred working style",
          "Communication preferences",
          "Decision-making approach", 
          "Team collaboration style"
        ]
      },
      assessmentDetails: {
        heading: "Assessment Details:",
        items: [
          "Takes 5-10 minutes to complete",
          "12 randomized question pairs",
          "Instant results and insights",
          "Downloadable PDF report"
        ]
      },
      buttons: {
        startAssessment: "Start Assessment",
        processing: "Processing...",
        viewResults: "View Your Results"
      },
      footer: "Your privacy is important to us. All assessment data is securely processed and stored."
    },
    assessment: {
      title: "Kinetic Style Assessment", 
      partIntros: {
        part1: "For each pair below, select the statement that better describes your approach to making decisions and solving problems.",
        part2: "For each pair below, select the statement that better describes how you prefer to work with others and handle leadership."
      },
      instructions: "Use the slider or click the bars above to select your response"
    },
    auth: {
      welcomeBack: "Welcome back,",
      logout: "Logout"
    }
  }
}

// Get style definitions from config or use defaults  
export function getStyleDefinitions(config: AssessmentConfig): Required<AssessmentConfig['styleDefinitions']> {
  return config.styleDefinitions || {
    quadrant1: {
      name: "Adaptive Collaborator",
      description: "Flexible approach with collaborative teamwork",
      coordinates: { x: "positive", y: "positive" },
      traits: ["Flexible", "Collaborative", "Responsive", "Team-oriented"]
    },
    quadrant2: {
      name: "Structured Collaborator",
      description: "Planned approach with collaborative teamwork",
      coordinates: { x: "negative", y: "positive" },
      traits: ["Organized", "Collaborative", "Methodical", "Team-oriented"]
    },
    quadrant3: {
      name: "Structured Leader", 
      description: "Planned approach with individual leadership",
      coordinates: { x: "negative", y: "negative" },
      traits: ["Organized", "Independent", "Methodical", "Self-directed"]
    },
    quadrant4: {
      name: "Adaptive Leader",
      description: "Flexible approach with individual leadership", 
      coordinates: { x: "positive", y: "negative" },
      traits: ["Flexible", "Independent", "Responsive", "Self-directed"]
    },
    borderNorth: {
      name: "Collaborative Bridge-Builder",
      description: "Balance between structured and adaptive with collaborative focus",
      coordinates: { x: "neutral", y: "positive" },
      traits: ["Diplomatic", "Collaborative", "Balanced", "Harmonizing"]
    },
    borderSouth: {
      name: "Independent Strategist",
      description: "Balance between structured and adaptive with independent focus",
      coordinates: { x: "neutral", y: "negative" },
      traits: ["Strategic", "Independent", "Balanced", "Accountable"]
    },
    borderWest: {
      name: "Systematic Facilitator",
      description: "Structured approach with balanced individual/collaborative style",
      coordinates: { x: "negative", y: "neutral" },
      traits: ["Organized", "Balanced", "Systematic", "Facilitating"]
    },
    borderEast: {
      name: "Agile Catalyst",
      description: "Adaptive approach with balanced individual/collaborative style",
      coordinates: { x: "positive", y: "neutral" },
      traits: ["Adaptive", "Balanced", "Energizing", "Catalytic"]
    },
    center: {
      name: "Dynamic Integrator",
      description: "Exceptional balance across all working styles",
      coordinates: { x: "neutral", y: "neutral" },
      traits: ["Versatile", "Adaptive", "Balanced", "Integrative"]
    }
  }
}

// Validate configuration
export function validateConfig(config: AssessmentConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.phraseSets || config.phraseSets.length === 0) {
    errors.push('No phrase sets defined')
  }
  
  config.phraseSets.forEach((set, index) => {
    if (!set.category || set.category.trim() === '') {
      errors.push(`Phrase set ${index + 1} missing category`)
    }
    
    if (!set.phrases || set.phrases.length === 0) {
      errors.push(`Phrase set '${set.category}' has no phrases`)
    }
    
    if (set.phrases && set.phrases.length < 2) {
      errors.push(`Phrase set '${set.category}' needs at least 2 phrases`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}