import { GARDEN_SIZE } from '../systems/PatternSystem'

/**
 * WoodenFrame - 가레산스이 나무 틀
 *
 * 전통적인 일본 정원의 나무 테두리를 표현
 * 정원의 경계를 명확히 하고 미니어처 느낌을 줌
 */
export default function WoodenFrame() {
  const frameWidth = 0.3  // 틀 두께
  const frameHeight = 0.15  // 틀 높이
  const innerSize = GARDEN_SIZE
  const outerSize = innerSize + frameWidth * 2

  // 나무 색상
  const woodColor = '#5c4033'
  const woodMaterial = {
    color: woodColor,
    roughness: 0.8,
    metalness: 0,
  }

  return (
    <group position={[0, frameHeight / 2, 0]}>
      {/* 상단 틀 */}
      <mesh position={[0, 0, -innerSize / 2 - frameWidth / 2]} castShadow receiveShadow>
        <boxGeometry args={[outerSize, frameHeight, frameWidth]} />
        <meshStandardMaterial {...woodMaterial} />
      </mesh>

      {/* 하단 틀 */}
      <mesh position={[0, 0, innerSize / 2 + frameWidth / 2]} castShadow receiveShadow>
        <boxGeometry args={[outerSize, frameHeight, frameWidth]} />
        <meshStandardMaterial {...woodMaterial} />
      </mesh>

      {/* 좌측 틀 */}
      <mesh position={[-innerSize / 2 - frameWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, innerSize]} />
        <meshStandardMaterial {...woodMaterial} />
      </mesh>

      {/* 우측 틀 */}
      <mesh position={[innerSize / 2 + frameWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, innerSize]} />
        <meshStandardMaterial {...woodMaterial} />
      </mesh>

      {/* 코너 장식 (약간 높게) */}
      {[
        [-innerSize / 2 - frameWidth / 2, -innerSize / 2 - frameWidth / 2],
        [innerSize / 2 + frameWidth / 2, -innerSize / 2 - frameWidth / 2],
        [-innerSize / 2 - frameWidth / 2, innerSize / 2 + frameWidth / 2],
        [innerSize / 2 + frameWidth / 2, innerSize / 2 + frameWidth / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, frameHeight * 0.3, z]} castShadow>
          <boxGeometry args={[frameWidth * 1.2, frameHeight * 1.5, frameWidth * 1.2]} />
          <meshStandardMaterial color="#4a3728" roughness={0.75} metalness={0} />
        </mesh>
      ))}

      {/* 바닥면 (그림자 받기용) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -frameHeight / 2 - 0.01, 0]} receiveShadow>
        <planeGeometry args={[outerSize + 2, outerSize + 2]} />
        <meshStandardMaterial color="#2a2a28" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}
