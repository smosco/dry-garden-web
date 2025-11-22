import type { Stone, RakeStroke, PhilosophyStage } from '../stores/useGardenStore'
import * as THREE from 'three'

/**
 * SaveSystem - 정원 상태 저장 및 공유
 */

const STORAGE_KEY = 'zen-garden-musang-save'

interface SaveData {
  version: number
  stones: Stone[]
  stage: PhilosophyStage
  savedAt: number
}

/**
 * 정원 상태 저장
 */
export function saveGarden(stones: Stone[], stage: PhilosophyStage): void {
  const saveData: SaveData = {
    version: 1,
    stones,
    stage,
    savedAt: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
  } catch (error) {
    console.warn('Failed to save garden:', error)
  }
}

/**
 * 정원 상태 불러오기
 */
export function loadGarden(): SaveData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null

    const saveData = JSON.parse(data) as SaveData
    if (saveData.version !== 1) return null

    return saveData
  } catch (error) {
    console.warn('Failed to load garden:', error)
    return null
  }
}

/**
 * 저장 데이터 삭제
 */
export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear save:', error)
  }
}

/**
 * 스크린샷 캡처 및 다운로드
 */
export function captureScreenshot(canvas: HTMLCanvasElement, filename: string = 'zen-garden'): void {
  try {
    // WebGL에서 픽셀 데이터 가져오기
    const dataUrl = canvas.toDataURL('image/png')

    // 다운로드 링크 생성
    const link = document.createElement('a')
    link.download = `${filename}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.warn('Failed to capture screenshot:', error)
  }
}

/**
 * 클립보드에 이미지 복사 (Web Share API 대체)
 */
export async function shareScreenshot(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    // Canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })

    if (!blob) {
      throw new Error('Failed to create blob')
    }

    // Web Share API 지원 확인
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'zen-garden.png', { type: 'image/png' })
      const shareData = {
        title: '무상(無常) - 젠가든',
        text: '나의 젠가든을 공유합니다. 🧘',
        files: [file],
      }

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData)
        return true
      }
    }

    // 클립보드 복사 fallback
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ])

    return true
  } catch (error) {
    console.warn('Failed to share screenshot:', error)
    return false
  }
}

/**
 * Stroke를 직렬화 가능한 형태로 변환
 */
export function serializeStrokes(strokes: RakeStroke[]): string {
  const serializable = strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((p) => ({ x: p.x, y: p.y })),
  }))
  return JSON.stringify(serializable)
}

/**
 * 직렬화된 Stroke 복원
 */
export function deserializeStrokes(data: string): RakeStroke[] {
  try {
    const parsed = JSON.parse(data)
    return parsed.map((stroke: { id: string; points: { x: number; y: number }[]; timestamp: number; opacity: number }) => ({
      ...stroke,
      points: stroke.points.map((p: { x: number; y: number }) => new THREE.Vector2(p.x, p.y)),
    }))
  } catch {
    return []
  }
}
