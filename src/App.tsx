import ZenGarden from './components/ZenGarden'
import Controls from './components/Controls'
import AssetPalette from './components/AssetPalette'
import Toolbar from './components/Toolbar'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ZenGarden />
      <AssetPalette />
      <Controls />
      <Toolbar />
    </div>
  )
}

export default App
