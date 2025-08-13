'use client'

import { useState, useEffect } from 'react'
import { loadAssessmentRegistry, AssessmentRegistry } from '@/config/assessmentConfig'

interface AssessmentSelectionProps {
  onAssessmentSelected: (assessmentId: string) => void
}

export default function AssessmentSelection({ onAssessmentSelected }: AssessmentSelectionProps) {
  const [registry, setRegistry] = useState<AssessmentRegistry | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState<string>('')

  useEffect(() => {
    loadAssessmentRegistry().then(data => {
      setRegistry(data)
      setSelectedAssessment(data.defaultAssessment)
      setLoading(false)
    })
  }, [])

  const handleContinue = () => {
    if (selectedAssessment) {
      onAssessmentSelected(selectedAssessment)
    }
  }

  if (loading || !registry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Assessment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the assessment that best fits your goals. Each assessment explores different aspects of your style and preferences.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {registry.assessments
            .filter(assessment => assessment.isActive)
            .map((assessment) => (
              <div
                key={assessment.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-200 cursor-pointer ${
                  selectedAssessment === assessment.id
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedAssessment(assessment.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={assessment.id}
                        name="assessment"
                        value={assessment.id}
                        checked={selectedAssessment === assessment.id}
                        onChange={(e) => setSelectedAssessment(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <h3 className="ml-3 text-xl font-semibold text-gray-900">
                        {assessment.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4 ml-7">
                      {assessment.shortDescription}
                    </p>
                    <div className="ml-7 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {assessment.estimatedTime}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {assessment.questionCount} questions
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        v{assessment.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedAssessment}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none"
          >
            Continue to Assessment
          </button>
          
          {registry.assessments.length > 1 && (
            <p className="mt-4 text-sm text-gray-500">
              You can always return to select a different assessment
            </p>
          )}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>{registry.metadata.totalAssessments} assessment{registry.metadata.totalAssessments !== 1 ? 's' : ''} available</p>
        </div>
      </div>
    </div>
  )
}