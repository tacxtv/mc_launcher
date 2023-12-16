import { BrowserWindow, dialog, ipcMain, session } from 'electron'
import log from 'electron-log'
import Store from 'electron-store'
import { createLoginWindow, destroyLoginWindow, getLoginWindow, sendLoginWindowWebContent } from '../windows/loginWindow'
import { createMainWindow, destroyMainWindow, getMainWindow, sendMainWindowWebContent } from '../windows/mainWindow'
import { destroyUpdateWindow, getUpdateWindow } from '../windows/updateWindow'
import { decode } from 'jsonwebtoken'
import { AuthHandler } from '../handlers/auth.handler'
import type { McMetadata } from '../interfaces/mc-metadata.interface'
import type { LoginLiveOauth20Token } from '../interfaces/login-live-oauth-20-token.interface'
import type { McInfo } from '../interfaces/mc-info.interface'

const store = new Store({
  name: 'accounts',
  encryptionKey: 'MCSL',
})
let authWindowclosedByUser = true
const CLIENT_ID = '7347d7b7-f14d-40c4-af19-f82204a7851e'
const REDIRECT_URL = 'https://login.microsoftonline.com/common/oauth2/nativeclient'

export class AuthService {
  public static name = 'AuthService'
  public async registerEvents(): Promise<void> {
    ipcMain.handle('getAccounts', async () => {
      const accounts: any = store.get('accounts')
      if (accounts === null || accounts === undefined || accounts.length <= 0) return
      log.info('getAccounts')
      const res: any = []
      console.log('accounts', accounts)
      accounts.forEach((account: any) => {
        res.push({
          id: account.id,
          username: account.username,
          skinUrl: account.skinUrl,
          crafatar: {
            avatars: `https://crafatar.com/avatars/${account.id}`,
            renders: {
              head: `https://crafatar.com/avatars/${account.id}`,
              body: `https://crafatar.com/avatars/${account.id}`,
            },
          },
        })
      })
      log.info(JSON.stringify(res))
      return res
    })

    ipcMain.handle('currentAccount', () => {
      return store.get('current-account')
    })

    ipcMain.on('login', async () => {
      await AuthService.login()
    })

    ipcMain.on('changeAccount', async (event, username: string) => {
      log.info('changeAccount', username)
      if (username === (<any>global).share.auth.name) return
      ;(<any>global).share.auth.access_token = ''
      ;(<any>global).share.auth.xuid = ''
      ;(<any>global).share.auth.uuid = ''
      ;(<any>global).share.auth.name = ''
      await session.defaultSession.clearCache()
      await session.defaultSession.clearStorageData()
      const accounts: any = store.get('accounts')
      const index = accounts.findIndex((a: any) => a.username === username)
      if (index === -1) {
        log.error(`Can't find the token for ${username}`)
        return
      }
      await AuthService.loginUser(accounts[index].token, true)
    })

    ipcMain.on('deleteAccount', async (event, username: string) => {
      log.info('deleteAccount', username)
      const accounts: any = store.get('accounts')
      const newAccounts = accounts.filter((account: any) => account.username !== username)
      store.set('accounts', newAccounts)
      if (username === (<any>global).share.auth.name) {
        await AuthService.logout()
      } else {
        sendMainWindowWebContent('updateAccounts', { id: username })
      }
    })

    ipcMain.on('logout', async () => {
      log.info('logout')
      await AuthService.logout()
    })

    ipcMain.on('getAccessToken', async () => {
      log.info('storeb', store.store)
      log.info('(<any>global).share.auth', (<any>global).share.auth)
      await AuthService.authWithMicrosoft()
    })

    ipcMain.on('clearProfiles', async () => {
      log.info('storeb', store.store)
      await AuthService.clearCookies()
      store.clear()
      log.info('storea', store.store)
    })

    log.info('AuthService registered')
  }

  public static async login(): Promise<void> {
    const currAccount = store.get('current-account')
    if (currAccount === undefined) {
      await createLoginWindow()
      destroyUpdateWindow()
      return
    }
    const accounts: any = store.get('accounts')
    const index = accounts.findIndex((account: any) => account.username === currAccount)
    if (index > -1) {
      log.info('Already logged in. Get account infos...')
      await AuthService.loginUser(accounts[index])
    } else {
      await createLoginWindow()
      destroyUpdateWindow()
    }
  }

