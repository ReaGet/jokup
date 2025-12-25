'use client'

export default function Lobby({ playerName, players, isVIP, onStartGame }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#1b0f3b,#0b0618_70%)] p-12">
      <div className="w-full max-w-md space-y-8">
        {/* Welcome Message */}
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-8 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)] text-center">
          <h2 className="text-[22px] font-semibold mb-4 text-[#c7d2fe]">You joined as</h2>
          <div className="text-3xl font-black text-[#22d3ee]">{playerName}</div>
          {isVIP && (
            <div className="mt-6 text-lg text-[#22d3ee] font-semibold">⭐ You are the VIP</div>
          )}
        </div>

        {/* Player List */}
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-8 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h3 className="text-[22px] font-semibold mb-6 text-[#f9fafb]">Players ({players.length})</h3>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-[rgba(255,255,255,0.04)] rounded-[18px] p-4 flex items-center justify-between border border-[rgba(139,92,246,0.35)] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:-translate-y-[2px] transition-all duration-[150ms] ease"
              >
                <span className="font-semibold text-[#f9fafb]">{player.name}</span>
                {player.isVIP && (
                  <span className="text-xs text-[#22d3ee] font-semibold">VIP</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button or Waiting Message */}
        {isVIP ? (
          <button
            onClick={onStartGame}
            disabled={players.length < 3}
            className={`w-full py-7 rounded-[18px] text-[30px] font-black transition-all duration-[150ms] ease ${
              players.length >= 3
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] hover:-translate-y-[3px] text-[#f9fafb] shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)]'
                : 'bg-[rgba(255,255,255,0.04)] text-[#c7d2fe] cursor-not-allowed border border-[rgba(139,92,246,0.35)]'
            }`}
          >
            {players.length < 3 ? `Need ${3 - players.length} more player(s)` : 'Start Game'}
          </button>
        ) : (
          <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-8 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)] text-center">
            <div className="text-xl text-[#22d3ee] animate-pulse font-semibold">
              Waiting for VIP to start...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
