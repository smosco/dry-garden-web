import ZenGarden from './components/ZenGarden'
import Toolbar from './components/UI/Toolbar'
import Philosophy from './components/UI/Philosophy'
import Onboarding from './components/UI/Onboarding'
import './index.css'

/**
 * 무상(無常) - 젠가든 명상 앱
 *
 * "만들고 지우며 깨닫는 디지털 선(禪)의 여정"
 *
 * MVP 기능:
 * - 10x10 하얀 모래 정원
 * - 구형 돌 3개 (비대칭 배치)
 * - 직선 갈퀴로 패턴 그리기
 * - 돌 주위 동심원 자동 생성 (미즈몬)
 * - 패턴 5초 후 페이드아웃 (무상)
 * - 칸소 + 후킨세이 철학 단계
 */
function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ZenGarden />
      <Toolbar />
      <Philosophy />
      <Onboarding />
    </div>
  )
}

export default App
