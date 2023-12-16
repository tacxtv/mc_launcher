import type { Task } from '@xmcl/task'
import { BaseTask } from '@xmcl/task'
import { DownloadInfo, DownloadJRETask, getVersionList, installTask } from '@xmcl/installer'
import log from 'electron-log/main'
import type { ResolvedVersion } from '@xmcl/core'
import { join } from 'path'

export function installJavaTask(java: { version: string }, root: string): Task<ResolvedVersion> {
  return new InstallJavaTask(java, root)
}

class InstallJavaTask extends BaseTask<any> {
  public static JavaSources = [
    {
      url: 'https://github.com/adoptium/temurin20-binaries/releases/download/jdk-20.0.2%2B9/OpenJDK20U-jre_x64_windows_hotspot_20.0.2_9.zip',
      sha1: '4057fd534027e81d13ba56f0d09e884e1bfe4eda',
      version: 'jre-20',
    },
  ]

  public constructor(
    protected java: { version: string },
    protected root: string,
  ) {
    super()
  }

  protected runTask(attempts = 0): Promise<ResolvedVersion> {
    return new Promise(async (resolve, reject) => {
      log.info(`Installing Java/Adoptium/Temurin: `.bgGreen)
      let source = InstallJavaTask.JavaSources.find((v) => v.version === this.java.version)

      try {
        const lzmaPath = new DownloadJRETask(source, join(this.root, 'lzma-cache'), {
          unpackLZMA: async (src: string, dest: string) => {
            console.log('unpackLZMA', src, dest)
          },
          destination: join(this.root, 'lzma'),
        }).map(function () {
          return this.to!
        })
        return resolve(lzmaPath)
      } catch (e) {
        console.log('errinstall', e)
        return reject(new Error('Failed to install Java'))
      }
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
