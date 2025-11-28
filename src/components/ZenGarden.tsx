import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import SandGround from './SandGround'
import Stone from './Stone'
import RakeController from './RakeController'
import WoodenFrame from './WoodenFrame'
import { useGardenStore } from '../stores/useGardenStore'

/**
 * ZenGarden - 메인 3D 씬
 *
 * 젠가든의 본질:
 * - 단순함 속의 깊이
 * - 여백의 미
 * - 명상적 분위기
 */
export default function ZenGarden() {
  const { stones, activeTool } = useGardenStore()

  return (
    <Canvas
      camera={{
        position: [0, 8, 8],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      shadows
      dpr={[1, 2]}
      style={{ background: '#0a0a0a' }}
    >
      {/* 은은한 조명 - 따뜻한 실내 조명 분위기 */}
      <ambientLight intensity={0.5} color="#f5f0e8" />

      {/* 메인 조명 (따뜻한 스팟 조명) */}
      <directionalLight
        position={[3, 12, 4]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0001}
      />

      {/* 부드러운 채움광 */}
      <hemisphereLight
        color="#fffaf0"
        groundColor="#6b5d4f"
        intensity={0.6}
      />

      {/* 환경 맵 - 따뜻한 석양 */}
      <Environment preset="sunset" />

      {/* 카메라 컨트롤 - view 모드에서만 활성화 */}
      <OrbitControls
        enabled={activeTool === 'view'}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 6}
        target={[0, 0, 0]}
      />

      {/* 나무 틀 (가레산스이 미니어처) */}
      <WoodenFrame />

      {/* 모래 바닥 (패턴 포함) */}
      <SandGround />

      {/* 돌들 */}
      {stones.map((stone) => (
        <Stone key={stone.id} stone={stone} />
      ))}

      {/* 갈퀴 컨트롤러 */}
      <RakeController />

      {/* 후처리 효과 - 명상적 분위기 */}
      <EffectComposer>
        <Bloom
          intensity={0.2}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.ADD}
        />
        <Vignette
          offset={0.3}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  )
}
