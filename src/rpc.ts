import NativeRPC from "@token-team/native-rpc-h5";
import { useSelectionStore } from './stores/selectionStore.ts'

const CAMPUS_STORAGE_KEY = 'classroom.campus'
const DEFAULT_CAMPUS = '南湖校区'
const VALID_CAMPUSES = new Set(['南湖校区', '马房山校区'])
const NATIVE_RPC_TIMEOUT_MS = 1500

type NativeStorageGetResponse = {
  value?: string
}

type SelectionStore = ReturnType<typeof useSelectionStore>

type NativeBridgeWindow = Window & {
  androidBridge?: unknown
  webkit?: {
    messageHandlers?: {
      bridge?: unknown
    }
  }
}

function hasNativeBridge(): boolean {
  const nativeWindow = window as NativeBridgeWindow
  return Boolean(nativeWindow.androidBridge || nativeWindow.webkit?.messageHandlers?.bridge)
}

function readCampusFromLocalStorage(): string {
  try {
    return localStorage.getItem(CAMPUS_STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

function saveCampusToLocalStorage(campus: string): void {
  try {
    localStorage.setItem(CAMPUS_STORAGE_KEY, campus)
  } catch (error) {
    console.warn('Failed to save campus to localStorage:', error)
  }
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('NativeRPC timeout')), NATIVE_RPC_TIMEOUT_MS)
    })
  ])
}

// 将选择的校区存入 NativeRPC
export async function saveCampusToNativeRPC(campus: string): Promise<void> {
  saveCampusToLocalStorage(campus)
  if (!hasNativeBridge()) return

  try {
    await withTimeout(NativeRPC.call('storage.set', {
      key: CAMPUS_STORAGE_KEY,
      value: campus
    }))
  } catch (error) {
    console.warn('Failed to save campus to NativeRPC; localStorage is being used:', error)
  }
}

// 从 NativeRPC 加载上次选择的校区
export async function initializeCampusFromNativeRPC(options?: {
  defaultCampus?: string
  store?: SelectionStore
}): Promise<string> {
  const defaultCampus = options?.defaultCampus ?? DEFAULT_CAMPUS
  const store = options?.store ?? useSelectionStore()

  let savedCampus = readCampusFromLocalStorage()

  if (hasNativeBridge()) {
    try {
      const result = await withTimeout(NativeRPC.call<NativeStorageGetResponse>('storage.get', {
        key: CAMPUS_STORAGE_KEY
      }))
      savedCampus = result.value?.trim() || savedCampus
    } catch (error) {
      console.warn('Failed to load campus from NativeRPC; localStorage is being used:', error)
    }
  }

  const campus = VALID_CAMPUSES.has(savedCampus) ? savedCampus : defaultCampus

  if (campus !== savedCampus) {
    await saveCampusToNativeRPC(defaultCampus)
  }

  store.updateSelectedCampuses([campus])
  return campus
}
