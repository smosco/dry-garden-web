import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../stores/useGardenStore'

/**
 * Rake - 3D model of the zen garden rake
 * Follows mouse position and creates patterns on the sand
 */
export default function Rake() {
  const rakeRef = useRef<THREE.Group>(null)
  const { rakePosition, isRaking } = useGardenStore()

  // Smoothly follow the rake position
  useFrame(() => {
    if (rakeRef.current) {
      rakeRef.current.position.lerp(rakePosition, 0.2)

      // Tilt the rake when raking
      const targetRotation = isRaking ? -Math.PI / 6 : 0
      rakeRef.current.rotation.x = THREE.MathUtils.lerp(
        rakeRef.current.rotation.x,
        targetRotation,
        0.1
      )
    }
  })

  return (
    <group ref={rakeRef} position={[0, 0.5, 0]}>
      {/* Rake handle (long wooden stick) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.8} />
      </mesh>

      {/* Rake head (horizontal bar) */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.8} />
      </mesh>

      {/* Rake teeth (multiple small prongs) */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = (i - 3) * 0.12
        return (
          <mesh
            key={i}
            position={[x, -0.35, 0]}
            rotation={[0, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
            <meshStandardMaterial color="#8b6f47" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}
