import * as THREE from 'three'

/**
 * StoneTower - Japanese-style stone pagoda
 * Traditional zen garden element made of stacked stones
 */
interface StoneTowerProps {
  position?: [number, number, number]
  scale?: number
}

export default function StoneTower({
  position = [0, 0, 0],
  scale = 1,
}: StoneTowerProps) {
  // Stone material with variation
  const stoneMaterial = (darkness: number) => (
    <meshStandardMaterial
      color={new THREE.Color().setHSL(0, 0, 0.3 + darkness * 0.1)}
      roughness={0.9}
      metalness={0.1}
    />
  )

  return (
    <group position={position} scale={scale}>
      {/* Base stone - wide and flat */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.65, 0.3, 8]} />
        {stoneMaterial(0)}
      </mesh>

      {/* Second layer - slightly smaller */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.25, 8]} />
        {stoneMaterial(0.1)}
      </mesh>

      {/* Third layer - getting narrower */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.2, 8]} />
        {stoneMaterial(0.2)}
      </mesh>

      {/* Fourth layer - smaller */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 8]} />
        {stoneMaterial(0.3)}
      </mesh>

      {/* Fifth layer - top piece */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.12, 6]} />
        {stoneMaterial(0.4)}
      </mesh>

      {/* Cap - pointed top */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.15, 0.25, 6]} />
        {stoneMaterial(0.5)}
      </mesh>
    </group>
  )
}
