'use client'

import SettingsButton from './SettingsButton'

export default function ResultFeedback({ results, playerId, isLastLash, isVIP, onOpenSettings }) {
  if (isLastLash) {
    const playerResult = Array.isArray(results) ? results.find(r => r.playerId === playerId) : null
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
        <div className="w-full max-w-md bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center space-y-[28px] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h2 className="text-[30px] font-black text-[#f9fafb]">Last Lash Results</h2>
          {playerResult ? (
            <div>
              <div className="text-[20px] text-[#c7d2fe] mb-2">Your answer earned</div>
              <div className="text-[64px] font-black text-[#22d3ee]">{playerResult.votes || 0}</div>
              <div className="text-[20px] text-[#c7d2fe] mt-2">votes</div>
            </div>
          ) : (
            <div className="text-[20px] text-[#c7d2fe]">Loading results...</div>
          )}
        </div>
      </div>
    )
  }

  // Regular match-up results
  const isPlayerA = results?.players?.[0] === playerId
  const isPlayerB = results?.players?.[1] === playerId
  const playerVotes = isPlayerA ? results.voteCounts.A : (isPlayerB ? results.voteCounts.B : 0)
  const isWinner = (isPlayerA && results.voteCounts.A > results.voteCounts.B) ||
                   (isPlayerB && results.voteCounts.B > results.voteCounts.A)
  const isJokUp = results.isJokUp && (results.jokUpPlayer === playerId)

  if (!isPlayerA && !isPlayerB) {
    // Player wasn't in this match-up
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
        <div className="bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border border-[rgba(139,92,246,0.35)] text-center shadow-[0_0_25px_rgba(139,92,246,0.35)]">
          <div className="text-[20px] text-[#c7d2fe]">You voted for the winner!</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
      <div className="w-full max-w-md bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center space-y-[28px] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
        <h2 className="text-[30px] font-black text-[#f9fafb]">Your Result</h2>
        <div>
          <div className="text-[20px] text-[#c7d2fe] mb-2">Your answer earned</div>
          <div className="text-[64px] font-black text-[#22d3ee]">{playerVotes}</div>
          <div className="text-[20px] text-[#c7d2fe] mt-2">votes</div>
        </div>
        {isJokUp && (
          <div className="bg-[rgba(34,211,238,0.2)] border border-[#22d3ee] rounded-[18px] p-[22px] shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="text-[30px] font-black text-[#22d3ee] animate-pulse">JOKUP! 🎉</div>
            <div className="text-[18px] text-[#c7d2fe] mt-2">Unanimous win!</div>
          </div>
        )}
        {isWinner && !isJokUp && (
          <div className="text-[20px] text-[#22d3ee] font-semibold">You won this match-up!</div>
        )}
      </div>
    </div>
  )
}
