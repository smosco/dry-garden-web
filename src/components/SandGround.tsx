import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGardenStore } from '../stores/useGardenStore'
import {
  TEXTURE_SIZE,
  GARDEN_SIZE,
  renderPatternTexture,
} from '../systems/PatternSystem'

/**
 * SandGround - 모래 바닥 + 갈퀴 패턴 렌더링
 *
 * 가레산스이(枯山水)의 핵심:
 * - 하얀 자갈/모래 위에 갈퀴로 물결 무늬를 그림
 * - 돌 주위에는 동심원 패턴 (물에 떨어진 돌처럼)
 * - 명상과 마음의 평화
 */
export default function SandGround() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const normalMapRef = useRef<THREE.CanvasTexture | null>(null)
  const baseTextureDataRef = useRef<ImageData | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 캔버스와 텍스처 생성 (한 번만)
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = TEXTURE_SIZE
    c.height = TEXTURE_SIZE

    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter

    return { canvas: c, texture: tex }
  }, [])

  // 노멀맵 생성 (한 번만)
  const normalMap = useMemo(() => {
    const tex = new THREE.CanvasTexture(document.createElement('canvas'))
    return tex
  }, [])

  // ref 초기화 (useEffect에서)
  useEffect(() => {
    canvasRef.current = canvas
    textureRef.current = texture
    normalMapRef.current = normalMap
  }, [canvas, texture, normalMap])

  // 초기화: 기본 텍스처 + 노멀맵 생성
  useEffect(() => {
    // 메인 텍스처 초기화
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 가레산스이 모래색 - 따뜻한 밝은 회백색 (시라카와 자갈 느낌)
      ctx.fillStyle = '#e8e4dc'
      ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

      const imageData = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 12 - 6
        data[i] = Math.min(255, Math.max(0, data[i] + noise))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
      }
      ctx.putImageData(imageData, 0, 0)
      baseTextureDataRef.current = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
    }

    // 노멀맵 초기화
    const normalCanvas = document.createElement('canvas')
    normalCanvas.width = 256
    normalCanvas.height = 256
    const nctx = normalCanvas.getContext('2d')
    if (nctx && normalMapRef.current) {
      nctx.fillStyle = '#8080ff'
      nctx.fillRect(0, 0, 256, 256)
      const imageData = nctx.getImageData(0, 0, 256, 256)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 6 - 3
        data[i] = 128 + noise
        data[i + 1] = 128 + noise
        data[i + 2] = 255
      }
      nctx.putImageData(imageData, 0, 0)

      normalMapRef.current.image = normalCanvas
      normalMapRef.current.wrapS = THREE.RepeatWrapping
      normalMapRef.current.wrapT = THREE.RepeatWrapping
      normalMapRef.current.repeat.set(10, 10)
      normalMapRef.current.needsUpdate = true
    }
  }, [canvas])

  // 매 프레임 텍스처 업데이트
  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx || !baseTextureDataRef.current) return

    // Zustand 상태 직접 가져오기 (closure 문제 해결)
    const state = useGardenStore.getState()
    const { stones, strokes, currentStrokePoints, updateStrokeOpacity, removeStroke } = state

    // 페이드아웃 처리
    const now = Date.now()
    const FADE_START = 8000
    const FADE_DURATION = 4000

    for (const stroke of strokes) {
      const age = now - stroke.timestamp
      if (age > FADE_START) {
        const fadeProgress = Math.min(1, (age - FADE_START) / FADE_DURATION)
        const newOpacity = 1 - fadeProgress

        if (newOpacity <= 0) {
          removeStroke(stroke.id)
        } else if (Math.abs(stroke.opacity - newOpacity) > 0.02) {
          updateStrokeOpacity(stroke.id, newOpacity)
        }
      }
    }

    // 패턴 렌더링
    renderPatternTexture(ctx, stones, strokes, currentStrokePoints, baseTextureDataRef.current)

    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[GARDEN_SIZE, GARDEN_SIZE, 1, 1]} />
      <meshStandardMaterial
        map={texture}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.15, 0.15)}
        roughness={0.98}
        metalness={0}
      />
    </mesh>
  )
}
