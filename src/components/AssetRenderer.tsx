import { GardenAsset } from '../stores/useGardenStore'
import StoneTower from './StoneTower'
import DecorativeRocks from './DecorativeRocks'
import Bamboo from './Bamboo'

/**
 * AssetRenderer - Renders the appropriate component based on asset type
 */
interface AssetRendererProps {
  asset: GardenAsset
}

export default function AssetRenderer({ asset }: AssetRendererProps) {
  switch (asset.type) {
    case 'stone-tower':
      return <StoneTower position={[0, 0, 0]} scale={1} />

    case 'rocks':
      return <DecorativeRocks position={[0, 0, 0]} count={4} />

    case 'bamboo':
      return <Bamboo position={[0, 0, 0]} height={2.5} count={4} />

    // New assets will be added here
    case 'stone-lantern':
    case 'pond':
    case 'bridge':
      // Placeholder for future assets
      return (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      )

    default:
      return null
  }
}
