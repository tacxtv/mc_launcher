import { BaseTask } from '@xmcl/task'
import type { Task } from '@xmcl/task'
import { join } from 'path'
import log from 'electron-log/main'
import { unlinkSync } from 'fs'
import { sync } from 'glob'
import { sep } from 'path'

const defaultWhitelist = [
  'assets/**/*',
  'config/**/*',
  'crash-reports/**/*',
  'defaultconfigs/**/*',
  'libraries/**/*',
  'logs/**/*',
  'resourcepacks/**/*',
  'shaderpacks/**/*',
  'saves/**/*',
  'schematics/**/*',
  'versions/**/*',
  'data/**/*',
  'options.txt',
  'servers.dat',
]

export function safedeleteTask(root: string, files: any[] = [], options = {}): Task<any> {
  return new SafedeleteTask(root, files)
}

class SafedeleteTask extends BaseTask<any> {
  public constructor(protected root: string, protected files: any[] = [], protected options: {whitelist?: []} = {}) {
    super()
  }

  protected runTask(): Promise<any> {
    return new Promise(async (resolve) => {
      log.info('Checking for files to delete...'.bgRed)
      const files = sync('**/*.*', {
        cwd: this.root,
        follow: false,
        ignore: [...defaultWhitelist, ...this.options?.whitelist || []],
        withFileTypes: true,

      })
      for (const file of files) {
        const partPath = file.path?.replace(this.root + sep, '')
        const partPathFile = join(partPath, file.name).replace(sep, '/')
        const fileNotInDownloads = !this.files.find((f) => f.path === partPathFile)
        if (fileNotInDownloads) {
          log.info(`Delete file ${file.fullpath()}`.bgRed)
          unlinkSync(file.fullpath())
        }
      }
      resolve(true)
    })
  }

  protected cancelTask(): Promise<void> {
    return Promise.resolve()
  }

  protected pauseTask(): Promise<void> {
    return Promise.resolve()
  }

  protected resumeTask(): Promise<void> {
    return Promise.resolve()
  }
}
