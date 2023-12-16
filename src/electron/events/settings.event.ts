import { BrowserWindow, app, ipcMain } from 'electron'
import Store from 'electron-store'
import log from 'electron-log/main'
// noinspection ES6PreferShortImport
import type { Modpack, ModpackFile } from '../../../types/modpack.type'

const store = new Store()

export class SettingsEvent {
  public static name = 'SettingsEvent'
  public async registerEvents(): Promise<void> {
    ipcMain.handle('getLauncherJavaPath', () => {
      return store.get('launcher_javaPath') // TODO: default value
    })
    ipcMain.on('setLauncherJavaPath', (_, val) => {
      store.set('launcher_javaPath', val) // TODO: default value
    })

    ipcMain.handle('getLauncherResolution', () => {
      return {
        width: store.get('launcher_resolution_width', 854),
        height: store.get('launcher_resolution_height', 480),
        fullscreen: store.get('launcher_resolution_fullscreen', false),
      }
    })
    ipcMain.on('setLauncherResolution', (_, val) => {
      store.set('launcher_resolution_width', val.width)
      store.set('launcher_resolution_height', val.height)
      store.set('launcher_resolution_fullscreen', val.fullscreen)
    })

    ipcMain.handle('getModpackMemory', (_, modpack: Modpack) => {
      return {
        min: store.get(modpack.name + '_minMemory', 1024),
        max: store.get(modpack.name + '_maxMemory', modpack.minecraft.recommendedMemory || 2048),
      }
    })
    ipcMain.on('setModpackMemory', (_, modpack: Modpack, val) => {
      store.set(modpack.name + '_minMemory', val.min)
      store.set(modpack.name + '_maxMemory', val.max)
    })

    ipcMain.handle('getLauncherStayInOpen', () => {
      return store.get('launcher_stayInOpen', false)
    })
    ipcMain.on('setLauncherStayInOpen', (_, val) => {
      store.set('launcher_stayInOpen', val)
    })

    ipcMain.handle('getModpackOptionalFiles', (_, modpack: Modpack) => {
      return store.get(modpack.name + '_files', [])
    })
    ipcMain.on('setModpackOptionalFiles', (_, modpack: Modpack, files: ModpackFile[] & { enabled: boolean }[]) => {
      store.set(modpack.name + '_files', files)
    })

    log.info('SettingsEvent registered')
  }
}
