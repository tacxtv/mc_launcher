<template lang="pug">
q-card(flat)
  q-toolbar
    q-toolbar-title
      q-icon(name='mdi-rocket-launch' left)
      | Launcher
  q-card-section.q-pt-sm
    q-list(bordered)
      q-expansion-item(icon='mdi-move-resize' label='Résolution' caption="Résolution appliquée au lancement de Minecraft")
        q-card(flat)
          q-card-section
            div.full-width.flex.items-center
              q-input(v-model.number='resolution.width' type='number' filled square dense)
              q-icon.q-px-md(name='mdi-close')
              q-input(v-model.number='resolution.height' type='number' filled square dense)
              q-checkbox.q-px-md(v-model='resolution.fullscreen' label='Plein écran' dense)
      q-separator.q-my-sm
      q-expansion-item(icon='mdi-move-resize' label='Résolution' caption="Résolution appliquée au lancement de Minecraft")
        q-card(flat)
          q-card-section
            div.full-width.flex.items-center
              q-input(v-model.number='resolution.width' type='number' filled square dense)
              q-icon.q-px-md(name='mdi-close')
              q-input(v-model.number='resolution.height' type='number' filled square dense)
              q-checkbox.q-px-md(v-model='resolution.fullscreen' label='Plein écran' dense)
</template>

<script lang="ts">
import { ref } from 'vue'

export default defineNuxtComponent({
  data: () => ({
    resolution: {
      width: 0,
      height: 0,
      fullscreen: false,
    },
  }),
  watch: {
    resolution: {
      handler(payload) {
        //TODO: fix this
        window.electron.setLauncherResolution(JSON.parse(JSON.stringify(payload)))
      },
      deep: true,
    },
  },
  async mounted() {
    this.resolution = await window.electron.getLauncherResolution()
  },
})

const resolution = ref(['856', '482'])
</script>
