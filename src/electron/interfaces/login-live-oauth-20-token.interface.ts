export interface LoginLiveOauth20Token {
  [key: string]: any

  token_type: 'bearer'
  expires_in: number
  scope: string
  access_token: string
  refresh_token: string
  user_id: string
}
