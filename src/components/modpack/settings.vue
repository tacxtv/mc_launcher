<template lang="pug">
q-card(flat)
  q-toolbar
    q-toolbar-title
      q-icon(name='mdi-cog' left)
      span(v-text='modpack.name')
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
  async mounted() {
    this.modpackMemory = await window.electron.getModpackMemory(JSON.parse(JSON.stringify(this.modpack)))
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
