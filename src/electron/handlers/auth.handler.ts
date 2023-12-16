import axios from 'axios'
import log from 'electron-log/main'
import type { McToken } from '../interfaces/mc-token.interface'
import type { McMetadata } from '../interfaces/mc-metadata.interface'
import type { LoginLiveOauth20Token } from '../interfaces/login-live-oauth-20-token.interface'
import type { CommonXblXstsToken } from '../interfaces/common-xbl-xsts-token.interface'
import type { McInfo } from '../interfaces/mc-info.interface'

export class AuthHandler {
  public constructor(
    protected clientId: string,
    protected redirectUri: string,
  ) {}

  public get forwardUrl() {
    return [
      'https://login.live.com/oauth20_authorize.srf',
      [
        `client_id=${this.clientId}`,
        'response_type=code',
        `redirect_uri=${this.redirectUri}`,
        'response_mode=fragment',
        'scope=XboxLive.signin%20offline_access',
      ].join('&'),
    ].join('?')
  }

  public async getAuthCodes(code: string, refresh = false): Promise<McMetadata> {
    if (!code) throw new Error('code is required')
    const authToken = await this.authCodeToAuthToken(code, refresh)
    const xbl = await this.authTokenToXBL(authToken)
    const xsts = await this.xblToXsts(xbl)
    const mcToken = await this.xstsToMc(xsts)
    const mcInfo = await this.getMCInfoWithToken(mcToken.access_token)
    return {
      authToken,
      mcInfo,
      mcToken,
      xbl,
      xsts,
    }
  }

  public async authCodeToAuthToken(code: string, refresh = false): Promise<LoginLiveOauth20Token> {
    const data: string[] = [`client_id=${this.clientId}`, `redirect_uri=${this.redirectUri}`]
    if (refresh) {
      data.push('grant_type=refresh_token')
      data.push(`refresh_token=${code}`)
    } else {
      data.push('grant_type=authorization_code')
      data.push(`code=${code}`)
    }
    try {
      const res = await axios({
        method: 'post',
        url: 'https://login.live.com/oauth20_token.srf',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data.join('&'),
      })
      return res.data
    } catch (e) {
      throw new Error(`Error, the ${refresh ? 'refresh_token' : 'authorization_code'} is expired.`)
    }
  }

  public async authTokenToXBL(authToken: LoginLiveOauth20Token): Promise<CommonXblXstsToken> {
    const data = `{
			"Properties": {
				"AuthMethod": "RPS",
				"SiteName": "user.auth.xboxlive.com",
				"RpsTicket": "d=${authToken.access_token}"
			},
			"RelyingParty": "http://auth.xboxlive.com",
			"TokenType": "JWT"
 		}`
    try {
      const res = await axios({
        method: 'post',
        url: 'https://user.auth.xboxlive.com/user/authenticate',
        data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      return res.data
    } catch (e) {
      throw new Error('Error, the access_token to XBL is expired.')
    }
  }

  public async xblToXsts(xbl: CommonXblXstsToken): Promise<CommonXblXstsToken> {
    const data = `{
			"Properties": {
				"SandboxId": "RETAIL",
				"UserTokens": [
						"${xbl.Token}"
				]
			},
			"RelyingParty": "rp://api.minecraftservices.com/",
			"TokenType": "JWT"
		}`
    try {
      const res = await axios({
        method: 'post',
        url: 'https://xsts.auth.xboxlive.com/xsts/authorize',
        data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      return res.data
    } catch (e) {
      throw new Error('Error, the XBL Token to Xsts is expirated.')
    }
  }

  public async xstsToMc(xsts: CommonXblXstsToken): Promise<McToken> {
    const data = `{
			"identityToken": "XBL3.0 x=${xsts.DisplayClaims.xui[0].uhs};${xsts.Token}"
	 		}`
    // try {
      const res = await axios({
        method: 'post',
        url: 'https://api.minecraftservices.com/authentication/login_with_xbox',
        data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      return res.data
    // } catch (e) {
    //   throw new Error('Error, the XSTS Token to McToken is expirated.')
    // }
  }

  public async getMCInfoWithToken(mcToken: string): Promise<McInfo> {
    try {
      const res = await axios({
        method: 'get',
        url: 'https://api.minecraftservices.com/minecraft/profile',
        headers: {
          Authorization: `Bearer ${mcToken}`,
        },
      })
      return res.data
    } catch (e: any) {
      log.error('Error, the token is expired.' + e.message)
      throw new Error('Error, the token is expired.', e)
    }
  }
}
