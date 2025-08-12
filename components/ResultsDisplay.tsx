'use client'

import { useState, useEffect } from 'react'
import { AssessmentScore, interpretCoordinates } from '@/lib/scoringEngine'
import { loadPhraseConfig, getUIText, getResultsDisplayConfig } from '@/config/assessmentConfig'

interface ResultsDisplayProps {
  scores: AssessmentScore
  onReturnHome: () => void
}

export default function ResultsDisplay({ scores, onReturnHome }: ResultsDisplayProps) {
  const [interpretation, setInterpretation] = useState<any>(null)
  const [uiText, setUIText] = useState<any>(null)
  const [displayConfig, setDisplayConfig] = useState<any>(null)
  const [dimensions, setDimensions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        const config = await loadPhraseConfig()
        const ui = getUIText(config)
        const display = getResultsDisplayConfig(config)
        const result = await interpretCoordinates(scores.coordinates)
        
        setInterpretation(result)
        setUIText(ui)
        setDisplayConfig(display)
        setDimensions(config.dimensions || [])
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadResults()
  }, [scores])

  if (loading || !interpretation || !uiText || !displayConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your results...</div>
      </div>
    )
  }

  const { x, y } = scores.coordinates
  
  // Convert coordinates (-1 to 1) to plot position (0 to 400px)
  const plotX = ((x + 1) / 2) * 400
  const plotY = ((1 - y) / 2) * 400 // Invert Y axis for visual display

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Results
          </h1>
          <p className="text-xl text-gray-600">
            Here's your personalized style profile based on your responses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Results Plot */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Visual Summary
            </h2>
            
            {/* Coordinate Plot */}
            <div className="relative mx-auto" style={{ width: '420px', height: '420px' }}>
              {/* Plot background */}
              <div 
                className="absolute border-2 bg-gray-50 overflow-hidden"
                style={{ 
                  width: '400px', 
                  height: '400px', 
                  left: '10px', 
                  top: '10px',
                  borderColor: displayConfig.plotSettings.borderColor,
                  backgroundImage: displayConfig.backgroundImage.enabled ? `url(${displayConfig.backgroundImage.url})` : 'none',
                  backgroundSize: displayConfig.backgroundImage.size,
                  backgroundPosition: displayConfig.backgroundImage.position,
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Background overlay for opacity control */}
                {displayConfig.backgroundImage.enabled && (
                  <div 
                    className="absolute inset-0 bg-white"
                    style={{ opacity: 1 - displayConfig.backgroundImage.opacity }}
                  ></div>
                )}
                
                {/* Quadrant lines */}
                {displayConfig.plotSettings.showGrid && (
                  <>
                    <div 
                      className="absolute w-full h-0.5" 
                      style={{ 
                        top: '50%', 
                        backgroundColor: displayConfig.plotSettings.gridColor 
                      }}
                    ></div>
                    <div 
                      className="absolute h-full w-0.5" 
                      style={{ 
                        left: '50%', 
                        backgroundColor: displayConfig.plotSettings.gridColor 
                      }}
                    ></div>
                  </>
                )}
                
                
                {/* User's position */}
                <div 
                  className="absolute w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2"
                  style={{ left: `${plotX}px`, top: `${plotY}px` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    You are here
                  </div>
                </div>
              </div>
              
              {/* Axis labels */}
              <div className="absolute text-sm text-gray-600 transform -rotate-90" style={{ left: '-70px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }}>
                {dimensions.length >= 2 ? `${dimensions[1].categories[0]} ← → ${dimensions[1].categories[1]}` : 'Individual ← → Collaborative'}
              </div>
              <div className="absolute text-sm text-gray-600 text-center w-full" style={{ bottom: '-20px' }}>
                {dimensions.length >= 1 ? `${dimensions[0].categories[0]} ← → ${dimensions[0].categories[1]}` : 'Structured ← → Adaptive'}
              </div>
            </div>
          </div>

          {/* Style Description */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Your Style: {interpretation.style}
            </h2>
            
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              {interpretation.description}
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Traits:</h3>
              <div className="grid grid-cols-2 gap-2">
                {interpretation.traits.map((trait: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{trait}</span>
                  </div>
                ))}
              </div>
            </div>
            
            
            <button
              onClick={onReturnHome}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Take Assessment Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}