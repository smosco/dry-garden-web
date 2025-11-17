import * as THREE from 'three'

/**
 * Bamboo - Simple bamboo stalks for zen garden decoration
 */
interface BambooProps {
  position?: [number, number, number]
  height?: number
  count?: number
}

export default function Bamboo({
  position = [0, 0, 0],
  height = 2,
  count = 3,
}: BambooProps) {
  const bambooColor = new THREE.Color('#4a5f3a')
  const segmentHeight = 0.4

  const stalks = Array.from({ length: count }, (_, i) => ({
    x: (i - (count - 1) / 2) * 0.15,
    heightVariation: 0.7 + Math.random() * 0.3,
  }))

  return (
    <group position={position}>
      {stalks.map((stalk, stalkIndex) => {
        const stalkHeight = height * stalk.heightVariation
        const numSegments = Math.floor(stalkHeight / segmentHeight)

        return (
          <group key={stalkIndex} position={[stalk.x, 0, 0]}>
            {/* Bamboo stalk - main cylinder */}
            <mesh position={[0, stalkHeight / 2, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, stalkHeight, 8]} />
              <meshStandardMaterial
                color={bambooColor}
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>

            {/* Bamboo segments (rings) */}
            {Array.from({ length: numSegments }).map((_, segIndex) => (
              <mesh
                key={segIndex}
                position={[0, segIndex * segmentHeight + 0.1, 0]}
                castShadow
              >
                <torusGeometry args={[0.05, 0.015, 8, 8]} />
                <meshStandardMaterial
                  color={bambooColor.clone().multiplyScalar(0.8)}
                  roughness={0.7}
                />
              </mesh>
            ))}

            {/* Simple leaves at top */}
            {[0, 1, 2].map((leafIndex) => {
              const angle = (leafIndex * Math.PI * 2) / 3
              return (
                <mesh
                  key={`leaf-${leafIndex}`}
                  position={[
                    Math.cos(angle) * 0.1,
                    stalkHeight + 0.1,
                    Math.sin(angle) * 0.1,
                  ]}
                  rotation={[Math.PI / 6, angle, 0]}
                  castShadow
                >
                  <planeGeometry args={[0.15, 0.4]} />
                  <meshStandardMaterial
                    color="#5a7f4a"
                    roughness={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}
