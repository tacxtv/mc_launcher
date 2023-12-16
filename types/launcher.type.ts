export type Launcher = {
  id: string
  name: string
  config: {
    menu: {
      reverse: boolean
      vertical: boolean
    }
    pages: {
      splash: {
        background: string
      }
      login: {
        background: string
      }
    }
  }
}
