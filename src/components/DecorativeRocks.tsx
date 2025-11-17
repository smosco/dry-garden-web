import * as THREE from 'three'

/**
 * DecorativeRocks - Natural rocks scattered in the zen garden
 */
interface DecorativeRocksProps {
  position?: [number, number, number]
  count?: number
}

export default function DecorativeRocks({
  position = [0, 0, 0],
  count = 3,
}: DecorativeRocksProps) {
  const rocks = Array.from({ length: count }, (_, i) => {
    // Random but deterministic placement
    const seed = i * 123.456
    const angle = (seed * 7) % (Math.PI * 2)
    const distance = 0.3 + ((seed * 13) % 0.4)
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    const scale = 0.15 + ((seed * 17) % 0.15)
    const rotX = (seed * 11) % Math.PI
    const rotZ = (seed * 19) % Math.PI

    return { x, z, scale, rotX, rotZ, seed: i }
  })

  return (
    <group position={position}>
      {rocks.map((rock) => (
        <mesh
          key={rock.seed}
          position={[rock.x, rock.scale * 0.4, rock.z]}
          rotation={[rock.rotX, 0, rock.rotZ]}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0, 0, 0.25 + rock.seed * 0.05)}
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  )
}
