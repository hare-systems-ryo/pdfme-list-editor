/* ----------------------------------------------------------------------------
composables\use-store-app.ts
---------------------------------------------------------------------------- */

// [ Nuxt ]
import { defineStore } from 'pinia';
// [ vueuse ]
import { useEventListener } from '@vueuse/core';
// [ nac ]
import { Sleep } from '@/components/nac/nac-main';
// ----------------------------------------------------------------------------
interface State {
  state: {
    isInit: boolean;
    isReady: boolean;
    window: {
      h: number;
      w: number;
    };
  };
}
// ローディング終了までの時間
const isReadyDeray = 150;
// ----------------------------------------------------------------------------
export const useStoreApp = defineStore({
  id: 'StoreApp',
  state: (): State => {
    return {
      state: {
        isInit: false,
        isReady: false,
        window: {
          h: 0,
          w: 0,
        },
      },
    };
  },
  getters: {
    windowFixedW({ state }) {
      if (state.window.w !== 0) return `${state.window.w}px`;
      return `100vw`;
    },
    windowFixedH({ state }) {
      if (state.window.h !== 0) return `${state.window.h}px`;
      return `100vh`;
    },
  },
  actions: {
    async init() {
      await Sleep(0);
      const state = this.state;
      if (state.isInit) return;
      state.isInit = true;
      this.initWindowFixed();
      await Sleep(isReadyDeray);
      state.isReady = true;
    },
    initWindowFixed() {
      const state = this.state;
      useEventListener(window, 'resize', () => {
        state.window.h = window.innerHeight;
        state.window.w = window.innerWidth;
      });
      state.window.h = window.innerHeight;
      state.window.w = window.innerWidth;
    },
  },
});
