export interface McInfo {
  [key: string]: any

  id: string
  name: string
  skins: {
    [key: string]: any

    id: string
    state: string
    url: string
    variant: string
    textureKey: string
  }[]
  capes: {
    [key: string]: any

    id: string
    state: string
    url: string
  }[]
  profileActions: {
    [key: string]: any
  }
}
