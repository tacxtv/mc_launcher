export interface CommonXblXstsToken {
  [key: string]: any

  IssueInstant: string
  NotAfter: string
  Token: string
  DisplayClaims: {
    xui: any[]
  }
}
