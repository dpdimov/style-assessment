'use client'

import { useState, useEffect, useRef } from 'react'

interface AssessmentSliderProps {
  questionId: string
  leftPhrase: string
  rightPhrase: string
  onValueChange: (value: number, questionId: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export default function AssessmentSlider({ 
  questionId, 
  leftPhrase,
  rightPhrase,
  onValueChange, 
  onSubmit, 
  disabled = false 
}: AssessmentSliderProps) {
  const [value, setValue] = useState<number>(5) // Middle value (5 out of 0-10)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [columns, setColumns] = useState<boolean[]>(new Array(10).fill(false))
  const sliderRef = useRef<HTMLInputElement>(null)

  const updateColumns = (sliderValue: number) => {
    const newColumns = new Array(10).fill(false)
    
    console.log('Slider value:', sliderValue)

    // Slider range is 0-10, where 5 is neutral
    if (sliderValue === 5) {
      // Neutral position - no highlighting, submit disabled
      setIsActive(false)
      setColumns(newColumns)
      return
    }

    setIsActive(true)
    
    if (sliderValue < 5) {
      // Left side: highlight from sliderValue to 4
      for (let i = sliderValue; i < 5; i++) {
        newColumns[i] = true
      }
    } else if (sliderValue > 5) {
      // Right side: highlight from 5 to sliderValue-1
      for (let i = 5; i < sliderValue; i++) {
        newColumns[i] = true
      }
    }
    
    setColumns(newColumns)
  }

  // Convert slider value (0-10) to original range (0-300) for API compatibility
  const convertToOriginalRange = (sliderVal: number): number => {
    if (sliderVal === 5) return 150 // Neutral
    if (sliderVal < 5) return sliderVal * 10 // 0-4 -> 0-40
    return 200 + (sliderVal - 6) * 10 // 6-10 -> 200-240
  }

  const handleSliderChange = (newValue: number) => {
    setValue(newValue)
    updateColumns(newValue)
    onValueChange(convertToOriginalRange(newValue), questionId)
  }

  const handleColumnClick = (columnIndex: number) => {
    if (disabled) return
    
    // Direct mapping: column index maps to slider value
    // Column 0 = slider 0, Column 1 = slider 1, ..., Column 9 = slider 10
    // But we need to skip position 5 (neutral)
    let newValue: number
    
    if (columnIndex < 5) {
      // Left columns 0-4 map to slider values 0-4
      newValue = columnIndex
    } else {
      // Right columns 5-9 map to slider values 6-10 (skipping 5)
      newValue = columnIndex + 1
    }
    
    console.log('Column clicked:', columnIndex, 'New slider value:', newValue)
    
    setValue(newValue)
    updateColumns(newValue)
    onValueChange(convertToOriginalRange(newValue), questionId)
    
    // Update the slider input
    if (sliderRef.current) {
      sliderRef.current.value = newValue.toString()
    }
  }

  const handleSubmit = () => {
    if (isActive && !disabled) {
      onSubmit()
    }
  }

  useEffect(() => {
    updateColumns(value)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Phrases positioned around the slider */}
      <div className="phrase-container mb-4">
        <div className="phrase left">{leftPhrase}</div>
        <div className="phrase right">{rightPhrase}</div>
      </div>

      {/* Visual Columns with original styling */}
      <div className="colums-wrapper">
        {columns.map((isColumnActive, index) => (
          <div
            key={index}
            className={`column ${isColumnActive ? 'active' : ''}`}
            data-id={index}
            onClick={() => handleColumnClick(index)}
          />
        ))}
      </div>

      {/* Range Slider */}
      <div className="range-wrapper">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          className={`range ${isActive ? 'active' : ''}`}
          disabled={disabled}
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          id="range-submit"
          onClick={handleSubmit}
          disabled={!isActive || disabled}
          className={`range-submit ${isActive && !disabled ? 'active' : ''}`}
        >
          Next &gt;&gt;
        </button>
      </div>
    </div>
  )
}