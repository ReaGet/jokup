'use client'

export default function Lobby({ playerName, players, isVIP, onStartGame }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Welcome Message */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 text-center">
          <h2 className="text-2xl font-bold mb-2">You joined as</h2>
          <div className="text-3xl font-bold text-yellow-400">{playerName}</div>
          {isVIP && (
            <div className="mt-4 text-lg text-yellow-400 font-semibold">⭐ You are the VIP</div>
          )}
        </div>

        {/* Player List */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold mb-4">Players ({players.length})</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-purple-600/30 rounded-lg p-3 flex items-center justify-between border border-purple-400"
              >
                <span className="font-semibold">{player.name}</span>
                {player.isVIP && (
                  <span className="text-xs text-yellow-400">VIP</span>
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
            className={`w-full py-4 rounded-lg text-xl font-bold transition-all transform ${
              players.length >= 3
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {players.length < 3 ? `Need ${3 - players.length} more player(s)` : 'Start Game'}
          </button>
        ) : (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
            <div className="text-xl text-yellow-400 animate-pulse">
              Waiting for VIP to start...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
