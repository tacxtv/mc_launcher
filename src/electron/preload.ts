import { contextBridge, ipcRenderer } from 'electron'
import type { Modpack, ModpackFile } from '~~/types/modpack.type'

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: {
      getLauncherMaximizedAtStartup: () => Promise<boolean>
      setLauncherMaximizedAtStartup: (payload: boolean) => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      unmaximizeWindow: () => void
      closeWindow: () => void

      checkForUpdates: () => void
      quitAndInstallUpdate: () => void

      login: () => void
      changeAccount: (username: string) => void
      deleteAccount: (username: string) => void
      logout: () => void
      launchMinecraftVanilla: (mcVersion: string) => void
      launchMinecraft: (modpack: Modpack) => void
      getAccessToken: () => void
      clearProfiles: () => void
      currentAccount: () => Promise<string>
      getAccounts: () => Promise<any[]>

      getModpackMemory: (modpack: any) => Promise<{ min: number; max: number }>
      setModpackMemory: (modpack: any, payload: { min: number; max: number }) => void

      isModpackInstalled: (modpack: any) => Promise<boolean>
      reinstallModpack: (modpack: any) => void
      uninstallModpack: (modpack: any) => void

      getModpackJavaPath: (modpack: any) => Promise<string>
      setModpackJavaPath: (modpack: any, val: string) => void

      getModpackOptionalFiles: (modpack: any) => Promise<ModpackFile[] & { enabled: boolean }[]>
      setModpackOptionalFiles: (modpack: any, files: ModpackFile[] & { enabled: boolean }[]) => void

      getLauncherResolution: () => Promise<{ width: number; height: number; fullscreen: boolean }>
      setLauncherResolution: (payload: { width: number; height: number; fullscreen: boolean }) => void

      onMinecraftStartup: (func: (...args: any[]) => void) => void
      onMinecraftDownloadProgress: (func: (...args: any[]) => void) => void
      onMinecraftDownloadFinish: (func: (...args: any[]) => void) => void

      onMinecraftProcessReady: (func: (...args: any[]) => void) => void
      onMinecraftProcessFinish: (func: (...args: any[]) => void) => void

      onWindowLogEvent: (func: (...args: any[]) => void) => void

      selectFolderDialog: () => Promise<any>
    }
  }
}

