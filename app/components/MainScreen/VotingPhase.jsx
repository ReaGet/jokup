'use client'

export default function VotingPhase({ currentMatchUp, voteCounts, isLastLash, lastLashAnswers, timeRemaining }) {
  if (!currentMatchUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-4xl text-gray-300 animate-pulse">Loading match-up...</div>
      </div>
    )
  }

  if (isLastLash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-5xl w-full space-y-6">
          {/* Timer */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500 text-center">
            <p className="text-2xl text-gray-300 mb-4">Time Remaining</p>
            <div className={`text-9xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {timeRemaining !== undefined ? timeRemaining : 30}
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center">
            <h2 className="text-4xl font-bold mb-2">Last Lash</h2>
            <p className="text-xl text-gray-300">{currentMatchUp.prompt}</p>
            <p className="text-sm text-gray-400 mt-2">Players picking up to 3 favorites</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lastLashAnswers.map((entry, idx) => (
              <div
                key={entry.index ?? idx}
                className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500"
              >
                <div className="text-xl text-gray-200 min-h-[80px]">{entry.answer}</div>
                {Array.isArray(voteCounts) && voteCounts[idx] && (
                  <div className="text-2xl font-bold text-yellow-400 mt-3">
                    {voteCounts[idx].votes || 0} votes
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-5xl w-full space-y-8">
        {/* Timer */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500 text-center">
          <p className="text-2xl text-gray-300 mb-4">Time Remaining</p>
          <div className={`text-9xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            {timeRemaining !== undefined ? timeRemaining : 30}
          </div>
        </div>
        
        {/* Prompt */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center">
          <h2 className="text-4xl font-bold mb-4">{currentMatchUp.prompt}</h2>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answer A */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="text-2xl font-bold text-blue-400 mb-4">Answer A</div>
            <div className="text-xl text-gray-200 mb-4 min-h-[100px] flex items-center justify-center">
              {currentMatchUp.answerA}
            </div>
            {voteCounts && (
              <div className="text-3xl font-bold text-blue-400 text-center">
                {voteCounts.A || 0} votes
              </div>
            )}
          </div>

          {/* Answer B */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-pink-500 transform hover:scale-105 transition-transform">
            <div className="text-2xl font-bold text-pink-400 mb-4">Answer B</div>
            <div className="text-xl text-gray-200 mb-4 min-h-[100px] flex items-center justify-center">
              {currentMatchUp.answerB}
            </div>
            {voteCounts && (
              <div className="text-3xl font-bold text-pink-400 text-center">
                {voteCounts.B || 0} votes
              </div>
            )}
          </div>
        </div>

        {/* Voting Status */}
        <div className="text-center text-2xl text-gray-300">
          {timeRemaining !== undefined && timeRemaining > 0 ? 'Cast your votes!' : 'Voting time has ended'}
        </div>
      </div>
    </div>
  )
}
