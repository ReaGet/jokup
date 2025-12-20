'use client'

export default function Scoreboard({ scores, round }) {
  const title = round === 'FINAL' ? 'Final Results' : `Round ${round} Complete!`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500">
          <h2 className="text-3xl font-bold mb-6 text-center">Scoreboard</h2>
          <div className="space-y-4">
            {scores.map((player, index) => (
              <div
                key={player.id}
                className={`bg-gradient-to-r rounded-lg p-6 flex items-center justify-between transform transition-all duration-300 ${
                  index === 0
                    ? 'from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-400 scale-105'
                    : index === 1
                    ? 'from-gray-400/30 to-gray-500/30 border-2 border-gray-400'
                    : index === 2
                    ? 'from-orange-600/30 to-orange-700/30 border-2 border-orange-500'
                    : 'from-purple-600/30 to-purple-700/30 border border-purple-400'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${
                    index === 0 ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-2xl font-semibold">{player.name}</div>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
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
