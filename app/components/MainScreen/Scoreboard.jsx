'use client'

export default function Scoreboard({ scores, round }) {
  const title = round === 'FINAL' ? 'Final Results' : `Round ${round} Complete!`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#1b0f3b,#0b0618_70%)] p-12">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center">
          <h1 className="text-[64px] font-black mb-4 bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] bg-clip-text text-transparent tracking-wide">
            {title}
          </h1>
        </div>

        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-12 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h2 className="text-[30px] font-black mb-8 text-center text-[#f9fafb]">Scoreboard</h2>
          <div className="space-y-4">
            {scores.map((player, index) => (
              <div
                key={player.id}
                className={`bg-[rgba(255,255,255,0.04)] rounded-[18px] p-6 flex items-center justify-between border transition-all duration-[150ms] ease ${
                  index === 0
                    ? 'border-[#22d3ee] shadow-[0_0_25px_rgba(34,211,238,0.35)] scale-105'
                    : 'border-[rgba(139,92,246,0.35)] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:-translate-y-[2px]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-black ${
                    index === 0 ? 'text-[#22d3ee]' : 'text-[#f9fafb]'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-2xl font-semibold text-[#f9fafb]">{player.name}</div>
                </div>
                <div className="text-3xl font-black text-[#22d3ee]">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