contextBridge.exposeInMainWorld('electron', {
  getLauncherMaximizedAtStartup: () => ipcRenderer.invoke('getLauncherMaximizedAtStartup'),
  setLauncherMaximizedAtStartup: (payload: any) => ipcRenderer.send('setLauncherMaximizedAtStartup', payload),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
  unmaximizeWindow: () => ipcRenderer.send('unmaximizeWindow'),
  closeWindow: () => ipcRenderer.send('closeWindow'),

  checkForUpdates: () => ipcRenderer.send('checkForUpdates'),
  quitAndInstallUpdate: () => ipcRenderer.send('quitAndInstallUpdate'),

  logError: (...args: any[]) => ipcRenderer.invoke('logError', ...args),
  logWarn: (...args: any[]) => ipcRenderer.invoke('logWarn', ...args),
  logInfo: (...args: any[]) => ipcRenderer.invoke('logInfo', ...args),
  logVerbose: (...args: any[]) => ipcRenderer.invoke('logVerbose', ...args),
  logDebug: (...args: any[]) => ipcRenderer.invoke('logDebug', ...args),
  logSilly: (...args: any[]) => ipcRenderer.invoke('logSilly', ...args),

  getAutoLaunchIsEnabled: () => ipcRenderer.invoke('getAutoLaunchIsEnabled'),
  setAutoLaunch: (payload: any) => ipcRenderer.send('setAutoLaunch', payload),

  getAccounts: () => ipcRenderer.invoke('getAccounts'),
  currentAccount: () => ipcRenderer.invoke('currentAccount'),
  login: () => ipcRenderer.send('login'),
  changeAccount: (username: string) => ipcRenderer.send('changeAccount', username),
  deleteAccount: (username: string) => ipcRenderer.send('deleteAccount', username),
  logout: () => ipcRenderer.send('logout'),
  getAccessToken: () => ipcRenderer.send('getAccessToken'),
  clearProfiles: () => ipcRenderer.send('clearProfiles', null),
  getAllVanillaVersions: () => ipcRenderer.invoke('getAllVanillaVersions'),
  checkIfVanillaInstalled: (mcVersion: string) => ipcRenderer.invoke('checkIfVanillaInstalled', mcVersion),
  checkIfCustomInstalled: (id: string) => ipcRenderer.invoke('checkIfCustomInstalled', id),
  launchCustom: (distributionUrl: string, javaVer: string, customName: string, tweakClass: string, classPaths: string) =>
    ipcRenderer.invoke('launchCustom', distributionUrl, javaVer, customName, tweakClass, classPaths),
  launchMinecraftVanilla: (mcVersion: string) => ipcRenderer.invoke('launchMinecraftVanilla', mcVersion),
  launchMinecraft: (modpack: Modpack) => ipcRenderer.invoke('launchMinecraft', modpack),

  getLastVanillaVersion: () => ipcRenderer.invoke('getLastVanillaVersion'),
  // getGameJavaPath: (id: string, jreType: string) => ipcRenderer.invoke('getGameJavaPath', id, jreType),
  getGameMem: (id: string) => ipcRenderer.invoke('getGameMem', id),
  getGameResolution: (id: string) => ipcRenderer.invoke('getGameResolution', id),
  getGameStartInFullscreen: (id: string) => ipcRenderer.invoke('getGameStartInFullscreen', id),
  getLauncherStayOpen: (id: string) => ipcRenderer.invoke('getLauncherStayOpen', id),
  setLastVanillaVersion: (version: string) => ipcRenderer.send('setLastVanillaVersion', version),
  // setGameJavaPath: (id: string, payload: string) => ipcRenderer.send('setGameJavaPath', id, payload),
  setGameMem: (id: string, min: string, max: string) => ipcRenderer.send('setGameMem', id, min, max),
  setGameResolution: (id: string, width: string, height: string) => ipcRenderer.send('setGameResolution', id, width, height),
  setGameStartInFullscreen: (id: string, payload: string) => ipcRenderer.send('setGameStartInFullscreen', id, payload),
  setLauncherStayOpen: (id: string, payload: string) => ipcRenderer.send('setLauncherStayOpen', id, payload),

  getNotifications: () => ipcRenderer.invoke('getNotifications'),
  setNotificationRead: (id: string) => ipcRenderer.send('setNotificationRead', id),
  setNotificationArchive: (id: string) => ipcRenderer.send('setNotificationArchive', id),

  getVersion: () => ipcRenderer.invoke('getVersion'),
  getTotalMem: () => ipcRenderer.invoke('getTotalMem'),
  getFreeMem: () => ipcRenderer.invoke('getFreeMem'),
  getIsUnderMaintenance: () => ipcRenderer.invoke('getIsUnderMaintenance'),
  isWindows: () => ipcRenderer.invoke('isWindows'),
  isMacos: () => ipcRenderer.invoke('isMacos'),
  isLinux: () => ipcRenderer.invoke('isLinux'),
  loadURL: (url: string) => ipcRenderer.invoke('loadURL', url),

  onGoTo: (func: (...args: any[]) => void) => ipcRenderer.on('goTo', (_, ...args) => func(...args)),
  onUserDataFetch: (func: (...args: any[]) => void) => ipcRenderer.on('userDataFetch', (_, ...args) => func(...args)),
  onUpdateAvailable: (func: (...args: any[]) => void) => ipcRenderer.on('updateAvailable', (_, ...args) => func(...args)),
  onGameDownloadProgress: (func: (...args: any[]) => void) => ipcRenderer.on('gameDownloadProgress', (_, ...args) => func(...args)),
  onGameStartup: (func: (...args: any[]) => void) => ipcRenderer.on('gameStartup', (_, ...args) => func(...args)),
  onGameDownloadFinish: (func: (...args: any[]) => void) => ipcRenderer.on('gameDownloadFinish', (_, ...args) => func(...args)),
  onNotifications: (func: (...args: any[]) => void) => ipcRenderer.on('notifications', (_, ...args) => func(...args)),
  onSetLoginBtn: (func: (...args: any[]) => void) => ipcRenderer.on('setLoginBtn', (_, ...args) => func(...args)),
  onUpdateAccounts: (func: (...args: any[]) => void) => ipcRenderer.on('updateAccounts', (_, ...args) => func(...args)),

  getModpackMemory: (modpack: any) => ipcRenderer.invoke('getModpackMemory', modpack),
  setModpackMemory: (modpack: any, payload: any) => ipcRenderer.send('setModpackMemory', modpack, payload),

  isModpackInstalled: (modpack: any) => ipcRenderer.invoke('isModpackInstalled', modpack),
  reinstallModpack: (modpack: any) => ipcRenderer.send('reinstallModpack', modpack),
  uninstallModpack: (modpack: any) => ipcRenderer.send('uninstallModpack', modpack),

  getModpackJavaPath: (modpack: any) => ipcRenderer.invoke('getModpackJavaPath', modpack),
  setModpackJavaPath: (modpack: any, val: any) => ipcRenderer.send('setModpackJavaPath', modpack, val),

  getModpackOptionalFiles: (modpack: any) => ipcRenderer.invoke('getModpackOptionalFiles', modpack),
  setModpackOptionalFiles: (modpack: any, files: any) => ipcRenderer.send('setModpackOptionalFiles', modpack, files),

  getLauncherResolution: () => ipcRenderer.invoke('getLauncherResolution'),
  setLauncherResolution: (modpack: any, payload: any) => ipcRenderer.send('setLauncherResolution', modpack, payload),

  onMinecraftStartup: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftStartup', (_, ...args) => func(...args)),
  onMinecraftDownloadProgress: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftDownloadProgress', (_, ...args) => func(...args)),
  onMinecraftDownloadFinish: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftDownloadFinish', (_, ...args) => func(...args)),

  onMinecraftProcessReady: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftProcessReady', (_, ...args) => func(...args)),
  onMinecraftProcessFinish: (func: (...args: any[]) => void) => ipcRenderer.on('minecraftProcessFinish', (_, ...args) => func(...args)),

  onWindowLogEvent: (func: (...args: any[]) => void) => ipcRenderer.on('windowLogEvent', (_, ...args) => func(...args)),

  selectFolderDialog: () => ipcRenderer.invoke('selectFolderDialog'),
})

window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Preload script loaded')
})
