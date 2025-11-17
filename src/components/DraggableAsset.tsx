import { useRef, useEffect, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGardenStore, type GardenAsset } from '../stores/useGardenStore';

/**
 * DraggableAsset - Wrapper that makes assets draggable with grid snapping
 * Provides smooth drag-based movement with haptic-like grid snapping
 */
interface DraggableAssetProps {
  asset: GardenAsset;
  children: ReactNode;
}

const GRID_SIZE = 0.5; // Grid cell size for snapping

export default function DraggableAsset({
  asset,
  children,
}: DraggableAssetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();
  const { selectedAssetId, selectAsset, updateAsset, mainTool } = useGardenStore();

  const [isDragging, setIsDragging] = useState(false);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(...asset.position)
  );
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const isSelected = selectedAssetId === asset.id;

  // Smooth lerp to target position for haptic feel
  useFrame(() => {
    if (!groupRef.current) return;

    const current = groupRef.current.position;
    current.lerp(targetPosition, 0.2); // Smooth interpolation
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // Only allow selection and dragging in move mode
    if (mainTool !== 'move') return;

    selectAsset(asset.id);
    setIsDragging(true);
    useGardenStore.setState({ isDraggingAsset: true });
  };

  const handlePointerMove = () => {
    if (!isDragging) return;

    // Cast ray to ground plane
    raycaster.setFromCamera(pointer, camera);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane.current, intersection)) {
      // Snap to grid
      const snappedX = Math.round(intersection.x / GRID_SIZE) * GRID_SIZE;
      const snappedZ = Math.round(intersection.z / GRID_SIZE) * GRID_SIZE;

      // Clamp to garden bounds
      const clampedX = THREE.MathUtils.clamp(snappedX, -9, 9);
      const clampedZ = THREE.MathUtils.clamp(snappedZ, -9, 9);

      setTargetPosition(new THREE.Vector3(clampedX, 0, clampedZ));
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      useGardenStore.setState({ isDraggingAsset: false });

      // Update store with final position
      updateAsset(asset.id, {
        position: [targetPosition.x, targetPosition.y, targetPosition.z],
      });
    }
  };

  // Global pointer up listener
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        useGardenStore.setState({ isDraggingAsset: false });
        updateAsset(asset.id, {
          position: [targetPosition.x, targetPosition.y, targetPosition.z],
        });
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [isDragging, targetPosition, asset.id, updateAsset]);

  return (
    <group
      ref={groupRef}
      position={asset.position}
      rotation={asset.rotation}
      scale={asset.scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}

      {/* Selection indicator */}
      {isSelected && mainTool === 'move' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#4a8b47" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
