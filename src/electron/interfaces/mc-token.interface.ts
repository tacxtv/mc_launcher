export interface McToken {
  [key: string]: any

  username: string
  roles: string[]
  access_token: string
  token_type: 'bearer'
  expires_in: number
}
