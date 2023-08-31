<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/window-loader.vue
---------------------------------------------------------------------------- */

// [ vueuse ]
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
// [ nac-Stroe ]
import { _useStoreNac } from '../nac-store';
import { Int, GetTextByMultiLang } from '../lib/nac-func';

// ----------------------------------------------------------------------------
// [ nac-Stroe ]
const storeNac = _useStoreNac();
// [ reactive ]
const state = storeNac.windowLoader.state;
// ----------------------------------------------------------------------------
// [ focusTrap ]
const focusTrapElm = ref<HTMLElement | null>(null);
const { hasFocus, activate, deactivate } = useFocusTrap(focusTrapElm);
watch(
  () => state.isShow,
  () => {
    if (state.isShow) {
      activate();
    } else {
      deactivate();
    }
  }
);
// ----------------------------------------------------------------------------
</script>
<template>
  <div ref="focusTrapElm" class="nac-wl-container" :class="{ show: state.isShow }" :style="{ 'z-index': state.zindex }">
    <div class="nac-wl-body">
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
      <div class="nac-wl-text">
        {{ GetTextByMultiLang({ ja: 'しばらくお待ち下さい。', en: '' }, storeNac.lang) }}
      </div>
      <input type="checkbox" class="dummy" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$base-color-modal: rgba(0, 0, 0, 0.411);

//--------------------------------------------

//ダミー用
.dummy {
  opacity: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}
.nac-wl-container {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: $base-color-modal;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 300ms;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  &.show {
    pointer-events: all;
    opacity: 1;
  }

  .nac-wl-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .nac-wl-text {
    padding: 18px 0 0 0;
    font-size: 20px;
    line-height: 1em;
    color: white;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    @media screen and (min-width: #{ 0 }px) and (max-width: #{ 600 - 0.1}px) {
      font-size: 16px;
    }
    outline: none;
    &:focus {
      background-color: red;
    }
  }

  .sk-cube-grid {
    width: 130px;
    height: 130px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .sk-cube {
    width: calc(33.33% - 2px);
    height: calc(33.33% - 2px);
    margin: 1px;
    background-color: rgba(37, 243, 233, 0.767);
    animation: sk-cube-grid-scale-delay 1.3s infinite ease-in-out;
  }

  .sk-cube1 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }

  .sk-cube2 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }

  .sk-cube3 {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
  }

  .sk-cube4 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }

  .sk-cube5 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }

  .sk-cube6 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }

  .sk-cube7 {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
  }

  .sk-cube8 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }

  .sk-cube9 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
}
</style>

<style lang="scss">
@keyframes sk-cube-grid-scale-delay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1, 1, 1);
    transform: scale3D(1, 1, 1);
  }

  35% {
    -webkit-transform: scale3D(0, 0, 1);
    transform: scale3D(0, 0, 1);
  }
}
</style>
