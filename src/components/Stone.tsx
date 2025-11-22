import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore, type Stone as StoneType } from '../stores/useGardenStore'
import { GARDEN_SIZE } from '../systems/PatternSystem'

interface StoneProps {
  stone: StoneType
}

/**
 * Stone - 정원의 돌
 *
 * 가레산스이 철학:
 * - 돌은 산이나 섬을 나타냄
 * - 홀수(1, 3, 5, 7)로 배치
 * - 비대칭이 조화를 만듦
 */
export default function Stone({ stone }: StoneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const activeTool = useGardenStore((s) => s.activeTool)
  const moveStone = useGardenStore((s) => s.moveStone)
  const { camera, gl } = useThree()

  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 전역 포인터 이벤트로 드래그 처리
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()

      if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
        // 정원 전체 범위에서 자유롭게 이동 (약간의 마진만)
        const margin = 0.3
        const halfSize = GARDEN_SIZE / 2 - margin
        const x = THREE.MathUtils.clamp(intersection.x, -halfSize, halfSize)
        const z = THREE.MathUtils.clamp(intersection.z, -halfSize, halfSize)
        moveStone(stone.id, x, z)
      }
    }

    const handleGlobalUp = () => {
      setIsDragging(false)
      document.body.style.cursor = 'default'
    }

    window.addEventListener('pointermove', handleGlobalMove)
    window.addEventListener('pointerup', handleGlobalUp)

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove)
      window.removeEventListener('pointerup', handleGlobalUp)
    }
  }, [isDragging, camera, gl, moveStone, stone.id])

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (activeTool !== 'stone') return
    e.stopPropagation()
    setIsDragging(true)
    document.body.style.cursor = 'grabbing'
  }

  const handlePointerEnter = () => {
    if (activeTool === 'stone') {
      setIsHovered(true)
      document.body.style.cursor = 'grab'
    }
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    if (!isDragging) {
      document.body.style.cursor = activeTool === 'stone' ? 'default' : 'default'
    }
  }

  // 부드러운 위치 애니메이션
  useFrame(() => {
    if (!meshRef.current) return

    // 돌 위치 업데이트
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      stone.position[0],
      0.2
    )
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z,
      stone.position[1],
      0.2
    )

    // 호버/드래그 시 살짝 위로
    const targetY = stone.scale * 0.35 + (isDragging ? 0.3 : isHovered ? 0.1 : 0)
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.15
    )
  })

  return (
    <mesh
      ref={meshRef}
      position={[stone.position[0], stone.scale * 0.35, stone.position[1]]}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* 자연스러운 돌 형태 */}
      <sphereGeometry args={[stone.radius * stone.scale, 24, 18]} />
      <meshStandardMaterial
        color={isDragging ? '#4a4a4a' : '#2a2a2a'}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  )
}
