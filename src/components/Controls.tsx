import { useState } from 'react'
import { useGardenStore } from '../stores/useGardenStore'
import './Controls.css'

/**
 * Controls - UI panel for garden interaction
 * Provides buttons to clear patterns and control audio
 */
export default function Controls() {
  const { clearPaths, rakePaths } = useGardenStore()
  const [isPlaying, setIsPlaying] = useState(false)

  const handleClearPatterns = () => {
    clearPaths()
  }

  const toggleMusic = () => {
    // For now, just toggle state (actual audio implementation would go here)
    setIsPlaying(!isPlaying)

    // In a real implementation, you would:
    // if (!isPlaying) { audio.play() } else { audio.pause() }
  }

  return (
    <div className="controls">
      <div className="controls-title">Zen Garden</div>

      <div className="controls-section">
        <div className="controls-info">
          <span>Patterns: {rakePaths.length}</span>
        </div>

        <button
          onClick={handleClearPatterns}
          disabled={rakePaths.length === 0}
          className="control-button"
          title="Clear all rake patterns"
        >
          Clear Patterns
        </button>
      </div>

      <div className="controls-section">
        <button
          onClick={toggleMusic}
          className="control-button"
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? '⏸ Pause Music' : '▶ Play Music'}
        </button>
      </div>

      <div className="controls-hint">
        Click and drag to rake the sand
      </div>
    </div>
  )
}
