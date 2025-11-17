import { useGardenStore, type MainToolType, type ToolType } from '../stores/useGardenStore'
import './Toolbar.css'

/**
 * Toolbar - Bottom toolbar for tool selection (Figma-style)
 * Main tools: Hand (camera navigation) and Rake (pattern drawing)
 */
export default function Toolbar() {
  const { mainTool, currentRakeTool, setMainTool, setRakeTool } = useGardenStore()

  const mainTools: Array<{ type: MainToolType; icon: string; label: string; shortcut: string }> = [
    { type: 'hand', icon: '✋', label: 'Hand', shortcut: 'H' },
    { type: 'move', icon: '⬆️', label: 'Move', shortcut: 'V' },
    { type: 'rake', icon: '🧹', label: 'Rake', shortcut: 'R' },
  ]

  const rakeTools: Array<{ type: ToolType; icon: string; label: string }> = [
    { type: 'straight', icon: '━', label: 'Straight' },
    { type: 'circular', icon: '⭕', label: 'Circular' },
    { type: 'wave', icon: '〜', label: 'Wave' },
  ]

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="main-tools">
          {mainTools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setMainTool(tool.type)}
              className={`toolbar-button ${mainTool === tool.type ? 'active' : ''}`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <span className="toolbar-icon">{tool.icon}</span>
              <span className="toolbar-label">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Show rake tools only when rake is selected */}
        {mainTool === 'rake' && (
          <>
            <div className="toolbar-divider" />
            <div className="rake-tools">
              {rakeTools.map((tool) => (
                <button
                  key={tool.type}
                  onClick={() => setRakeTool(tool.type)}
                  className={`toolbar-button small ${currentRakeTool === tool.type ? 'active' : ''}`}
                  title={tool.label}
                >
                  <span className="toolbar-icon">{tool.icon}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
