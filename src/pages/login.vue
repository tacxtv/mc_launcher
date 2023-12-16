<template lang='pug'>
div.fit.flex(:style='{flexFlow: "column"}')
  div.items-center.fit.justify-center.flex(:style='{background: "url(" + launcher?.config?.pages?.login?.background + ") no-repeat center center fixed"}')
    q-btn(label='Connexion' color='primary' size='lg' @click='getAccessToken')
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
  },
})
</script>
