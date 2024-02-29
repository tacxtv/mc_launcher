import { app, ipcMain } from 'electron'
import Store from 'electron-store'
import log from 'electron-log/main'
// noinspection ES6PreferShortImport
import type { Modpack, ModpackFile } from '../../../types/modpack.type'
import { join } from 'path'
import { rmSync } from 'fs'

const store = new Store()

export class SettingsEvent {
  public static name = 'SettingsEvent'
  public async registerEvents(): Promise<void> {
    ipcMain.handle('getModpackJavaPath', (_, modpack: Modpack) => {
      return store.get(modpack.name + '_javaPath') || join(process.env.JAVA_HOME!, 'bin', 'java')
    })
    ipcMain.on('setModpackJavaPath', (_, modpack: Modpack, val) => {
      store.set(modpack.name + '_javaPath', val ? join(val, 'java') : null)
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

    ipcMain.handle('isModpackInstalled', (_, modpack: Modpack) => {
      return store.get(`installed_task_${modpack.name}_minecraft`, false)
    })
    ipcMain.on('reinstallModpack', (_, modpack: Modpack) => {
      store.delete(`installed_task_${modpack.name}_minecraft`)
      for (const loader of modpack.loaders) {
        switch (loader.type) {
          case 'forge':
            store.delete(`installed_task_${modpack.name}_forge_${loader.version}`)
            break
          case 'neoforge':
            store.delete(`installed_task_${modpack.name}_neoforge_${loader.version}`)
            break
          case 'fabric':
            store.delete(`installed_task_${modpack.name}_fabric_${loader.version}`)
            break
        }
      }
    })
    ipcMain.on('uninstallModpack', (_, modpack: Modpack) => {
      rmSync(join(app.getAppPath(), 'instances', modpack.id), { recursive: true, force: true })
      store.delete(`installed_task_${modpack.name}_minecraft`)
      for (const loader of modpack.loaders) {
        switch (loader.type) {
          case 'forge':
            store.delete(`installed_task_${modpack.name}_forge_${loader.version}`)
            break
          case 'fabric':
            store.delete(`installed_task_${modpack.name}_fabric_${loader.version}`)
            break
        }
      }
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
