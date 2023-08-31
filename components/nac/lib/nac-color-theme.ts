/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/lib/nac-color-theme.ts
--------------------------------------------------------------------------------- */
export const Themes = {
  main0: 'main0',
  main1: 'main1',
  main2: 'main2',
  main3: 'main3',
  accent1: 'accent1',
  accent2: 'accent2',
  info: 'info',
  link: 'link',
  download: 'download',
  success: 'success',
  warning: 'warning',
  error: 'error',
  white: 'white',
  black: 'black',
  dark: 'dark',
  back: 'back',
  gray: 'gray',
} as const;
export type Themes = (typeof Themes)[keyof typeof Themes];
