/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOATCOUNTER_CODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.pdf' {
  const src: string
  export default src
}
