<template lang="pug">
q-card(flat)
  q-toolbar
    q-toolbar-title
      q-icon(name='mdi-cog' left)
      span(v-text='modpack.name')
    q-space
    q-btn(
      @click=''
      icon='mdi-folder-open'
      flat round
    )
    q-btn.text-orange(
      @click='reinstallModpack'
      icon='mdi-refresh'
      flat round
    )
    q-btn.text-red(
      @click='uninstallModpack'
      icon='mdi-delete'
      flat round
    )
  q-card-section.q-pt-sm
    q-list(bordered)
      q-expansion-item(icon='mdi-memory' label='Mémoire RAM' caption="Mémoire vive allouée à Minecraft")
        q-card(flat)
          q-card-section
            div.full-width.flex.items-center
              q-range.q-pt-lg(
                color='green'
                label-color='green'
                v-model.number='modpackMemory'
                :step='256'
                :min='1024'
                :max='16000'
                label-always
                label
                :markers="1024"
                snap
              )
                template(#marker-label-group="scope")
                  div(
                    v-for="marker in scope.markerList"
                    :key="marker.index"
                    :class="[ `text-deep-orange-${2 + Math.ceil(marker.value / 2) }`, marker.classes ]"
                    :style="marker.style"
                  )
      q-separator.q-my-sm
      q-expansion-item(icon='mdi-language-java' label='Paramètrage de Java' caption="Configuration de la machine virtuelle Java pour ce modpack")
        q-card(flat)
          q-card-section
            div.full-width.flex.items-center
              label.q-field.row.no-wrap.items-start.q-field--filled.q-input.q-field--square.q-field--dense.q-field--dark.full-width(for='file')
                .q-field__inner.relative-position.col.self-stretch
                  .q-field__control.relative-position.row.no-wrap
                    .q-field__append.q-field__marginal.row.no-wrap.items-center
                      q-btn(
                        @click='openSelectFolderDialog'
                        icon='mdi-folder-open'
                        dense
                        flat
                      )
                    .q-field__native.q-placeholder.text-weight-medium.text-white.q-px-sm
                      span(v-text='modpackJava.javaPath || "Sélectionner un dossier"')
                    .q-field__append.q-field__marginal.row.no-wrap.items-center
                      q-btn(
                        @click='clearFolderDialog'
                        icon='mdi-close'
                        dense
                        flat
                      )
              input#file(@input="selectFolderDialog" type='file' webkitdirectory='true' style='visibility: hidden; width: 0;' directory)
  q-separator.q-mb-sm.q-mx-md
  q-card-section.q-pt-sm
    q-list(bordered)
      q-expansion-item(icon='mdi-memory' label='Fonctionnalités optionnelles' caption="Ajoute/Supprime des fonctionnalités au modpack")
        q-card(flat)
          q-card-section
            div.full-width.flex.items-center(v-for='(file, key) in optionnalFiles')
              q-checkbox(
                :model-value='optionnalFiles[key].enabled'
                @update:model-value='optionnalFiles[key].enabled = $event'
                :label='file?.label || file?.path'
              )
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Modpack, ModpackFile } from '~~/types/modpack.type'

export default defineNuxtComponent({
  props: {
    modpack: {
      type: Object as PropType<Modpack>,
      required: true,
    },
  },
  data: () => ({
    modpackMemory: {
      min: 0,
      max: 0,
    },
    modpackJava: {
      javaPath: '',
    },
    optionnalFiles: [] as ModpackFile[] & { enabled: boolean }[],
  }),
  watch: {
    modpackMemory: {
      handler(payload) {
        //TODO: fix this
        window.electron.setModpackMemory(JSON.parse(JSON.stringify(this.modpack)), JSON.parse(JSON.stringify(payload)))
      },
      deep: true,
    },
    optionnalFiles: {
      handler(payload) {
        //TODO: fix this
        window.electron.setModpackOptionalFiles(JSON.parse(JSON.stringify(this.modpack)), JSON.parse(JSON.stringify(payload)))
      },
      deep: true,
    },
  },
  methods: {
    reinstallModpack() {
      window.electron.reinstallModpack(JSON.parse(JSON.stringify(this.modpack)))
    },
    uninstallModpack() {
      window.electron.uninstallModpack(JSON.parse(JSON.stringify(this.modpack)))
    },
    openSelectFolderDialog() {
      document.getElementById('file')?.click()
    },
    async clearFolderDialog() {
      this.modpackJava.javaPath = ''
      document.getElementById('file').value = ''
      window.electron.setModpackJavaPath(JSON.parse(JSON.stringify(this.modpack)), '')
      this.$nextTick(async () => {
        //TODO: fix this
        this.modpackJava.javaPath = await window.electron.getModpackJavaPath(JSON.parse(JSON.stringify(this.modpack)))
        document.getElementById('file').value = this.modpackJava.javaPath
      })
    },
    async selectFolderDialog($event: Event) {
      for (const file of $event.target?.files) {
        if (file.name !== 'java.exe' && navigator.platform === 'win32') {
          continue
        }
        let javaPath = file.path.split('\\')
        if (javaPath.length === 1) javaPath = file.path.split('/')
        this.modpackJava.javaPath = javaPath.slice(0, javaPath.length - 1).join('/')
        window.electron.setModpackJavaPath(JSON.parse(JSON.stringify(this.modpack)), this.modpackJava.javaPath)
        break
      }
    }
  },
  async mounted() {
    //TODO: fix this
    this.modpackMemory = await window.electron.getModpackMemory(JSON.parse(JSON.stringify(this.modpack)))
    //TODO: fix this
    this.modpackJava.javaPath = await window.electron.getModpackJavaPath(JSON.parse(JSON.stringify(this.modpack)))
    //TODO: fix this
    const optionnalFiles = await window.electron.getModpackOptionalFiles(JSON.parse(JSON.stringify(this.modpack)))
    const modpackOptionnalFiles = this.modpack.files.filter((file) => file.optional)
    this.optionnalFiles = modpackOptionnalFiles.map((file) => {
      const optionnalFile = optionnalFiles.find((optFile) => optFile.path === file.path) as ModpackFile & { enabled: boolean }
      return {
        ...file,
        enabled: optionnalFile?.enabled || !!file.default,
      }
    }) as ModpackFile[] & { enabled: boolean }[]
  },
})
</script>
