import { useRef, ReactNode, useEffect } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGardenStore, GardenAsset } from '../stores/useGardenStore'

/**
 * DraggableAsset - Wrapper that makes assets draggable and transformable
 * Provides position, rotation, and scale controls
 */
interface DraggableAssetProps {
  asset: GardenAsset
  children: ReactNode
}

export default function DraggableAsset({ asset, children }: DraggableAssetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const transformRef = useRef<any>(null)
  const { selectedAssetId, selectAsset, updateAsset } = useGardenStore()

  const isSelected = selectedAssetId === asset.id

  // Set the transform controls object after mount
  useEffect(() => {
    if (isSelected && transformRef.current && groupRef.current) {
      transformRef.current.attach(groupRef.current)
    }
  }, [isSelected])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectAsset(asset.id)
  }

  const handleTransformChange = () => {
    if (!groupRef.current) return

    const position = groupRef.current.position
    const rotation = groupRef.current.rotation
    const scale = groupRef.current.scale

    updateAsset(asset.id, {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      scale: scale.x, // Assuming uniform scale
    })
  }

  return (
    <>
      <group
        ref={groupRef}
        position={asset.position}
        rotation={asset.rotation}
        scale={asset.scale}
        onClick={handleClick}
      >
        {children}
      </group>

      {/* Show TransformControls only when selected */}
      {isSelected && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode="translate"
          onObjectChange={handleTransformChange}
        />
      )}
    </>
  )
}
