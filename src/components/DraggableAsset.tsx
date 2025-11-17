import { useRef, useEffect, useState, type ReactNode } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGardenStore, type GardenAsset } from '../stores/useGardenStore';

/**
 * DraggableAsset - Wrapper that makes assets draggable and transformable
 * Provides position, rotation, and scale controls
 */
interface DraggableAssetProps {
  asset: GardenAsset;
  children: ReactNode;
}

export default function DraggableAsset({
  asset,
  children,
}: DraggableAssetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);
  const { selectedAssetId, selectAsset, updateAsset } = useGardenStore();
  const [targetObject, setTargetObject] = useState<THREE.Group | null>(null);

  const isSelected = selectedAssetId === asset.id;

  // Set the target object and attach transform controls after mount
  useEffect(() => {
    if (isSelected && groupRef.current) {
      setTargetObject(groupRef.current);
    } else {
      setTargetObject(null);
    }
  }, [isSelected]);

  // Notify store when dragging starts/stops to disable raking
  useEffect(() => {
    if (!transformRef.current) return;

    const controls = transformRef.current;

    const handleDragStart = () => {
      useGardenStore.setState({ isDraggingAsset: true });
    };

    const handleDragEnd = () => {
      useGardenStore.setState({ isDraggingAsset: false });
    };

    const handleDraggingChanged = (event: { value: boolean }) => {
      if (event.value) {
        handleDragStart();
      } else {
        handleDragEnd();
      }
    };

    controls.addEventListener('dragging-changed', handleDraggingChanged);

    return () => {
      controls.removeEventListener('dragging-changed', handleDraggingChanged);
    };
  }, [targetObject]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    // Don't select asset if rake is active
    const isRakeActive = useGardenStore.getState().isRakeActive;
    if (isRakeActive) return;

    selectAsset(asset.id);
  };

  const handleTransformChange = () => {
    if (!groupRef.current) return;

    const position = groupRef.current.position;
    const rotation = groupRef.current.rotation;
    const scale = groupRef.current.scale;

    updateAsset(asset.id, {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      scale: scale.x, // Assuming uniform scale
    });
  };

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
      {isSelected && targetObject && (
        <TransformControls
          ref={transformRef}
          object={targetObject}
          mode='translate'
          onObjectChange={handleTransformChange}
        />
      )}
    </>
  );
}
