import NativeRPC from "@token-team/native-rpc-h5";
import { useSelectionStore } from './stores/selectionStore.ts'

const RPC_CAMPUS_STORAGE_KEY = 'campus'
const DEFAULT_CAMPUS = '0202'
const WEB_CAMPUS_STORAGE_KEY = 'campus'

type NativeStorageGetResponse = {
  value?: string
}

type SelectionStore = ReturnType<typeof useSelectionStore>

// 检查是否是移动端设备
const hasNativeRPCBridge = (): boolean => {
  const win = window as Window & {
    androidBridge?: { postMessage?: (message: string) => void }
    webkit?: { messageHandlers?: { bridge?: { postMessage?: (message: unknown) => void } } }
  }

  return Boolean(win.androidBridge?.postMessage || win.webkit?.messageHandlers?.bridge?.postMessage)
}

const saveCampusToLocalStorage = (campus: string): void => {
  window.localStorage.setItem(WEB_CAMPUS_STORAGE_KEY, campus)
}

const getCampusFromLocalStorage = (): string => {
  return window.localStorage.getItem(WEB_CAMPUS_STORAGE_KEY)?.trim() || ''
}

// 将选择的校区存入NativeRPC （主调方法）
export async function saveCampusToNativeRPC(campus: string): Promise<void> {
  if (!hasNativeRPCBridge()) {
    saveCampusToLocalStorage(campus)
    return
  }

  try {
    await NativeRPC.call('storage.set', {
      key: RPC_CAMPUS_STORAGE_KEY,
      value: campus
    })
  } catch (error) {
    console.error('NativeRPC 保存校区失败，已降级到 localStorage:', error)
    saveCampusToLocalStorage(campus)
  }
}

// 从NativeRPC加载上次选择的校区 （主调方法）
export async function initializeCampusFromNativeRPC(options?: {
  defaultCampus?: string
  store?: SelectionStore
}): Promise<string> {
  const defaultCampus = options?.defaultCampus ?? DEFAULT_CAMPUS
  const store = options?.store ?? useSelectionStore()
  let getCampus = ''

  if (hasNativeRPCBridge()) {
    try {
      const result = await NativeRPC.call<NativeStorageGetResponse>('storage.get', {
        key: RPC_CAMPUS_STORAGE_KEY
      })
      getCampus = result.value?.trim() || ''
    //   alert("从NativeRPC获取到校区！")
    } catch (error) {
      console.error('NativeRPC 读取校区失败，尝试读取 localStorage:', error)
      getCampus = getCampusFromLocalStorage()
    }
  } else {
    getCampus = getCampusFromLocalStorage()
    // alert("从localstorage获取到校区！")
}

  const campus = getCampus || defaultCampus

  // 没有已有的校区，则选择0202南湖校区并存入NativeRPC
  if (!getCampus) {
    await saveCampusToNativeRPC(defaultCampus)
  }

  store.updateSelectedCampuses([campus])
  return campus
}
