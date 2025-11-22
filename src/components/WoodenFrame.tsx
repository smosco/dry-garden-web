import { GARDEN_SIZE } from '../systems/PatternSystem'

/**
 * WoodenFrame - 가레산스이 나무 틀
 *
 * 전통적인 일본 정원의 세련된 나무 테두리
 * - 얇고 우아한 프로파일
 * - 자연스러운 나무 색상 (히노키 느낌)
 * - 미니멀한 조인트
 */
export default function WoodenFrame() {
  const frameWidth = 0.18  // 더 얇은 틀
  const frameHeight = 0.08  // 낮은 높이
  const innerSize = GARDEN_SIZE
  const outerSize = innerSize + frameWidth * 2

  // 히노키 나무 색상 (밝고 따뜻한 톤)
  const woodColor = '#c4a882'
  const woodColorDark = '#a08060'

  return (
    <group position={[0, frameHeight / 2, 0]}>
      {/* 상단 틀 */}
      <mesh position={[0, 0, -innerSize / 2 - frameWidth / 2]} castShadow receiveShadow>
        <boxGeometry args={[outerSize, frameHeight, frameWidth]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} metalness={0} />
      </mesh>

      {/* 하단 틀 */}
      <mesh position={[0, 0, innerSize / 2 + frameWidth / 2]} castShadow receiveShadow>
        <boxGeometry args={[outerSize, frameHeight, frameWidth]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} metalness={0} />
      </mesh>

      {/* 좌측 틀 */}
      <mesh position={[-innerSize / 2 - frameWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, innerSize]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} metalness={0} />
      </mesh>

      {/* 우측 틀 */}
      <mesh position={[innerSize / 2 + frameWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, innerSize]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} metalness={0} />
      </mesh>

      {/* 미니멀 코너 - 은은한 강조 */}
      {[
        [-innerSize / 2 - frameWidth / 2, -innerSize / 2 - frameWidth / 2],
        [innerSize / 2 + frameWidth / 2, -innerSize / 2 - frameWidth / 2],
        [-innerSize / 2 - frameWidth / 2, innerSize / 2 + frameWidth / 2],
        [innerSize / 2 + frameWidth / 2, innerSize / 2 + frameWidth / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, frameHeight * 0.1, z]} castShadow>
          <boxGeometry args={[frameWidth * 1.1, frameHeight * 1.2, frameWidth * 1.1]} />
          <meshStandardMaterial color={woodColorDark} roughness={0.65} metalness={0} />
        </mesh>
      ))}

      {/* 바닥면 - 부드러운 그림자용 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -frameHeight / 2 - 0.01, 0]} receiveShadow>
        <planeGeometry args={[outerSize + 3, outerSize + 3]} />
        <meshStandardMaterial color="#3a3a38" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}
