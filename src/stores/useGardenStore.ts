import { create } from 'zustand'
import * as THREE from 'three'

/**
 * Stone - 정원의 돌
 */
export interface Stone {
  id: string
  position: [number, number]  // x, z 좌표
  radius: number              // 돌의 반지름 (패턴 생성용)
  scale: number
}

/**
 * RakeStroke - 갈퀴로 그은 한 획
 */
export interface RakeStroke {
  id: string
  points: THREE.Vector2[]     // 2D 포인트 배열 (x, z)
  timestamp: number
  opacity: number             // 페이드아웃용
  stonesSnapshot: Stone[]     // 그릴 당시의 돌 위치 스냅샷
}

/**
 * PhilosophyStage - 깨달음의 단계
 */
export type PhilosophyStage = 'kanso' | 'fukinsei'

interface GardenStore {
  // 정원 상태
  stones: Stone[]
  strokes: RakeStroke[]

  // 도구 상태
  activeTool: 'view' | 'rake' | 'stone'
  isRaking: boolean
  currentStrokePoints: THREE.Vector2[]

  // 철학 상태
  stage: PhilosophyStage
  showQuote: boolean
  currentQuote: string

  // 액션
  setActiveTool: (tool: 'view' | 'rake' | 'stone') => void

  // 돌 관련
  addStone: (x: number, z: number) => void
  moveStone: (id: string, x: number, z: number) => void
  removeStone: (id: string) => void

  // 갈퀴질 관련
  startStroke: (x: number, z: number) => void
  continueStroke: (x: number, z: number) => void
  endStroke: () => void
  updateStrokeOpacity: (id: string, opacity: number) => void
  removeStroke: (id: string) => void
  clearAllStrokes: () => void

  // 철학 관련
  showPhilosophyQuote: (quote: string) => void
  hideQuote: () => void
  advanceStage: () => void

  // 리셋
  resetGarden: () => void
}

// 초기 돌 배치 (비대칭, 홀수)
const initialStones: Stone[] = [
  { id: 'stone-1', position: [-2.5, -1], radius: 0.6, scale: 1.2 },
  { id: 'stone-2', position: [3, 2], radius: 0.5, scale: 1.0 },
  { id: 'stone-3', position: [0.5, -3], radius: 0.4, scale: 0.8 },
]

export const useGardenStore = create<GardenStore>((set, get) => ({
  // 초기 상태
  stones: initialStones,
  strokes: [],
  activeTool: 'rake',
  isRaking: false,
  currentStrokePoints: [],
  stage: 'kanso',
  showQuote: false,
  currentQuote: '',

  // 도구 선택
  setActiveTool: (tool) => set({ activeTool: tool }),

  // 돌 추가
  addStone: (x, z) => {
    const stones = get().stones
    if (stones.length >= 5) return // MVP: 최대 5개

    set({
      stones: [
        ...stones,
        {
          id: `stone-${Date.now()}`,
          position: [x, z],
          radius: 0.4 + Math.random() * 0.3,
          scale: 0.7 + Math.random() * 0.5,
        },
      ],
    })
  },

  // 돌 이동
  moveStone: (id, x, z) => {
    set({
      stones: get().stones.map((s) =>
        s.id === id ? { ...s, position: [x, z] as [number, number] } : s
      ),
    })
  },

  // 돌 제거
  removeStone: (id) => {
    set({ stones: get().stones.filter((s) => s.id !== id) })
  },

  // 갈퀴질 시작
  startStroke: (x, z) => {
    set({
      isRaking: true,
      currentStrokePoints: [new THREE.Vector2(x, z)],
    })
  },

  // 갈퀴질 계속
  continueStroke: (x, z) => {
    const { isRaking, currentStrokePoints } = get()
    if (!isRaking) return

    const lastPoint = currentStrokePoints[currentStrokePoints.length - 1]
    const newPoint = new THREE.Vector2(x, z)

    // 최소 거리 체크 (성능 최적화)
    if (lastPoint && lastPoint.distanceTo(newPoint) < 0.05) return

    set({
      currentStrokePoints: [...currentStrokePoints, newPoint],
    })
  },

  // 갈퀴질 종료
  endStroke: () => {
    const { currentStrokePoints, strokes, stones } = get()

    if (currentStrokePoints.length < 2) {
      set({ isRaking: false, currentStrokePoints: [] })
      return
    }

    // 현재 돌 위치의 스냅샷 저장 (깊은 복사)
    const stonesSnapshot = stones.map(s => ({
      id: s.id,
      position: [...s.position] as [number, number],
      radius: s.radius,
      scale: s.scale,
    }))

    const newStroke: RakeStroke = {
      id: `stroke-${Date.now()}`,
      points: currentStrokePoints,
      timestamp: Date.now(),
      opacity: 1.0,
      stonesSnapshot,
    }

    set({
      isRaking: false,
      currentStrokePoints: [],
      strokes: [...strokes, newStroke],
    })
  },

  // 획 투명도 업데이트
  updateStrokeOpacity: (id, opacity) => {
    set({
      strokes: get().strokes.map((s) =>
        s.id === id ? { ...s, opacity } : s
      ),
    })
  },

  // 획 제거
  removeStroke: (id) => {
    set({ strokes: get().strokes.filter((s) => s.id !== id) })
  },

  // 모든 획 지우기
  clearAllStrokes: () => set({ strokes: [] }),

  // 철학 명언 표시
  showPhilosophyQuote: (quote) => set({ showQuote: true, currentQuote: quote }),
  hideQuote: () => set({ showQuote: false }),

  // 단계 진행
  advanceStage: () => {
    const { stage } = get()
    if (stage === 'kanso') {
      set({ stage: 'fukinsei' })
    }
  },

  // 정원 리셋
  resetGarden: () => set({
    stones: initialStones,
    strokes: [],
    currentStrokePoints: [],
    isRaking: false,
  }),
}))
