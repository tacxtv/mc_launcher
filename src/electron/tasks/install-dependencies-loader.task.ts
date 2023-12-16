import type { Task } from '@xmcl/task'
import { BaseTask } from '@xmcl/task'
import { installDependenciesTask } from '@xmcl/installer'
import type { Options } from '@xmcl/installer'
import { Version } from '@xmcl/core'
// noinspection ES6PreferShortImport
import { FABRIC_LOADER, FORGE_LOADER } from '../../../types/loader.type'

export function installDependenciesLoaderTask(
  loader: { version: string; mcversion: string; type: string },
  root: string,
  options: Options = {},
): Task<any> {
  return new InstallDependenciesLoaderTask(loader, root, options)
}

class InstallDependenciesLoaderTask extends BaseTask<any> {
  public constructor(
    protected loader: { version: string; mcversion: string; type: string },
    protected root: string,
    protected options: Options = {},
  ) {
    super()
  }

  protected runTask(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let mcversion = [this.loader.mcversion]
      switch (this.loader.type) {
        case FORGE_LOADER: {
          mcversion.push(this.loader.type)
          mcversion.push(this.loader.version)
          break
        }
        case FABRIC_LOADER: {
          mcversion.push('fabric' + this.loader.version)
          break
        }
      }
      const loaderResolved = await Version.parse(this.root, mcversion.join('-'))
      const resolved = await installDependenciesTask(loaderResolved)
        .setName('installDependencies')
        .startAndWait({
          onSucceed(task: Task<any>, result: any) {
            process.stdout.write('.'.green)
          },
          onFailed(task: Task<any>, error: any) {
            process.stdout.write('!'.red)
          },
        })
      return resolve(resolved)
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
