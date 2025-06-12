/// <reference types="vite/client" />

// Deklaracja dla importowania plików obrazów
declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.webp' {
  const value: string
  export default value
}