import { useRef, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Ground - Zen garden sand/gravel surface
 * Features:
 * - Realistic sand texture with procedural noise
 * - Displacement map for height variation
 * - Will support rake pattern rendering
 */
export default function Ground() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create procedural sand texture using canvas
  const sandTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Base sand color
    ctx.fillStyle = '#d4c5b0'
    ctx.fillRect(0, 0, 512, 512)

    // Add noise for sand grain texture
    const imageData = ctx.getImageData(0, 0, 512, 512)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 30 - 15
      data[i] += noise     // R
      data[i + 1] += noise // G
      data[i + 2] += noise // B
    }

    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)

    return texture
  }, [])

  // Create displacement map for subtle surface variation
  const displacementMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // Create subtle height variation
    ctx.fillStyle = '#888888'
    ctx.fillRect(0, 0, 256, 256)

    // Add random bumps for natural sand look
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const radius = Math.random() * 20 + 10
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)

      gradient.addColorStop(0, '#999999')
      gradient.addColorStop(1, '#888888')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)

    return texture
  }, [])

  // Create normal map for lighting detail
  const normalMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // Normal map base (facing up = light blue)
    ctx.fillStyle = '#8080ff'
    ctx.fillRect(0, 0, 256, 256)

    // Add subtle normal variations
    const imageData = ctx.getImageData(0, 0, 256, 256)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 10 - 5
      data[i] = 128 + noise     // R (X)
      data[i + 1] = 128 + noise // G (Y)
      data[i + 2] = 255         // B (Z - pointing up)
    }

    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)

    return texture
  }, [])

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, 0, 0]}
    >
      <planeGeometry args={[20, 20, 128, 128]} />
      <meshStandardMaterial
        map={sandTexture}
        displacementMap={displacementMap}
        displacementScale={0.1}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        roughness={0.9}
        metalness={0.0}
        color="#d4c5b0"
      />
    </mesh>
  )
}
