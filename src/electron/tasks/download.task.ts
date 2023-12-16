import { BaseTask } from '@xmcl/task'
import type { Task } from '@xmcl/task'
import { join } from 'path'
import { download } from '@xmcl/file-transfer'

export function downloadTask(root: string, files: any[] = []): Task<any> {
  return new DownloadTask(root, files)
}

class DownloadTask extends BaseTask<any> {
  public constructor(protected root: string, protected files: any[] = []) {
    super()
  }

  protected runTask(): Promise<any> {
    return new Promise(async (resolve) => {
      for (const file of this.files) {
        try {
          await download({
            url: file.url,
            destination: join(this.root, file?.path),
            // progressController: (_: any, __: any, progress: number, total: number) => {
            //   const value = Math.round((progress / total) * 100)
            //   log.info('Download progress mod', progress, total)
            //   sendMainWindowWebContent('gameDownloadProgress', { id: 'minecraft', value })
            // }
          })
        } catch (e) {
          console.log('err', e)
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
