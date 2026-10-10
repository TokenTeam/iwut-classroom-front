/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OSS_URL?: string
  readonly VITE_CLASSROOM_DATASET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
