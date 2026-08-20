import NativeRPC from "@token-team/native-rpc-h5";
import { useSelectionStore } from './stores/selectionStore.ts'

const CAMPUS_STORAGE_KEY = 'classroom.campus'
const DEFAULT_CAMPUS = '0202'

type NativeStorageGetResponse = {
  value?: string
}

type SelectionStore = ReturnType<typeof useSelectionStore>

// 将选择的校区存入 NativeRPC
export async function saveCampusToNativeRPC(campus: string): Promise<void> {
  try {
    await NativeRPC.call('storage.set', {
      key: CAMPUS_STORAGE_KEY,
      value: campus
    })
    // alert("成功从存储到 NativeRPC");
  } catch (error) {
    console.error('Failed to save campus:', error)
    throw error
  }
}

// 从 NativeRPC 加载上次选择的校区
export async function initializeCampusFromNativeRPC(options?: {
  defaultCampus?: string
  store?: SelectionStore
}): Promise<string> {
  const defaultCampus = options?.defaultCampus ?? DEFAULT_CAMPUS
  const store = options?.store ?? useSelectionStore()

  let result: NativeStorageGetResponse

  try {
    result = await NativeRPC.call<NativeStorageGetResponse>('storage.get', {
      key: CAMPUS_STORAGE_KEY
    })
    // alert("成功从 NativeRPC 加载");
  } catch (error) {
    console.error('Failed to load campus:', error)
    throw error
  }

  const savedCampus = result.value?.trim() || ''
  const campus = savedCampus || defaultCampus

  if (!savedCampus) {
    await saveCampusToNativeRPC(defaultCampus)
  }

  store.updateSelectedCampuses([campus])
  return campus
}
