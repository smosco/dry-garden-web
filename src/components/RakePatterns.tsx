import { useMemo } from 'react'
import * as THREE from 'three'
import { useGardenStore } from '../stores/useGardenStore'
import { Line } from '@react-three/drei'

/**
 * RakePatterns - Visualizes the rake patterns on the sand
 * Creates geometric lines representing the rake marks
 */
export default function RakePatterns() {
  const { rakePaths, currentPath, isRaking } = useGardenStore()

  // Number of teeth on the rake (must match Rake component)
  const numTeeth = 7
  const toothSpacing = 0.12

  /**
   * Generate parallel lines for each rake path
   * Each path gets multiple lines to represent rake teeth
   */
  const renderRakePath = (points: THREE.Vector3[], key: string, opacity: number = 0.8) => {
    if (points.length < 2) return null

    return (
      <group key={key}>
        {Array.from({ length: numTeeth }).map((_, toothIndex) => {
          const offset = (toothIndex - (numTeeth - 1) / 2) * toothSpacing

          // Create offset points for this tooth
          const offsetPoints = points.map((point) => {
            // Offset perpendicular to the rake direction
            // For simplicity, offset along X axis
            return new THREE.Vector3(point.x + offset, point.y + 0.01, point.z)
          })

          return (
            <Line
              key={toothIndex}
              points={offsetPoints}
              color="#6b5d4f"
              lineWidth={2}
              opacity={opacity}
              transparent
              dashed={false}
            />
          )
        })}
      </group>
    )
  }

  return (
    <>
      {/* Render all completed rake paths */}
      {rakePaths.map((path, index) =>
        renderRakePath(path.points, `path-${index}-${path.timestamp}`, 0.7)
      )}

      {/* Render current path being drawn */}
      {isRaking && currentPath.length >= 2 && renderRakePath(currentPath, 'current-path', 1.0)}
    </>
  )
}