  public static async saveUserInfos(accessToken: string, refreshToken: string, mcInfo: McInfo, transparent = false): Promise<void> {
    if (mcInfo === null) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Compte invalide',
        message: 'Ce compte ne peut pas se connecter à Minecraft. Veuillez ressayer avec un autre.',
      })
      return
    }
    const decoded: any = decode(accessToken)
    ;(<any>global).share.auth.access_token = accessToken
    ;(<any>global).share.auth.xuid = decoded.xuid
    ;(<any>global).share.auth.uuid = mcInfo.id
    ;(<any>global).share.auth.name = mcInfo.name
    const accounts: any = store.get('accounts')
    const accountData = {
      id: mcInfo.id,
      username: mcInfo.name,
      token: accessToken || '',
      refreshToken: refreshToken || '',
      skinUrl: mcInfo.skins[0].url,
    }
    // console.log('accountData', accountData)
    if (accounts) {
      const index = accounts.findIndex((a: any) => a.username === mcInfo.name)
      if (index === -1) {
        accounts.push(accountData)
        store.set('accounts', accounts)
      } else {
        accounts[index] = accountData
        store.set('accounts', accounts)
      }
    } else {
      store.set('accounts', [accountData])
    }
    store.set('current-account', accountData.username)
    if (!transparent) {
      await createMainWindow()
      destroyUpdateWindow()
      const mainWindow = getMainWindow()
      mainWindow?.webContents.send('userDataFetch', {
        username: mcInfo.name,
        skinUrl: mcInfo.skins[0].url,
      })
    }
  }

  public static async loginUser(account: any, changeAccount = false, transparent = false) {
    let accessToken = account.token
    let refreshToken = account.refreshToken
    console.log('accessToken', accessToken)
    console.log('refreshToken', refreshToken)
    if (accessToken === undefined && refreshToken === undefined) {
      await createLoginWindow()
      destroyUpdateWindow()
      return
    }
    let mcInfo: McInfo | null = null
    let authInfo: McMetadata | null = null
    try {
      const authHandler = new AuthHandler(CLIENT_ID, REDIRECT_URL)
      authInfo = await authHandler.getAuthCodes(refreshToken, true)
      // authInfo = await authHandler.authCodeToAuthToken(refreshToken, true)
      console.log('authInfo', authInfo)
      accessToken = authInfo?.mcToken.access_token
      refreshToken = authInfo?.authToken.refresh_token
      mcInfo = await authHandler.getMCInfoWithToken(accessToken)
    } catch (e) {
      log.error('Error, the token is expired.', e)
      await AuthService.authWithMicrosoft(!changeAccount)
      return
    }
    console.log('transparent', transparent)
    await AuthService.saveUserInfos(accessToken, refreshToken, mcInfo, transparent)
  }

  public static async authWithMicrosoft(hidden = false): Promise<void> {
    const authHandler = new AuthHandler(CLIENT_ID, REDIRECT_URL)
    const authWindow = new BrowserWindow({
      alwaysOnTop: true,
      modal: true,
      autoHideMenuBar: true,
      title: 'Authservice',
      parent: hidden ? getUpdateWindow() || undefined : getLoginWindow() || undefined, // TODO: fix this
      frame: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        devTools: false,
      },
    })
    authWindowclosedByUser = true
    authWindow.setMenu(null)
    authWindow.webContents.on('did-finish-load', () => {
      if (authWindow && !hidden) authWindow.show()
      if (hidden) {
        setTimeout(() => {
          if (authWindow && !authWindow.isFocused()) authWindow.show()
        }, 3000)
      }
    })
    authWindow.on('closed', () => {
      log.info('authWindow closed')
      if (authWindowclosedByUser) {
        sendLoginWindowWebContent('setLoginBtn', false)
      }
    })
    console.log('authHandler.forwardUrl', authHandler.forwardUrl)
    // noinspection ES6MissingAwait
    authWindow.loadURL(authHandler.forwardUrl)
    const filter = { urls: [REDIRECT_URL] }
    session.defaultSession.webRequest.onCompleted(filter, async (details) => {
      // console.log('details', details)
      authWindowclosedByUser = false
      authWindow.close()
      const code = details.url.split('=')[1].split('&')[0]
      console.log('code', code)
      if (!code) {
        log.error('ERROR: The MC code is null.')
        sendLoginWindowWebContent('setLoginBtn', false)
        await AuthService.clearCookies()
        return
      }
      let result: McMetadata | null = null
      try {
        result = await authHandler.getAuthCodes(code)
      } catch (e) {
        log.error('Error, the token is expired.', e)
        await dialog.showMessageBox({
          type: 'error',
          title: 'Compte invalide',
          message: 'Ce compte ne peut pas se connecter à Minecraft. Veuillez ressayer avec un autre.',
        })
        sendLoginWindowWebContent('setLoginBtn', false)
        return
      }
      if (result === null) {
        log.error('ERROR: The MC token is null.')
        sendLoginWindowWebContent('setLoginBtn', false)
        await AuthService.clearCookies()
        return
      }
      await AuthService.saveUserInfos(result.mcToken.access_token, result.authToken.refresh_token, result.mcInfo)
      hidden ? destroyUpdateWindow() : destroyLoginWindow()
    })
  }

  public static async refreshCurrentAccessToken(): Promise<void> {
    const currAccount = store.get('current-account')
    console.log('currAccount', currAccount)
    const accounts: any = store.get('accounts')
    const index = accounts.findIndex((account: any) => account.username === currAccount)
    await AuthService.loginUser(accounts[index], false, true)
  }

  public static async clearCookies(): Promise<void> {
    try {
      await session.defaultSession.clearStorageData({ storages: ['cookies'] })
      log.info('All cookies cleared')
    } catch (e) {
      log.error('Failed to clear cookies: ', e)
    }
  }

  public static async logout(): Promise<void> {
    store.set('current-account', null)
    ;(<any>global).share.auth.access_token = ''
    ;(<any>global).share.auth.xuid = ''
    ;(<any>global).share.auth.uuid = ''
    ;(<any>global).share.auth.name = ''
    await session.defaultSession.clearCache()
    await session.defaultSession.clearStorageData()
    await createLoginWindow()
    destroyMainWindow()
  }
}
