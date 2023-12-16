export type ModpackFile = {
  url: string
  path: string
  optional?: boolean
  label?: string
  default?: string
}

export type Modpack = {
  id: string
  name: string
  description: string
  launcher: string
  default: boolean
  minecraft: {
    version: string
    recommendedMemory: number
  }
  loaders: {
    type: string
    version: string
  }[]
  files: ModpackFile[]
}
