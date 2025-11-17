import { useState } from 'react'
import { useGardenStore, AssetType } from '../stores/useGardenStore'
import './AssetPalette.css'

/**
 * AssetPalette - UI panel for adding new assets to the garden
 */
export default function AssetPalette() {
  const { addAsset } = useGardenStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const assetTypes: Array<{ type: AssetType; icon: string; label: string }> = [
    { type: 'stone-tower', icon: '🗼', label: 'Stone Tower' },
    { type: 'rocks', icon: '🪨', label: 'Rocks' },
    { type: 'bamboo', icon: '🎋', label: 'Bamboo' },
    { type: 'stone-lantern', icon: '🏮', label: 'Lantern' },
    { type: 'pond', icon: '🌊', label: 'Pond' },
    { type: 'bridge', icon: '🌉', label: 'Bridge' },
  ]

  const handleAddAsset = (type: AssetType) => {
    // Add asset at a random position near center
    const x = (Math.random() - 0.5) * 6
    const z = (Math.random() - 0.5) * 6
    addAsset(type, [x, 0, z])
  }

  return (
    <div className={`asset-palette ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="palette-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse' : 'Expand'}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      {isExpanded && (
        <>
          <div className="palette-title">Garden Assets</div>

          <div className="palette-categories">
            <div className="palette-category">
              <div className="category-title">Stone Elements</div>
              <div className="asset-grid">
                {assetTypes
                  .filter((a) => a.type.includes('stone') || a.type.includes('rocks'))
                  .map((asset) => (
                    <button
                      key={asset.type}
                      className="asset-button"
                      onClick={() => handleAddAsset(asset.type)}
                      title={`Add ${asset.label}`}
                    >
                      <span className="asset-icon">{asset.icon}</span>
                      <span className="asset-label">{asset.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="palette-category">
              <div className="category-title">Plants</div>
              <div className="asset-grid">
                {assetTypes
                  .filter((a) => a.type === 'bamboo')
                  .map((asset) => (
                    <button
                      key={asset.type}
                      className="asset-button"
                      onClick={() => handleAddAsset(asset.type)}
                      title={`Add ${asset.label}`}
                    >
                      <span className="asset-icon">{asset.icon}</span>
                      <span className="asset-label">{asset.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="palette-category">
              <div className="category-title">Water Features</div>
              <div className="asset-grid">
                {assetTypes
                  .filter((a) => a.type === 'pond' || a.type === 'bridge')
                  .map((asset) => (
                    <button
                      key={asset.type}
                      className="asset-button"
                      onClick={() => handleAddAsset(asset.type)}
                      title={`Add ${asset.label}`}
                    >
                      <span className="asset-icon">{asset.icon}</span>
                      <span className="asset-label">{asset.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="palette-hint">
            Click to add to garden
          </div>
        </>
      )}
    </div>
  )
}
