'use client'

export default function Scoreboard({ scores, playerId, round }) {
  const playerScore = scores.find(s => s.id === playerId)
  const playerRank = scores.findIndex(s => s.id === playerId) + 1
  const title = round === 'FINAL' ? 'Final Results' : `Round ${round} Complete`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <div className="w-full max-w-md space-y-[28px]">
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h2 className="text-[22px] font-black mb-4 text-[#f9fafb]">{title}</h2>
          <div className="text-[38px] font-black text-[#22d3ee] mb-2">#{playerRank}</div>
          <div className="text-[20px] text-[#c7d2fe]">Your Rank</div>
        </div>

        <div className="bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]">
          <h3 className="text-[20px] font-black mb-4 text-center text-[#f9fafb]">Your Score</h3>
          <div className="text-[64px] font-black text-[#22d3ee] text-center">
            {playerScore?.score || 0}
          </div>
        </div>

        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h3 className="text-[18px] font-black mb-4 text-[#f9fafb]">Leaderboard</h3>
          <div className="space-y-[20px]">
            {scores.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-[22px] rounded-[18px] transition-all duration-[0.15s] ease-in-out ${
                  player.id === playerId
                    ? 'bg-[rgba(34,211,238,0.2)] border border-[#22d3ee] shadow-[0_0_25px_rgba(34,211,238,0.35)]'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.35)] hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-[18px] font-black text-[#c7d2fe]">#{index + 1}</span>
                  <span className="font-semibold text-[#f9fafb] text-[18px]">{player.name}</span>
                </div>
                <span className="text-[18px] font-black text-[#22d3ee]">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
