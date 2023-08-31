/* ---------------------------------------------------------------------------------
  nuxt-app-components
  nac/type/type-window-loader.ts
--------------------------------------------------------------------------------- */

export namespace WindowLoader {
  export const NamespaceName = 'WindowLoader';
  export interface Controler {
    Show: () => void;
    Hide: () => void;
  }
}
