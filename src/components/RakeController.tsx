import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGardenStore } from '../stores/useGardenStore';
import { GARDEN_SIZE } from '../systems/PatternSystem';
import {
  initAudio,
  playRakingSound,
  stopRakingSound,
} from '../systems/AudioSystem';

/**
 * RakeController - 갈퀴 인터랙션 처리
 *
 * 기능:
 * - 마우스/터치로 모래에 패턴 그리기
 * - 돌을 피해서 그리기 (충돌 감지)
 * - 모래 긁는 소리 재생
 */
export default function RakeController() {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const groundPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionRef = useRef(new THREE.Vector3());
  const audioInitialized = useRef(false);

  const { activeTool, stones, startStroke, continueStroke, endStroke } =
    useGardenStore();

  // 포인터 위치를 월드 좌표로 변환
  const getWorldPosition = (
    clientX: number,
    clientY: number
  ): THREE.Vector3 | null => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    raycasterRef.current.setFromCamera(mouse, camera);

    if (
      raycasterRef.current.ray.intersectPlane(
        groundPlaneRef.current,
        intersectionRef.current
      )
    ) {
      return intersectionRef.current.clone();
    }
    return null;
  };

  // 해당 위치가 돌과 충돌하는지 확인
  const isCollidingWithStone = (x: number, z: number): boolean => {
    for (const stone of stones) {
      const dx = x - stone.position[0];
      const dz = z - stone.position[1];
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < stone.radius + 0.1) {
        return true;
      }
    }
    return false;
  };

  // 커서 스타일 설정 함수
  const setCursor = (cursor: string) => {
    document.body.style.cursor = cursor;
  };

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      // 첫 인터랙션 시 오디오 초기화
      if (!audioInitialized.current) {
        initAudio();
        audioInitialized.current = true;
      }

      if (e.button !== 0 || activeTool !== 'rake') return;

      const pos = getWorldPosition(e.clientX, e.clientY);
      if (!pos) return;

      // 정원 범위 체크
      const halfSize = GARDEN_SIZE / 2;
      if (Math.abs(pos.x) > halfSize || Math.abs(pos.z) > halfSize) return;

      // 돌 충돌 체크
      if (isCollidingWithStone(pos.x, pos.z)) return;

      startStroke(pos.x, pos.z);
      playRakingSound();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const state = useGardenStore.getState();
      if (!state.isRaking || activeTool !== 'rake') return;

      const pos = getWorldPosition(e.clientX, e.clientY);
      if (!pos) return;

      // 정원 범위 체크
      const halfSize = GARDEN_SIZE / 2;
      const x = THREE.MathUtils.clamp(pos.x, -halfSize, halfSize);
      const z = THREE.MathUtils.clamp(pos.z, -halfSize, halfSize);

      // 돌 충돌 시 획 종료
      if (isCollidingWithStone(x, z)) {
        endStroke();
        stopRakingSound();
        return;
      }

      continueStroke(x, z);
    };

    const handlePointerUp = () => {
      endStroke();
      stopRakingSound();
    };

    // 터치 이벤트도 처리
    const handleTouchStart = (e: TouchEvent) => {
      // 첫 인터랙션 시 오디오 초기화
      if (!audioInitialized.current) {
        initAudio();
        audioInitialized.current = true;
      }

      if (activeTool !== 'rake') return;
      const touch = e.touches[0];
      const pos = getWorldPosition(touch.clientX, touch.clientY);
      if (!pos) return;

      const halfSize = GARDEN_SIZE / 2;
      if (Math.abs(pos.x) > halfSize || Math.abs(pos.z) > halfSize) return;
      if (isCollidingWithStone(pos.x, pos.z)) return;

      startStroke(pos.x, pos.z);
      playRakingSound();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = useGardenStore.getState();
      if (!state.isRaking || activeTool !== 'rake') return;

      const touch = e.touches[0];
      const pos = getWorldPosition(touch.clientX, touch.clientY);
      if (!pos) return;

      const halfSize = GARDEN_SIZE / 2;
      const x = THREE.MathUtils.clamp(pos.x, -halfSize, halfSize);
      const z = THREE.MathUtils.clamp(pos.z, -halfSize, halfSize);

      if (isCollidingWithStone(x, z)) {
        endStroke();
        stopRakingSound();
        return;
      }

      continueStroke(x, z);
    };

    const handleTouchEnd = () => {
      endStroke();
      stopRakingSound();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl, activeTool, stones, startStroke, continueStroke, endStroke]);

  // 커서 스타일 변경 (activeTool 변경 시)
  useEffect(() => {
    setCursor(activeTool === 'rake' ? 'crosshair' : 'default');
    return () => setCursor('default');
  }, [activeTool]);

  return null;
}
