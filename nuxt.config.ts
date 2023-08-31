// htps://nuxt.com/docs/api/configuration/nuxt-config
import p from './package.json';
export default defineNuxtConfig({
  devtools: { enabled: String(process.env.APP_ENV) !== 'production' },
  nitro: {
    preset: 'node-server',
  },
  sourcemap: true,
  // devServer: {
  //   port: 3000,
  // },
  modules: [
    '@pinia/nuxt',
    [
      '@nuxtjs/eslint-module',
      {
        formatter: 'stylish',
      },
    ],
    [
      '@invictus.codes/nuxt-vuetify',
      {
        vuetifyOptions: {
          theme: {
            defaultTheme: 'myTheme',
            themes: {
              myTheme: {
                dark: false,
                colors: {
                  main0: '#192a61',
                  main1: '#1c03a2',
                  main2: '#4443ff',
                  main3: '#628cff',
                  accent1: '#ff8000',
                  accent2: '#ffac7c',
                  info: '#ac80ff',
                  link: '#0fa17e',
                  download: '#11691f',
                  success: '#2bb60c',
                  warning: '#efb819',
                  error: '#d80329',
                  white: '#FFF',
                  black: '#000',
                  dark: '#224466',
                  gray: '#babac9',
                  back: '#EDF2F7',
                },
              },
            },
          },
        },
        moduleOptions: {
          treeshaking: true,
          useIconCDN: true,
          styles: 'sass',
          autoImport: true,
        },
      },
    ],
  ],
  runtimeConfig: {
    public: {
      app: {
        packageName: String(p.name) as string,
        version: String(p.version) as string,
      },
    },
  },
  css: ['@/assets/scss/main.scss'],
});
