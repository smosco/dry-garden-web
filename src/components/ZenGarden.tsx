import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

/**
 * ZenGarden - Main 3D scene component
 * Provides the canvas, camera, lighting, and controls for the zen garden experience
 */
export default function ZenGarden() {
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

      {/* Temporary ground plane for testing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d4c5b0" />
      </mesh>

      {/* Temporary test sphere */}
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.3} metalness={0.1} />
      </mesh>
    </Canvas>
  )
}
