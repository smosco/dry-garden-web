import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Ground from './Ground'
import Rake from './Rake'
import RakeController from './RakeController'
import RakePatterns from './RakePatterns'
import DraggableAsset from './DraggableAsset'
import AssetRenderer from './AssetRenderer'
import { useGardenStore } from '../stores/useGardenStore'

/**
 * ZenGarden - Main 3D scene component
 * Provides the canvas, camera, lighting, and controls for the zen garden experience
 */
export default function ZenGarden() {
  const { assets, selectAsset } = useGardenStore()

  // Deselect asset when clicking on ground
  const handleGroundClick = () => {
    selectAsset(null)
  }
  return (
    <Canvas
      camera={{
        position: [0, 5, 10],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      shadows
      dpr={[1, 2]} // Device pixel ratio for crisp rendering
    >
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.4} />

      {/* Directional light (sun) for shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Soft fill light from below */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#8a7a6d"
        intensity={0.5}
      />

      {/* Environment map for realistic reflections */}
      <Environment preset="sunset" />

      {/* Camera controls - orbit around the garden */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2} // Prevent camera from going below ground
        target={[0, 0, 0]}
      />

      {/* Zen garden sand ground */}
      <Ground />

      {/* Rake patterns on the sand */}
      <RakePatterns />

      {/* Interactive rake */}
      <Rake />

      {/* Rake interaction controller */}
      <RakeController />

      {/* Dynamic garden assets - draggable and transformable */}
      {assets.map((asset) => (
        <DraggableAsset key={asset.id} asset={asset}>
          <AssetRenderer asset={asset} />
        </DraggableAsset>
      ))}

      {/* Clickable ground to deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onClick={handleGroundClick}
        visible={false}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Post-processing effects for meditative atmosphere */}
      <EffectComposer>
        {/* Soft bloom for dreamy light */}
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.ADD}
        />

        {/* Vignette for focus */}
        <Vignette
          offset={0.3}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />

        {/* Tone mapping (must be last) */}
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  )
}
