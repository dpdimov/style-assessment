'use client'

import { useState, useEffect, useMemo } from 'react'
import { loadPhraseConfig, validateConfig, AssessmentConfig, getCategories, getAssessmentSettings, getMaxPossibleQuestions, getRecommendedQuestionCount } from '@/config/assessmentConfig'

export default function ConfigPage() {
  const [config, setConfig] = useState<AssessmentConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null)

  // Memoized computed values
  const computedValues = useMemo(() => {
    if (!config) {
      return {
        assessmentSettings: null,
        recommendedCount: 'N/A',
        maxPossible: 'N/A',
        categories: []
      }
    }

    const settings = getAssessmentSettings(config)
    return {
      assessmentSettings: settings,
      recommendedCount: getRecommendedQuestionCount(config),
      maxPossible: getMaxPossibleQuestions(config),
      categories: getCategories(config)
    }
  }, [config])

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const loadedConfig = await loadPhraseConfig()
      setConfig(loadedConfig)
      setValidation(validateConfig(loadedConfig))
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Configuration</h1>
          <button 
            onClick={loadConfig}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Configuration
          </h1>
          <p className="text-gray-600">
            Manage and preview phrase sets for assessments
          </p>
        </div>

        {/* Validation Status */}
        {validation && (
          <div className={`p-4 rounded-lg mb-6 ${
            validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              validation.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validation.isValid ? '✅ Configuration Valid' : '❌ Configuration Errors'}
            </h3>
            {!validation.isValid && (
              <ul className="list-disc list-inside text-red-700">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Assessment Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment Settings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Default Questions</div>
              <div className="font-semibold">{computedValues.assessmentSettings?.defaultQuestionCount ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Recommended Count</div>
              <div className="font-semibold">{computedValues.recommendedCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Max Possible</div>
              <div className="font-semibold">{computedValues.maxPossible}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Pairing Strategy</div>
              <div className="font-semibold">{computedValues.assessmentSettings?.pairingStrategy ?? 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Metadata</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Version</div>
              <div className="font-semibold">{config.metadata.version}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Phrases</div>
              <div className="font-semibold">{config.metadata.totalPhrases}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Categories</div>
              <div className="font-semibold">{config.metadata.categories}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="font-semibold">{config.metadata.lastUpdated}</div>
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {computedValues.categories.map((category, index) => {
              const phraseSet = config?.phraseSets.find(set => set.category === category)
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                  <div className="text-sm text-gray-600">
                    {phraseSet?.phrases.length || 0} phrases
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Phrase Sets */}
        <div className="space-y-6">
          {config ? config.phraseSets.map((phraseSet, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {phraseSet.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {phraseSet.phrases.map((phrase, phraseIndex) => (
                  <div 
                    key={phraseIndex}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <span className="text-sm text-gray-500 mr-2">#{phraseIndex + 1}</span>
                    {phrase}
                  </div>
                ))}
              </div>
            </div>
          )) : null}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Update Phrases</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Edit the <code className="bg-blue-100 px-1 rounded">/config/phrases.json</code> file</li>
            <li>Add, remove, or modify phrase sets and individual phrases</li>
            <li>Update the metadata section with new counts and version</li>
            <li>Refresh this page to see changes and validate the configuration</li>
            <li>Test the assessment to ensure phrases pair correctly</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={loadConfig}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reload Configuration
          </button>
          <a
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
          >
            Back to Assessment
          </a>
        </div>
      </div>
    </div>
  )
}