// noinspection JSUnusedGlobalSymbols

process.env.NUXT_APP_BASE_URL = './'
process.env.NUXT_APP_BUILD_ASSETS_DIR = './'

export default defineNuxtConfig({
  telemetry: false,
  ssr: false,
  pages: true,
  components: true,
  srcDir: 'src',
  // debug: process.env.NODE_ENV === 'development',
  devtools: { enabled: true },
  typescript: {
    shim: false,
  },
  router: {
    options: {
      hashMode: true,
    },
  },
  css: ['~/assets/sass/global.sass'],
  runtimeConfig: {
    app: {
      baseURL: './aa',
      buildAssetsDir: './',
    },
  },
  app: {
    baseURL: './',
    buildAssetsDir: './',
    head: {
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  modules: ['nuxt-electron', 'nuxt-quasar-ui', 'nuxt-vuefire'],
  electron: {
    build: [
      { entry: 'src/electron/main.ts' },
      {
        entry: 'src/electron/preload.ts',
        onstart(options: any) {
          options.reload()
        },
      },
    ],
    renderer: {},
  },
  quasar: {
    iconSet: 'mdi-v5',
    plugins: ['Notify', 'Dialog'],
    config: {
      dark: 'auto',
      notify: {
        timeout: 2500,
        position: 'top-right',
        actions: [{ icon: 'mdi-close', color: 'white' }],
      },
    },
  },
  vuefire: {
    config: {
      apiKey: 'AIzaSyBy8w3FSDbG4-oo8iReiz9GcnaOHYixbwo',
      authDomain: 'mcslapp.firebaseapp.com',
      projectId: 'mcslapp',
      storageBucket: 'mcslapp.appspot.com',
      messagingSenderId: '359296730158',
      appId: '1:359296730158:web:0c0aadcf89662c11c0cbbf',
      measurementId: 'G-5S0Q2MQ90B',
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['./src/electron/**/*.ts', './types/**/*.ts'],
      },
    },
    server: {
      middlewareMode: false,
    },
  },
})
