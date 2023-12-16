<template lang='pug'>
div.fit.flex(:style='{flexFlow: "column", background: "url(" + launcher?.config?.pages?.login?.background + ") no-repeat center center fixed"}')
  div.items-center.fit.justify-center.flex.gradient
    q-inner-loading(showing)
      q-spinner-box(color='white' size='120px')
      h6.text-white.q-mt-md.q-mb-sm Vérification des mises à jour...
  q-bar
    q-space
    small v1.0.0
</template>

<script lang='ts'>
import type { Launcher } from '~~/types/launcher.type'
import type { UnwrapNestedRefs } from '@vue/reactivity'

export default defineNuxtComponent({
  inject: ['global-launcher'],
  computed: {
    launcher(): Launcher {
      return (this['global-launcher'] as UnwrapNestedRefs<{ data: Launcher }>).data
    },
  },
  methods: {
    getAccessToken() {
      window.electron?.getAccessToken()
    },
    checkForUpdates() {
      window.electron?.checkForUpdates()
    },
    clearProfiles() {
      window.electron?.clearProfiles()
    },
  },
  mounted() {
    window.electron?.checkForUpdates()
  },
})
</script>
