import { create } from 'zustand'
import * as THREE from 'three'

/**
 * RakePath - Represents a stroke made by the rake
 */
export interface RakePath {
  points: THREE.Vector3[]
  timestamp: number
}

/**
 * AssetType - Types of placeable assets
 */
export type AssetType = 'stone-tower' | 'rocks' | 'bamboo' | 'stone-lantern' | 'pond' | 'bridge'

/**
 * GardenAsset - Represents a placeable object in the garden
 */
export interface GardenAsset {
  id: string
  type: AssetType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

/**
 * ToolType - Types of rake tools
 */
export type ToolType = 'straight' | 'circular' | 'wave'

/**
 * GardenStore - Global state for zen garden
 */
interface GardenStore {
  // Rake state
  isRaking: boolean
  isRakeActive: boolean
  rakePosition: THREE.Vector3
  rakePaths: RakePath[]
  currentPath: THREE.Vector3[]
  currentTool: ToolType

  // Asset state
  assets: GardenAsset[]
  selectedAssetId: string | null
  isDraggingAsset: boolean

  // Rake actions
  startRaking: (position: THREE.Vector3) => void
  updateRaking: (position: THREE.Vector3) => void
  stopRaking: () => void
  clearPaths: () => void
  setTool: (tool: ToolType) => void
  toggleRake: () => void

  // Asset actions
  addAsset: (type: AssetType, position: [number, number, number]) => void
  updateAsset: (id: string, updates: Partial<Omit<GardenAsset, 'id' | 'type'>>) => void
  deleteAsset: (id: string) => void
  selectAsset: (id: string | null) => void
}

export const useGardenStore = create<GardenStore>((set) => ({
  // Initial state - Rake
  isRaking: false,
  isRakeActive: false,
  rakePosition: new THREE.Vector3(0, 0, 0),
  rakePaths: [],
  currentPath: [],
  currentTool: 'straight',

  // Initial state - Assets
  assets: [
    // Default initial assets (converted from hardcoded ones)
    { id: 'tower-1', type: 'stone-tower', position: [-5, 0, -3], rotation: [0, 0, 0], scale: 1.2 },
    { id: 'tower-2', type: 'stone-tower', position: [6, 0, 4], rotation: [0, 0, 0], scale: 0.8 },
    { id: 'rocks-1', type: 'rocks', position: [-3, 0, 5], rotation: [0, 0, 0], scale: 1 },
    { id: 'rocks-2', type: 'rocks', position: [4, 0, -5], rotation: [0, 0, 0], scale: 1 },
    { id: 'rocks-3', type: 'rocks', position: [0, 0, -7], rotation: [0, 0, 0], scale: 1 },
    { id: 'bamboo-1', type: 'bamboo', position: [-7, 0, 6], rotation: [0, 0, 0], scale: 1 },
    { id: 'bamboo-2', type: 'bamboo', position: [7, 0, -2], rotation: [0, 0, 0], scale: 1 },
  ],
  selectedAssetId: null,
  isDraggingAsset: false,

  // Rake actions
  startRaking: (position) =>
    set({
      isRaking: true,
      rakePosition: position.clone(),
      currentPath: [position.clone()],
      selectedAssetId: null, // Deselect asset when raking
    }),

  updateRaking: (position) =>
    set((state) => {
      if (!state.isRaking) return state

      const newPosition = position.clone()
      const lastPoint = state.currentPath[state.currentPath.length - 1]

      if (!lastPoint || lastPoint.distanceTo(newPosition) > 0.1) {
        return {
          rakePosition: newPosition,
          currentPath: [...state.currentPath, newPosition],
        }
      }

      return { rakePosition: newPosition }
    }),

  stopRaking: () =>
    set((state) => {
      if (!state.isRaking || state.currentPath.length < 2) {
        return { isRaking: false, currentPath: [] }
      }

      return {
        isRaking: false,
        rakePaths: [
          ...state.rakePaths,
          {
            points: state.currentPath,
            timestamp: Date.now(),
          },
        ],
        currentPath: [],
      }
    }),

  clearPaths: () =>
    set({
      rakePaths: [],
      currentPath: [],
    }),

  setTool: (tool) => set({ currentTool: tool }),

  toggleRake: () =>
    set((state) => ({
      isRakeActive: !state.isRakeActive,
      selectedAssetId: !state.isRakeActive ? null : state.selectedAssetId, // Deselect asset when activating rake
    })),

  // Asset actions
  addAsset: (type, position) =>
    set((state) => ({
      assets: [
        ...state.assets,
        {
          id: `${type}-${Date.now()}`,
          type,
          position,
          rotation: [0, 0, 0],
          scale: 1,
        },
      ],
    })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    })),

  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
      selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
    })),

  selectAsset: (id) => set({ selectedAssetId: id }),
}))
