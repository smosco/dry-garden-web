import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../stores/useGardenStore'

/**
 * RakeController - Handles mouse/touch interaction for raking
 * Uses raycasting to translate 2D input to 3D garden space
 */
export default function RakeController() {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const groundPlane = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectionPoint = useRef(new THREE.Vector3())

  const { startRaking, updateRaking, stopRaking } = useGardenStore()

  useEffect(() => {
    const canvas = gl.domElement

    // Handle mouse/touch move
    const handlePointerMove = (event: PointerEvent) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera)

      // Find intersection with ground plane
      if (raycaster.current.ray.intersectPlane(groundPlane.current, intersectionPoint.current)) {
        // Clamp to garden bounds
        const x = THREE.MathUtils.clamp(intersectionPoint.current.x, -9, 9)
        const z = THREE.MathUtils.clamp(intersectionPoint.current.z, -9, 9)
        const position = new THREE.Vector3(x, 0.2, z)

        // Update rake position if raking
        const isRaking = useGardenStore.getState().isRaking
        if (isRaking) {
          updateRaking(position)
        } else {
          // Update position even when not raking (for rake following cursor)
          useGardenStore.setState({ rakePosition: position })
        }
      }
    }

    // Handle pointer down (start raking)
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return // Only left click

      const state = useGardenStore.getState()

      // Don't start raking if rake tool is not selected or if an asset is being dragged
      if (state.mainTool !== 'rake' || state.isDraggingAsset) return

      raycaster.current.setFromCamera(mouse.current, camera)

      if (raycaster.current.ray.intersectPlane(groundPlane.current, intersectionPoint.current)) {
        const x = THREE.MathUtils.clamp(intersectionPoint.current.x, -9, 9)
        const z = THREE.MathUtils.clamp(intersectionPoint.current.z, -9, 9)
        const position = new THREE.Vector3(x, 0.2, z)
        startRaking(position)
      }
    }

    // Handle pointer up (stop raking)
    const handlePointerUp = () => {
      stopRaking()
    }

    // Add event listeners
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerleave', handlePointerUp)

    // Cleanup
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerleave', handlePointerUp)
    }
  }, [camera, gl, startRaking, updateRaking, stopRaking])

  return null // This component doesn't render anything
}
