import { useState, useEffect } from 'react'
import './Onboarding.css'

const ONBOARDING_KEY = 'zen-garden-onboarding-shown'

/**
 * Onboarding - 간단한 시작 화면
 */
export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // 이미 본 적 있으면 표시 안함
    const hasShown = localStorage.getItem(ONBOARDING_KEY)
    if (!hasShown) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem(ONBOARDING_KEY, 'true')
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  if (!isVisible) return null

  const steps = [
    {
      title: '무상(無常)',
      subtitle: 'Impermanence',
      content: '만들고 지우며 깨닫는\n디지털 선(禪)의 여정',
    },
    {
      title: '갈퀴로 그리기',
      subtitle: 'Draw with Rake',
      content: '갈퀴 도구를 선택하고\n모래 위에 패턴을 그려보세요',
    },
    {
      title: '모든 것은 사라진다',
      subtitle: 'Everything Fades',
      content: '그린 패턴은 5초 후 사라집니다\n이것이 무상의 가르침입니다',
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="onboarding-overlay" onClick={handleNext}>
      <div className="onboarding-content" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-step-indicator">
          {steps.map((_, i) => (
            <span key={i} className={`step-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        <h1 className="onboarding-title">{currentStep.title}</h1>
        <span className="onboarding-subtitle">{currentStep.subtitle}</span>

        <p className="onboarding-text">{currentStep.content}</p>

        <button className="onboarding-btn" onClick={handleNext}>
          {step < 2 ? '다음' : '시작하기'}
        </button>

        <button className="onboarding-skip" onClick={handleClose}>
          건너뛰기
        </button>
      </div>
    </div>
  )
}
