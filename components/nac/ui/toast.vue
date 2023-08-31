<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/toast.vue
---------------------------------------------------------------------------- */

// [ vueuse ]
import { watchArray } from '@vueuse/core';
// [ nac ]
import { Int, GetTextByMultiLang } from '../lib/nac-func';
// [ nac-Stroe ]
import { _useStoreNac } from '../nac-store';
// [ nac-type ] ---------------------
import { Toast } from '../type/type-toast';
// ----------------------------------------------------------------------------
// [ nac-Stroe ]
const storeNac = _useStoreNac();
// storeNac.init().toast();
const state = storeNac.toast.state;
// ----------------------------------------------------------------------------
const lang = computed(() => storeNac.lang);
// ----------------------------------------------------------------------------
// 要素を消し始めから完全に消すのにかかる時間（Accordionの動作時間）
const hideSpan = 300;
const showCount = computed(() => {
  const list = state.pendingList.filter((row) => row.isShow);
  return list.length;
});
// ----------------------------------------------------------------------------
watch(
  () => showCount.value,
  () => {
    setTimeout(() => {
      if (showCount.value === 0 && state.pendingList.length !== 0) {
        state.pendingList.length = 0;
      }
    }, hideSpan);
  }
);

watchArray(state.pendingList, (newList, oldList, added, removed) => {
  if (added.length === 0 && removed.length > 0) return;
  const keyMap = newList.map((row) => row.key);
  newList.forEach((message) => {
    if (message.hideAfter !== 0) {
      setTimeout(() => {
        if (message.isShow === false) return;
        deleteMessage(message);
      }, message.hideAfter);
    }
  });
});

const deleteMessage = (message: Toast.Message) => {
  message.isShow = false;
};
const style = (message: Toast.Message) => {
  let d = Int(message.hideAfter);
  if (d < 0) d = 0;
  return {
    'animation-duration': d + 'ms',
  };
};
// ----------------------------------------------------------------------------
</script>
<template>
  <div class="nac-toast-base" :style="{ 'z-index': state.zindex }">
    <div v-show="state.pendingList.length != 0" class="nac-toast-container">
      <template v-for="(message, index) in state.pendingList" :key="index">
        <nac-ui-accordion class="nac-toast-accordion" :span="hideSpan" :is-show="message.isShow">
          <div class="nac-toast card" @click.stop="" @mousedown.stop="" @mouseup.stop="">
            <div :class="`card-body bg-${message.theme}`">
              <div class="nac-toast-body">
                <div class="nac-toast-icon" :data-icon="message.theme"></div>
                <div class="nac-toast-text">
                  <div v-if="GetTextByMultiLang(message.title, lang).length > 0" class="nac-toast-title">
                    {{ GetTextByMultiLang(message.title, lang) }}
                  </div>
                  <div
                    v-if="GetTextByMultiLang(message.message, lang).length > 0"
                    class="nac-toast-message"
                    :class="{ withIcon: message.title.length === 0 }"
                  >
                    {{ GetTextByMultiLang(message.message, lang) }}
                  </div>
                </div>
                <v-btn class="nac-toast-close" size="" variant="text" @click="deleteMessage(message)">
                  <i class="fas fa-times"></i>
                </v-btn>
              </div>
              <div v-if="message.hideAfter != 0" class="nac-toast-bar" :class="[`${message.theme}`]">
                <div class="" :style="style(message)"></div>
              </div>
            </div>
          </div>
        </nac-ui-accordion>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dev {
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: white;
}

$control-fore-color: #222222 !default;

.nac-toast-base {
  pointer-events: none;
  position: absolute;
  position: fixed;
  inset: 0 0 0 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  display: flex;
  justify-content: center;

  .nac-toast-container {
    pointer-events: all;
    pointer-events: none;
    position: relative;
    height: auto;
    margin: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    max-height: 100%;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    transition: all 300ms;

    width: 800px;
    @media screen and (min-width: #{  0 }px) and (max-width: #{ 400 - 0.1}px) {
      width: 100%;
      padding: 5px 5px;
    }

    @media screen and (min-width: #{  400 }px) and (max-width: #{ 600 - 0.1}px) {
      width: 380px;
    }
    @media screen and (min-width: #{  600 }px) and (max-width: #{ 800 - 0.1}px) {
      width: 550px;
    }
    @media screen and (min-width: #{  800 }px) and (max-width: #{ 1200 - 0.1}px) {
      width: 600px;
    }
  }
}

.nac-toast {
  margin: 0 0 15px 0;
  width: 100%;
  pointer-events: all;
}

.nac-toast-body {
  display: flex;
  padding: 0px;
  flex-direction: row;

  @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
    flex-direction: column;
    padding: 0px 5px;
  }

  .nac-toast-icon {
    flex: 0 0 auto;
    font-size: 22px;
    width: 30px;
    padding: 0 8px 0 0;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
      width: 100%;
      height: 32px;
    }

    &::after {
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      font-size: 22px;

      @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
        font-size: 18px;
      }
    }

    &[data-icon='info']::after {
      content: '\f05a';
    }

    &[data-icon='success']::after {
      content: '\f00c';
    }

    &[data-icon='warning']::after {
      content: '\f12a';
    }

    &[data-icon='error']::after {
      content: '\f071';
    }
  }
  //-----------------------------------------------------------
  .nac-toast-text {
    flex: 1 1 auto;
    min-width: 0;
    @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
      width: 100%;
    }

    .nac-toast-title {
      font-size: 20px;
      white-space: pre;
      overflow-wrap: break-word;
      word-break: break-all;
      padding-right: 30px;
      @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
        padding-right: 0px;
      }
    }

    .nac-toast-message {
      font-size: 16px;
      white-space: pre-line;
      // white-space: pre;
      overflow-wrap: break-word;
      word-break: break-all;

      &.withIcon {
        padding-right: 30px;
        @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
          padding-right: 0px;
        }
      }
    }
  }
  //-----------------------------------------------------------

  .nac-toast-close {
    position: absolute;
    width: 30px;
    height: 30px;
    border: solid 1px white;
    border-radius: 4px;
    top: -6px;
    right: -6px;
    @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
      top: 0;
      right: -2px;
    }
    font-size: 16px;
    line-height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: rgba(251, 255, 244, 0.253);
    }
  }
}

.nac-toast-bar {
  display: flex;
  justify-content: flex-start;
  height: 8px;
  padding: 0 0 0 0;
  margin-bottom: -6px;
  margin-left: -6px;
  margin-right: -6px;
  @media screen and (min-width: #{  0 }px) and (max-width: #{ 600 - 0.1}px) {
    margin-bottom: -2px;
  }
  > div {
    margin: 2px 4px;
    border-radius: 2px;
    height: 4px;
    background-color: white;
    transition: width 10ms;
    animation-name: toast-bar-key-frame;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
}
</style>
<style lang="scss">
@keyframes toast-bar-key-frame {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}
</style>
