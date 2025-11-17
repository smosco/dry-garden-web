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
 * GardenStore - Global state for zen garden
 */
interface GardenStore {
  // Rake state
  isRaking: boolean
  rakePosition: THREE.Vector3
  rakePaths: RakePath[]
  currentPath: THREE.Vector3[]

  // Actions
  startRaking: (position: THREE.Vector3) => void
  updateRaking: (position: THREE.Vector3) => void
  stopRaking: () => void
  clearPaths: () => void
}

export const useGardenStore = create<GardenStore>((set) => ({
  // Initial state
  isRaking: false,
  rakePosition: new THREE.Vector3(0, 0, 0),
  rakePaths: [],
  currentPath: [],

  // Start raking - begin a new stroke
  startRaking: (position) =>
    set({
      isRaking: true,
      rakePosition: position.clone(),
      currentPath: [position.clone()],
    }),

  // Update raking - add point to current stroke
  updateRaking: (position) =>
    set((state) => {
      if (!state.isRaking) return state

      const newPosition = position.clone()
      const lastPoint = state.currentPath[state.currentPath.length - 1]

      // Only add point if it's far enough from the last one (smooth the path)
      if (!lastPoint || lastPoint.distanceTo(newPosition) > 0.1) {
        return {
          rakePosition: newPosition,
          currentPath: [...state.currentPath, newPosition],
        }
      }

      return { rakePosition: newPosition }
    }),

  // Stop raking - save the current stroke
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

  // Clear all rake paths
  clearPaths: () =>
    set({
      rakePaths: [],
      currentPath: [],
    }),
}))
