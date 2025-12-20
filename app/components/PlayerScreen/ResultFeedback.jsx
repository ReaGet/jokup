'use client'

export default function ResultFeedback({ results, playerId, isLastLash }) {
  if (isLastLash) {
    const playerResult = Array.isArray(results) ? results.find(r => r.playerId === playerId) : null
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center space-y-6">
          <h2 className="text-3xl font-bold">Last Lash Results</h2>
          {playerResult ? (
            <div>
              <div className="text-2xl text-gray-300 mb-2">Your answer earned</div>
              <div className="text-5xl font-bold text-yellow-400">{playerResult.votes || 0}</div>
              <div className="text-xl text-gray-400 mt-2">votes</div>
            </div>
          ) : (
            <div className="text-xl text-gray-300">Loading results...</div>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500 text-center">
          <div className="text-xl text-gray-300">You voted for the winner!</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center space-y-6">
        <h2 className="text-3xl font-bold">Your Result</h2>
        <div>
          <div className="text-2xl text-gray-300 mb-2">Your answer earned</div>
          <div className="text-5xl font-bold text-yellow-400">{playerVotes}</div>
          <div className="text-xl text-gray-400 mt-2">votes</div>
        </div>
        {isJokUp && (
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400 animate-pulse">JOKUP! 🎉</div>
            <div className="text-lg text-gray-300 mt-2">Unanimous win!</div>
          </div>
        )}
        {isWinner && !isJokUp && (
          <div className="text-xl text-green-400 font-semibold">You won this match-up!</div>
        )}
      </div>
    </div>
  )
}
