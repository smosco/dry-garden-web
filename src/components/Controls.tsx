import { useState } from 'react'
import { useGardenStore } from '../stores/useGardenStore'
import './Controls.css'

/**
 * Controls - UI panel for garden interaction
 * Provides buttons to clear patterns, select tools, and control audio
 */
export default function Controls() {
  const {
    clearPaths,
    rakePaths,
    selectedAssetId,
    deleteAsset,
    assets,
  } = useGardenStore()
  const [isPlaying, setIsPlaying] = useState(false)

  const handleClearPatterns = () => {
    clearPaths()
  }

  const handleDeleteAsset = () => {
    if (selectedAssetId) {
      deleteAsset(selectedAssetId)
    }
  }

  const toggleMusic = () => {
    setIsPlaying(!isPlaying)
  }

  const selectedAsset = assets.find((a) => a.id === selectedAssetId)

  return (
    <div className="controls">
      <div className="controls-title">Zen Garden</div>

      {/* Pattern Management */}
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

      {/* Asset Management */}
      {selectedAsset && (
        <div className="controls-section asset-section">
          <div className="controls-subtitle">Selected Asset</div>
          <div className="controls-info">
            <span>{selectedAsset.type.replace('-', ' ')}</span>
          </div>
          <button
            onClick={handleDeleteAsset}
            className="control-button delete-button"
            title="Delete selected asset"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Music Control */}
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
        Use toolbar to switch tools
      </div>
    </div>
  )
}
