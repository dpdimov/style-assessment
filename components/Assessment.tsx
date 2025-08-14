'use client'

import { useState, useEffect } from 'react'
import AssessmentSlider from './AssessmentSlider'

import { GeneratedQuestion } from '@/lib/assessmentGenerator'
import { calculateAssessmentScores, AssessmentScore } from '@/lib/scoringEngine'
import { loadPhraseConfig, getUIText, AssessmentConfig } from '@/config/assessmentConfig'

interface AssessmentQuestion extends GeneratedQuestion {}

interface AssessmentResult {
  questionId: string
  value: number
  percent: number
  question: number
}

interface AssessmentProps {
  questions: AssessmentQuestion[]
  config: AssessmentConfig
  onComplete: (results: AssessmentResult[], scores: AssessmentScore) => void
}

export default function Assessment({ questions, config, onComplete }: AssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [results, setResults] = useState<AssessmentResult[]>([])
  const [currentPhase, setCurrentPhase] = useState<number>(1)
  const [uiText, setUIText] = useState<any>(null)
  
  useEffect(() => {
    // Use the provided configuration for UI text
    setUIText(getUIText(config))
  }, [config])
  
  // Split questions into two phases based on dimensions
  const questionsPerPhase = Math.ceil(questions.length / 2)
  const phase1Questions = questions.slice(0, questionsPerPhase)
  const phase2Questions = questions.slice(questionsPerPhase)
  
  const getCurrentPhaseQuestions = () => {
    return currentPhase === 1 ? phase1Questions : phase2Questions
  }
  
  const getCurrentPhaseQuestionIndex = () => {
    return currentPhase === 1 ? currentQuestion : currentQuestion - questionsPerPhase
  }

  const handleValueChange = (value: number, questionId: string) => {
    // This is called when slider value changes but not submitted yet
  }

  const handleSubmit = async () => {
    // Get current question data
    const question = questions[currentQuestion]
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement
    const sliderValue = parseInt(slider?.value || '5') // 0-10 range
    
    // Store result with slider value (0-10)
    const result: AssessmentResult = {
      questionId: question.id,
      value: sliderValue,
      percent: 0, // Will be calculated by scoring engine
      question: currentQuestion + 1
    }
    
    const newResults = [...results, result]
    setResults(newResults)

    // Move to next question, phase, or complete assessment
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      
      // Check if moving to next phase
      if (currentPhase === 1 && nextQuestion >= questionsPerPhase) {
        setCurrentPhase(2)
      }
    } else {
      // Assessment complete - calculate scores
      try {
        const assessmentScores = await calculateAssessmentScores(questions, newResults, config)
        onComplete(newResults, assessmentScores)
      } catch (error) {
        console.error('Error calculating scores:', error)
        // Fallback - still complete but without detailed scores
        onComplete(newResults, {
          assessmentId: config.id,
          categoryScores: [],
          dimensionScores: [],
          coordinates: { x: 0, y: 0 },
          totalQuestions: newResults.length,
          completedAt: new Date().toISOString()
        })
      }
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  // Show loading until UI text is loaded
  if (!uiText) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {uiText.assessment.title}
          </h1>
          <div className="text-lg text-gray-600">
            <div className="mb-2">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Part {currentPhase} of 2
              </span>
            </div>
            Question <span className="counter font-semibold">{getCurrentPhaseQuestionIndex() + 1}</span> of {getCurrentPhaseQuestions().length}
            <div className="text-sm text-gray-600 mt-3 max-w-2xl mx-auto">
              {currentPhase === 1 ? uiText.assessment.partIntros.part1 : uiText.assessment.partIntros.part2}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <AssessmentSlider
            key={currentQuestion} // Reset slider when question changes
            questionId={questions[currentQuestion]?.id}
            leftPhrase={questions[currentQuestion]?.leftPhrase}
            rightPhrase={questions[currentQuestion]?.rightPhrase}
            onValueChange={handleValueChange}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Navigation Info */}
        <div className="text-center text-sm text-gray-500">
          {uiText.assessment.instructions}
        </div>
      </div>
    </div>
  )
}