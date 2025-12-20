'use client'

export default function Scoreboard({ scores, playerId, round }) {
  const playerScore = scores.find(s => s.id === playerId)
  const playerRank = scores.findIndex(s => s.id === playerId) + 1
  const title = round === 'FINAL' ? 'Final Results' : `Round ${round} Complete`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="text-4xl font-bold text-yellow-400 mb-2">#{playerRank}</div>
          <div className="text-xl text-gray-300">Your Rank</div>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold mb-4 text-center">Your Score</h3>
          <div className="text-5xl font-bold text-yellow-400 text-center">
            {playerScore?.score || 0}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500">
          <h3 className="text-lg font-bold mb-4">Leaderboard</h3>
          <div className="space-y-2">
            {scores.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === playerId
                    ? 'bg-yellow-500/30 border-2 border-yellow-400'
                    : 'bg-purple-600/30 border border-purple-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-300">#{index + 1}</span>
                  <span className="font-semibold">{player.name}</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
