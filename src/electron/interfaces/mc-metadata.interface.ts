import type { McToken } from './mc-token.interface'
import type { LoginLiveOauth20Token } from './login-live-oauth-20-token.interface'
import type { CommonXblXstsToken } from './common-xbl-xsts-token.interface'
import type { McInfo } from './mc-info.interface'

export interface McMetadata {
  authToken: LoginLiveOauth20Token
  mcInfo: McInfo
  mcToken: McToken
  xbl: CommonXblXstsToken
  xsts: CommonXblXstsToken
}
