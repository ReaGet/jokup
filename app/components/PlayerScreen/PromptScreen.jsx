'use client'

import { useState, useEffect } from 'react'
import SettingsButton from './SettingsButton'

export default function PromptScreen({ prompts, timer, onAnswerSubmit, timerExpired, isVIP, onOpenSettings }) {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="text-[20px] text-[#c7d2fe]">Loading prompt...</div>
      </div>
    )
  }

  const currentPrompt = prompts[currentPromptIndex]
  const isLastPrompt = currentPromptIndex === prompts.length - 1

  // Show waiting message if all prompts are answered
  if (allPromptsAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center max-w-2xl shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <div className="text-[38px] font-black text-[#22d3ee] mb-4">✓ All Answers Submitted!</div>
          <div className="text-[20px] text-[#c7d2fe] animate-pulse">Waiting for other players...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
      <div className="w-full max-w-2xl space-y-[28px]">
        {/* Timer */}
        <div className="bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border border-[rgba(139,92,246,0.35)] text-center shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]">
          <div className="text-[14px] text-[#c7d2fe] mb-2">Time Remaining</div>
          <div className={`text-6xl font-black ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-[#22d3ee]'}`}>
            {timeRemaining}
          </div>
          <div className="text-[14px] text-[#c7d2fe] mt-2">
            {currentPromptIndex + 1}/{prompts.length}
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]">
          <h2 className="text-[22px] font-semibold text-center text-[#f9fafb]">{currentPrompt.text}</h2>
        </div>

        {/* Answer Input */}
        <div className="bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]">
          <label className="block text-[#c7d2fe] mb-3 font-semibold text-[18px]">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isExpired}
            className="w-full px-4 py-3 bg-[rgba(25,15,60,0.75)] border border-[rgba(139,92,246,0.35)] rounded-[18px] text-[#f9fafb] text-[18px] min-h-[120px] focus:outline-none focus:border-[#22d3ee] focus:shadow-[0_0_25px_rgba(34,211,238,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            placeholder="Type your funny answer here..."
            maxLength={200}
          />
          <div className="text-right text-[14px] text-[#c7d2fe] mt-2">
            {answer.length} / 200
          </div>
        </div>

        {/* Submit Button */}
        {!isExpired ? (
          <button
            onClick={handleSubmit}
            className="w-full text-[#f9fafb] font-black py-[28px] rounded-[18px] text-[30px] transition-all duration-[0.15s] ease-in-out transform hover:translate-y-[-3px] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)] shadow-[0_0_40px_rgba(34,211,238,0.45)]"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)' }}
          >
            {isLastPrompt ? 'Submit Answer' : 'Submit & Next Prompt'}
          </button>
        ) : (
          <div className="w-full bg-[rgba(255,255,255,0.04)] border border-red-500 rounded-[18px] p-[22px] text-center text-red-300">
            Time's up! Your answer has been submitted.
          </div>
        )}
      </div>
    </div>
  )
}
