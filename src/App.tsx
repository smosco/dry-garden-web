import ZenGarden from './components/ZenGarden'
import Controls from './components/Controls'
import AssetPalette from './components/AssetPalette'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ZenGarden />
      <AssetPalette />
      <Controls />
    </div>
  )
}

export default App
