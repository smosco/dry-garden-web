import { useGardenStore } from '../stores/useGardenStore'

/**
 * GridHelper - Visual grid overlay for asset placement
 * Only visible in move mode to help with alignment
 */
export default function GridHelper() {
  const { mainTool } = useGardenStore()

  if (mainTool !== 'move') return null

  return (
    <gridHelper
      args={[20, 40, '#8b6f47', '#d4c5b0']}
      position={[0, 0.02, 0]}
      rotation={[0, 0, 0]}
    />
  )
}
