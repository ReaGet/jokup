'use client'

import { useState, useEffect } from 'react'

export default function PromptScreen({ prompts, timer, onAnswerSubmit, timerExpired }) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(timer)
  const [isExpired, setIsExpired] = useState(false)
  const [allPromptsAnswered, setAllPromptsAnswered] = useState(false)

  useEffect(() => {
    setTimeRemaining(timer)
    setIsExpired(false)
  }, [timer])

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true)
      // Auto-submit empty answer if timer expires
      if (currentPromptIndex < prompts.length - 1) {
        // Move to next prompt with empty answer
        onAnswerSubmit(prompts[currentPromptIndex].id, '')
        setCurrentPromptIndex(currentPromptIndex + 1)
        setAnswer('')
      } else if (currentPromptIndex === prompts.length - 1) {
        // Last prompt, submit empty
        onAnswerSubmit(prompts[currentPromptIndex].id, '')
        setAllPromptsAnswered(true)
      }
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, currentPromptIndex, prompts, onAnswerSubmit])

  const handleSubmit = () => {
    if (isExpired) return

    const currentPrompt = prompts[currentPromptIndex]
    const isLastPrompt = currentPromptIndex === prompts.length - 1
    
    if (!answer.trim() && !isLastPrompt) {
      // Allow empty answer to move to next prompt
      onAnswerSubmit(currentPrompt.id, '')
      setCurrentPromptIndex(currentPromptIndex + 1)
      setAnswer('')
    } else if (!isLastPrompt) {
      // Submit and move to next prompt
      onAnswerSubmit(currentPrompt.id, answer.trim())
      setCurrentPromptIndex(currentPromptIndex + 1)
      setAnswer('')
    } else {
      // Last prompt
      onAnswerSubmit(currentPrompt.id, answer.trim())
      setAllPromptsAnswered(true)
    }
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-2xl text-gray-300">Loading prompt...</div>
      </div>
    )
  }

  const currentPrompt = prompts[currentPromptIndex]
  const isLastPrompt = currentPromptIndex === prompts.length - 1

  // Show waiting message if all prompts are answered
  if (allPromptsAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500 text-center max-w-2xl">
          <div className="text-4xl font-bold text-yellow-400 mb-4">✓ All Answers Submitted!</div>
          <div className="text-2xl text-gray-300 animate-pulse">Waiting for other players...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Timer */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
          <div className="text-sm text-gray-300 mb-2">Time Remaining</div>
          <div className={`text-6xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            {timeRemaining}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {currentPromptIndex + 1}/{prompts.length}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500">
          <h2 className="text-2xl font-bold text-center mb-4">{currentPrompt.text}</h2>
        </div>

        {/* Answer Input */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500">
          <label className="block text-gray-300 mb-3 font-semibold">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isExpired}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-blue-500 rounded-lg text-white text-lg min-h-[120px] focus:outline-none focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Type your funny answer here..."
            maxLength={200}
          />
          <div className="text-right text-sm text-gray-400 mt-2">
            {answer.length} / 200
          </div>
        </div>

        {/* Submit Button */}
        {!isExpired ? (
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            {isLastPrompt ? 'Submit Answer' : 'Submit & Next Prompt'}
          </button>
        ) : (
          <div className="w-full bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-center text-red-300">
            Time's up! Your answer has been submitted.
          </div>
        )}
      </div>
    </div>
  )
}
