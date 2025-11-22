import { useState } from 'react'
import { useGardenStore } from '../../stores/useGardenStore'
import { captureScreenshot, shareScreenshot } from '../../systems/SaveSystem'
import './Toolbar.css'

/**
 * Toolbar - 도구 선택 UI
 *
 * 도구:
 * - 보기(view): 카메라 회전
 * - 갈퀴(rake): 모래에 패턴 그리기
 * - 돌(stone): 돌 이동/배치
 */
export default function Toolbar() {
  const { activeTool, setActiveTool, clearAllStrokes, resetGarden } = useGardenStore()
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleShare = async () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const success = await shareScreenshot(canvas)
    setShareStatus(success ? 'success' : 'error')

    // 상태 리셋
    setTimeout(() => setShareStatus('idle'), 2000)
  }

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    captureScreenshot(canvas, 'musang-zen-garden')
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${activeTool === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTool('view')}
          title="보기 (카메라 회전)"
        >
          <span className="toolbar-icon">👁</span>
          <span className="toolbar-label">보기</span>
        </button>

        <button
          className={`toolbar-btn ${activeTool === 'rake' ? 'active' : ''}`}
          onClick={() => setActiveTool('rake')}
          title="갈퀴 (패턴 그리기)"
        >
          <span className="toolbar-icon">༄</span>
          <span className="toolbar-label">갈퀴</span>
        </button>

        <button
          className={`toolbar-btn ${activeTool === 'stone' ? 'active' : ''}`}
          onClick={() => setActiveTool('stone')}
          title="돌 이동"
        >
          <span className="toolbar-icon">●</span>
          <span className="toolbar-label">돌</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn secondary"
          onClick={clearAllStrokes}
          title="패턴 지우기"
        >
          <span className="toolbar-icon">↺</span>
          <span className="toolbar-label">지우기</span>
        </button>

        <button
          className="toolbar-btn secondary"
          onClick={resetGarden}
          title="정원 리셋"
        >
          <span className="toolbar-icon">⟳</span>
          <span className="toolbar-label">리셋</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn share"
          onClick={handleShare}
          title="공유하기"
        >
          <span className="toolbar-icon">
            {shareStatus === 'success' ? '✓' : shareStatus === 'error' ? '✗' : '⤴'}
          </span>
          <span className="toolbar-label">공유</span>
        </button>

        <button
          className="toolbar-btn share"
          onClick={handleDownload}
          title="이미지 저장"
        >
          <span className="toolbar-icon">⬇</span>
          <span className="toolbar-label">저장</span>
        </button>
      </div>
    </div>
  )
}
