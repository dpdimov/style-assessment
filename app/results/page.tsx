'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface AssessmentResults {
  id: string
  completedAt: string
  overallScore1: number
  overallScore2: number
  totalQuestions: number
  analysis: string
  recommendations: string[]
  categories: { [key: string]: number }
}

export default function ResultsPage() {
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const searchParams = useSearchParams()
  const lang = searchParams?.get('lang') || 'en'

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/getResults?lang=${lang}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!results) return
    
    setIsGeneratingPDF(true)
    try {
      const response = await fetch('/api/generatePDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultId: results.id,
          lang: lang
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // In a real implementation, you would handle the PDF download
        alert('PDF generation initiated. Download will start shortly.')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">Please complete an assessment first.</p>
          <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
            Take Assessment
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Assessment Results
          </h1>
          <p className="text-gray-600">
            Completed on {new Date(results.completedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Scores */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overall Scores</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {results.overallScore1.toFixed(1)}
              </div>
              <div className="text-gray-600">Structured Approach</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {results.overallScore2.toFixed(1)}
              </div>
              <div className="text-gray-600">Flexible Approach</div>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            {results.analysis}
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(results.categories).map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-500">{(score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommendations</h2>
          <ul className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          
          <a
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg inline-block"
          >
            Take Another Assessment
          </a>
        </div>
      </div>
    </div>
  )
}