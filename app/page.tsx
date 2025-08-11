'use client'

import { useState, useEffect } from 'react'
import Assessment from '@/components/Assessment'
import ResultsDisplay from '@/components/ResultsDisplay'
import LoginModal from '@/components/LoginModal'
import { getStoredAuth, clearStoredAuth, User } from '@/lib/auth'
import { generateAssessmentQuestions, GeneratedQuestion } from '@/lib/assessmentGenerator'
import { AssessmentScore } from '@/lib/scoringEngine'
import { loadPhraseConfig, getUIText } from '@/config/assessmentConfig'

// Use the GeneratedQuestion interface from the generator
type AssessmentQuestion = GeneratedQuestion

interface AssessmentResult {
  questionId: string
  value: number
  percent: number
  question: number
}

export default function Home() {
  const [showAssessment, setShowAssessment] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [results, setResults] = useState<AssessmentResult[] | null>(null)
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([])
  const [uiText, setUIText] = useState<any>(null)

  useEffect(() => {
    const authState = getStoredAuth()
    setIsAuthenticated(authState.isAuthenticated)
    setUser(authState.user)
    
    // Load UI text from configuration
    loadPhraseConfig().then(config => {
      setUIText(getUIText(config))
    })
  }, [])

  const handleStartAssessment = async () => {
    // Temporarily disable authentication for testing
    // if (!isAuthenticated) {
    //   setShowLoginModal(true)
    //   return
    // }
    
    setIsLoading(true)
    try {
      // Generate new random questions for this assessment
      // Number of questions will be determined by the configuration
      const newQuestions = await generateAssessmentQuestions()
      setAssessmentQuestions(newQuestions)
      setShowAssessment(true)
      setResults(null)
    } catch (error) {
      console.error('Failed to generate assessment questions:', error)
      // Could show error message to user here
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (userData: User, token: string) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    clearStoredAuth()
    setUser(null)
    setIsAuthenticated(false)
    setShowAssessment(false)
    setShowResults(false)
    setResults(null)
  }

  const handleReturnHome = () => {
    setShowResults(false)
    setShowAssessment(false)
    setResults(null)
    setAssessmentScores(null)
  }

  const handleAssessmentComplete = async (
    assessmentResults: AssessmentResult[], 
    scores: AssessmentScore
  ) => {
    setIsLoading(true)
    
    try {
      // Send results to API
      const response = await fetch('/api/saveResults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: assessmentResults,
          scores: scores,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(assessmentResults)
        setAssessmentScores(scores)
        setShowAssessment(false)
        setShowResults(true) // Show results directly
        console.log('Assessment completed with scores:', scores)
      } else {
        console.error('Failed to save results')
      }
    } catch (error) {
      console.error('Error saving results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewResults = () => {
    // Navigate to results page or show results
    console.log('View results:', results)
  }

  if (showResults && assessmentScores) {
    return (
      <ResultsDisplay
        scores={assessmentScores}
        onReturnHome={handleReturnHome}
      />
    )
  }

  if (showAssessment && assessmentQuestions.length > 0) {
    return (
      <Assessment
        questions={assessmentQuestions}
        onComplete={handleAssessmentComplete}
      />
    )
  }

  // Show loading until UI text is loaded
  if (!uiText) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* User Info & Logout */}
        {isAuthenticated && user && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div className="text-sm">
                {uiText.auth.welcomeBack} <span className="font-semibold">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                {uiText.auth.logout}
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {uiText.homePage.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {uiText.homePage.subtitle}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {uiText.homePage.whatYoullLearn.heading}
                </h2>
                <ul className="space-y-3 text-gray-600">
                  {uiText.homePage.whatYoullLearn.items.map((item: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {uiText.homePage.assessmentDetails.heading}
                </h2>
                <ul className="space-y-3 text-gray-600">
                  {uiText.homePage.assessmentDetails.items.map((item: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleStartAssessment}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? uiText.homePage.buttons.processing : uiText.homePage.buttons.startAssessment}
            </button>

            {results && (
              <div className="mt-4">
                <button
                  onClick={handleViewResults}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {uiText.homePage.buttons.viewResults}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-sm text-gray-500">
            <p>{uiText.homePage.footer}</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}