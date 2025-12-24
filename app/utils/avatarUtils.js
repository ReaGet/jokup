// Helper function to generate consistent color and shape based on player ID
export function getPlayerAvatarStyle(playerId) {
  const colors = [
    '#60A5FA', // light blue
    '#FBBF24', // yellow
    '#A78BFA', // purple
    '#34D399', // green
    '#F472B6', // pink
    '#FB923C', // orange
    '#818CF8', // indigo
    '#F87171', // red
  ]
  
  const shapes = ['circle', 'square', 'hexagon', 'blob']
  
  // Simple hash function for consistency
  let hash = 0
  for (let i = 0; i < playerId.length; i++) {
    hash = ((hash << 5) - hash) + playerId.charCodeAt(i)
    hash = hash & hash
  }
  
  const colorIndex = Math.abs(hash) % colors.length
  const shapeIndex = Math.abs(hash >> 8) % shapes.length
  
  return {
    color: colors[colorIndex],
    shape: shapes[shapeIndex],
    hash: Math.abs(hash)
  }
}

// Avatar component with colored blob/shape
export function PlayerAvatar({ playerId, isVIP, size = 'w-20 h-20' }) {
  const { color, shape, hash } = getPlayerAvatarStyle(playerId)
  
  // Determine facial expression based on hash
  const isHappy = (hash % 2) === 0
  
  const getShapeStyle = () => {
    switch(shape) {
      case 'circle':
        return { borderRadius: '50%' }
      case 'square':
        return { borderRadius: '8px' }
      case 'hexagon':
        return { 
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' 
        }
      case 'blob':
        return { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }
      default:
        return { borderRadius: '50%' }
    }
  }
  
  return (
    <div 
      className={`${size} relative`}
      style={{ 
        backgroundColor: color,
        ...getShapeStyle()
      }}
    >
      {/* Simple face features */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Eyes */}
        <div className="flex gap-2 mb-1">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        {/* Mouth */}
        <div 
          className={`w-4 h-2 border-2 border-black rounded-b-full ${isHappy ? '' : 'rotate-180'}`}
          style={{ borderTop: 'none' }}
        ></div>
      </div>
    </div>
  )
}



