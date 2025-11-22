import { useEffect, useState } from 'react'
import { useGardenStore } from '../../stores/useGardenStore'
import './Philosophy.css'

/**
 * Philosophy - 철학적 명언 표시
 *
 * 젠가든의 7가지 미학 원칙 중 MVP에서는:
 * - 칸소(簡素): 단순함
 * - 후킨세이(不均斉): 비대칭의 아름다움
 */

// 명언 데이터
const quotes = {
  kanso: [
    { ko: '비움으로 채워지는 것을 보라', ja: '空にして満つ' },
    { ko: '단순함 속에 진리가 있다', ja: '簡素の中に真理あり' },
    { ko: '하나의 선으로 시작하라', ja: '一線より始めよ' },
    { ko: '적을수록 많아진다', ja: '少なきは多し' },
    { ko: '고요함이 마음을 비춘다', ja: '静寂心を映す' },
  ],
  fukinsei: [
    { ko: '기울어진 돌이 균형을 만든다', ja: '傾く石が均衡を作る' },
    { ko: '완벽하지 않음이 완벽이다', ja: '不完全は完全なり' },
    { ko: '자연은 대칭을 모른다', ja: '自然は対称を知らず' },
    { ko: '홀수가 조화를 이룬다', ja: '奇数は調和をなす' },
    { ko: '비틀림 속에 자유가 있다', ja: '歪みの中に自由あり' },
  ],
}

export default function Philosophy() {
  const { stage, showQuote, currentQuote, hideQuote, strokes } = useGardenStore()
  const [displayQuote, setDisplayQuote] = useState<{ ko: string; ja: string } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasShownFirstQuote, setHasShownFirstQuote] = useState(false)

  // 첫 갈퀴질 후 명언 표시
  useEffect(() => {
    if (strokes.length === 1 && !hasShownFirstQuote) {
      setHasShownFirstQuote(true)
      const stageQuotes = quotes[stage]
      const randomQuote = stageQuotes[Math.floor(Math.random() * stageQuotes.length)]
      setDisplayQuote(randomQuote)
      setIsVisible(true)

      // 5초 후 사라짐
      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }
  }, [strokes.length, stage, hasShownFirstQuote])

  // 외부에서 명언 표시 요청
  useEffect(() => {
    if (showQuote && currentQuote) {
      setDisplayQuote({ ko: currentQuote, ja: '' })
      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
        hideQuote()
      }, 5000)
    }
  }, [showQuote, currentQuote, hideQuote])

  if (!displayQuote) return null

  return (
    <div className={`philosophy ${isVisible ? 'visible' : ''}`}>
      <p className="philosophy-ja">{displayQuote.ja}</p>
      <p className="philosophy-ko">{displayQuote.ko}</p>
      <span className="philosophy-stage">
        {stage === 'kanso' ? '簡素 · 칸소' : '不均斉 · 후킨세이'}
      </span>
    </div>
  )
}
