'use client'

export default function VotingPhase({ currentMatchUp, voteCounts, isLastLash, lastLashAnswers, timeRemaining }) {
  if (!currentMatchUp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="text-4xl animate-pulse" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>Loading match-up...</div>
      </div>
    )
  }

  if (isLastLash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="max-w-5xl w-full space-y-7">
          {/* Timer */}
          <div className="text-center rounded-[28px] p-6 md:p-8 lg:p-12 border" style={{ 
            background: 'rgba(25, 15, 60, 0.75)', 
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
          }}>
            <p className="text-2xl mb-4" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>Time Remaining</p>
            <div className={`text-9xl font-black ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : ''}`} style={{ 
              color: timeRemaining <= 10 ? undefined : '#22d3ee',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              {timeRemaining !== undefined ? timeRemaining : 30}
            </div>
          </div>
          
          <div className="text-center rounded-[28px] p-6 md:p-8 lg:p-12 border" style={{ 
            background: 'rgba(25, 15, 60, 0.75)', 
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
          }}>
            <h2 className="text-4xl font-black mb-2" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>Last Lash</h2>
            <p className="text-xl mb-2" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>{currentMatchUp.prompt}</p>
            <p className="text-sm mt-2" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>Players picking up to 3 favorites</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lastLashAnswers.map((entry, idx) => (
              <div
                key={entry.index ?? idx}
                className="rounded-[24px] p-6 border transition-all duration-150 hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(34, 211, 238, 0.35)',
                  boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22d3ee'
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.7)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.35)'
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
                }}
              >
                <div className="text-xl min-h-[80px] font-semibold" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>{entry.answer}</div>
                {Array.isArray(voteCounts) && voteCounts[idx] && (
                  <div className="text-2xl font-black mt-3" style={{ color: '#22d3ee', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <div className="max-w-5xl w-full space-y-8">
        {/* Timer */}
        <div className="text-center rounded-[28px] p-6 md:p-8 lg:p-12 border" style={{ 
          background: 'rgba(25, 15, 60, 0.75)', 
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}>
          <p className="text-2xl mb-4" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>Time Remaining</p>
          <div className={`text-9xl font-black ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : ''}`} style={{ 
            color: timeRemaining <= 10 ? undefined : '#22d3ee',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {timeRemaining !== undefined ? timeRemaining : 30}
          </div>
        </div>
        
        {/* Prompt */}
        <div className="text-center rounded-[28px] p-6 md:p-8 lg:p-12 border" style={{ 
          background: 'rgba(25, 15, 60, 0.75)', 
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}>
          <h2 className="text-4xl font-black mb-4" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>{currentMatchUp.prompt}</h2>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answer A */}
          <div className="rounded-[24px] p-6 md:p-8 border transition-all duration-150 hover:-translate-y-1" style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(34, 211, 238, 0.35)',
            boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#22d3ee'
            e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.35)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
          }}
          >
            <div className="text-2xl font-black mb-4" style={{ color: '#22d3ee', fontFamily: 'Inter, system-ui, sans-serif' }}>Answer A</div>
            <div className="text-xl mb-4 min-h-[100px] flex items-center justify-center font-semibold" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {currentMatchUp.answerA}
            </div>
            {voteCounts && (
              <div className="text-3xl font-black text-center" style={{ color: '#22d3ee', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {voteCounts.A || 0} votes
              </div>
            )}
          </div>

          {/* Answer B */}
          <div className="rounded-[24px] p-6 md:p-8 border transition-all duration-150 hover:-translate-y-1" style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.35)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#22d3ee'
            e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.35)'
          }}
          >
            <div className="text-2xl font-black mb-4" style={{ color: '#8b5cf6', fontFamily: 'Inter, system-ui, sans-serif' }}>Answer B</div>
            <div className="text-xl mb-4 min-h-[100px] flex items-center justify-center font-semibold" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {currentMatchUp.answerB}
            </div>
            {voteCounts && (
              <div className="text-3xl font-black text-center" style={{ color: '#8b5cf6', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {voteCounts.B || 0} votes
              </div>
            )}
          </div>
        </div>

        {/* Voting Status */}
        <div className="text-center text-2xl font-semibold" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {timeRemaining !== undefined && timeRemaining > 0 ? 'Cast your votes!' : 'Voting time has ended'}
        </div>
      </div>
    </div>
  )
}
