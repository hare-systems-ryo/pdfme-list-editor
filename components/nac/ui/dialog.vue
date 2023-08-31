<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/dialog.vue
---------------------------------------------------------------------------- */

// [ vueuse ]
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
// [ nac-Stroe ]
import { _useStoreNac } from '../nac-store';

import { GetTextByMultiLang } from '../nac-main';

import { Dialog } from '../type/type-dialog';
// ----------------------------------------------------------------------------
// [ nac-Stroe ]
const storeNac = _useStoreNac();
// ----------------------------------------------------------------------------
const lang = computed(() => storeNac.lang);
// ----------------------------------------------------------------------------
const storeState = storeNac.dialog.state;
// ----------------------------------------------------------------------------
const cancelBtnElm = ref<HTMLElement | null>(null);
const leftBtnElm = ref<HTMLElement | null>(null);
const rightBtnElm = ref<HTMLElement | null>(null);
// ----------------------------------------------------------------------------
// [ useFocusTrap ]
const focusTrapElm = ref<HTMLElement | null>(null);
const { hasFocus, activate, deactivate } = useFocusTrap(focusTrapElm, { allowOutsideClick: true });
// ----------------------------------------------------------------------------

const activeItem = computed(() => {
  if (storeState.pendingList.length !== 0) {
    return storeState.pendingList[0];
  } else {
    return null;
  }
});

const activateTs = computed(() => {
  if (activeItem.value !== null) {
    return activeItem.value.ts;
  } else {
    return null;
  }
});

const isShow = computed(() => {
  return activeItem.value !== null;
});

const clickLeft = () => {
  if (activeItem.value === null) return;
  const item = activeItem.value;
  if (item.data.option.btnLeft.isShow === false) return;
  item.data.leftBtnClick();
};
const clickRight = () => {
  if (activeItem.value === null) return;
  const item = activeItem.value;
  if (item.data.option.btnRight.isShow === false) return;
  item.data.rightBtnClick();
};

const clickCancel = () => {
  if (activeItem.value === null) return;
  const item = activeItem.value;
  if (item.data.option.btnCancel.isShow === false) return;
  item.data.cancelBtnClick();
};

watch(activateTs, async (ts) => {
  await nextTick();
  if (ts === null || !isShow.value) {
    deactivate();
    return;
  }
  activate();

  if (activeItem.value === null) return;
  if (activeItem.value.data.option.timeout !== 0) {
    const _ts = ts;
    activeItem.value.data.counter = activeItem.value.data.option.timeout;
    const countDown = () => {
      setTimeout(() => {
        if (activeItem.value === null) return;
        if (activateTs.value === null) return;
        if (activateTs.value !== _ts) return;
        activeItem.value.data.counter--;
        if (activeItem.value.data.counter <= 0) {
          activeItem.value.data.timeout = true;
          activeItem.value.data.cancelBtnClick();
        } else {
          countDown();
        }
      }, 1000);
    };
    countDown();
  }
  // console.log('');
  if (isShow.value === true && focusTrapElm.value !== null) {
    if (activeItem.value.data.option.defaultBtn === 'right' && rightBtnElm.value !== null) {
      rightBtnElm.value.focus();
    } else if (activeItem.value.data.option.defaultBtn === 'left' && leftBtnElm.value !== null) {
      leftBtnElm.value.focus();
    } else if (activeItem.value.data.option.defaultBtn === 'cancel' && cancelBtnElm.value !== null) {
      cancelBtnElm.value.focus();
    } else {
      focusTrapElm.value.focus();
    }
  }
});

let keyMoveFlag = false;
const onKeyDownNoBtn = (e: KeyboardEvent) => {
  if (activeItem.value === null) return '';
  // console.log('onKeyDownNoBtn', e);
  if (activeItem.value.data.option.btnRight.isShow === true && rightBtnElm.value !== null) {
    keyMoveFlag = true;
    rightBtnElm.value.focus();
  }
};

const onKeyDownYesBtn = (e: KeyboardEvent) => {
  if (activeItem.value === null) return '';
  // console.log('onKeyDownYesBtn', e);
  if (activeItem.value.data.option.btnLeft.isShow === true && leftBtnElm.value !== null) {
    keyMoveFlag = true;
    leftBtnElm.value.focus();
  }
};

const zindex = computed(() => {
  if (activeItem.value === null) return Dialog.DefaultValue.zindex;
  return activeItem.value.data.option.zindex;
});
// ----------------------------------------------------------------------------
</script>
<template>
  <v-overlay v-model="isShow" :close-on-back="false" :z-index="zindex" :persistent="true" @click.stop="clickCancel()">
    <div ref="focusTrapElm" class="overlay-modal">
      <div v-if="activeItem !== null" class="modal card" @click.stop>
        <div class="modal-header card-header" :class="[`bg-${activeItem.data.option.themeHeaderBg}`]">
          <div class="dialog-title">{{ GetTextByMultiLang(activeItem.data.title, lang) }}</div>
          <v-btn
            v-if="activeItem.data.option.btnCancel.isShow"
            class="dialog-btn-cancel px-2 py-2"
            variant="outlined"
            size=""
            :color="`${activeItem.data.option.btnCancel.theme}`"
            @click="clickCancel()"
            @ref="(e:any) => (cancelBtnElm = e)"
          >
            <i class="fas fa-times mx-1"></i> {{ GetTextByMultiLang(activeItem.data.option.btnCancel.title, lang) }}
          </v-btn>
        </div>
        <div class="modal-body bg-back" :class="`card-body`">
          <div class="dialog-message">{{ GetTextByMultiLang(activeItem.data.message, lang) }}</div>
          <div v-if="activeItem.data.counter >= 0" class="dialog-counter my-3">
            {{
              GetTextByMultiLang(
                {
                  ja: `あと${activeItem.data.counter}秒で自動でキャンセルされます`,
                  en: `${activeItem.data.counter} more seconds and it will be automatically cancelled.`,
                },
                lang
              )
            }}
          </div>
          <div class="dialog-btn-row">
            <v-btn
              v-if="activeItem.data.option.btnLeft.isShow"
              class="dialog-btn-left"
              variant="flat"
              :color="`${activeItem.data.option.btnLeft.theme}`"
              @click="clickLeft()"
              @ref="(e:any) => (leftBtnElm = e)"
              @keydown="onKeyDownNoBtn"
            >
              {{ GetTextByMultiLang(activeItem.data.option.btnLeft.title, lang) }}
            </v-btn>
            <v-btn
              v-if="activeItem.data.option.btnRight.isShow"
              class="dialog-btn-right"
              variant="flat"
              :color="`${activeItem.data.option.btnRight.theme}`"
              @click="clickRight()"
              @ref="(e:any) => (rightBtnElm = e)"
              @keydown="onKeyDownYesBtn"
            >
              {{ GetTextByMultiLang(activeItem.data.option.btnRight.title, lang) }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- </div> -->
    </div>
  </v-overlay>
</template>
<style lang="scss" scoped>
.modal {
  max-height: 100%;
  max-width: 100%;
  min-width: 300px;

  @media screen and (min-width: #{ 0 }px) and (max-width: #{ 600 - 0.1}px) {
    width: calc(100% - 20px);
  }

  > .modal-body {
    overflow: auto;
  }
}
.modal-header {
  .dialog-title {
    // max-width: calc(100% - 120px);
    flex: 1 1 auto;
    font-size: 18px;
    padding: 2px 4px;
    line-height: 1.2em;
    min-width: 0;
    white-space: pre-line;
    overflow-wrap: break-word;
    word-break: break-all;

    @media screen and (min-width: #{ 0 }px) and (max-width: #{ 500 - 0.1}px) {
      font-size: 14px;
    }
  }

  .dialog-btn-cancel {
    flex: 0 0 auto;
    @media screen and (min-width: #{ 0 }px) and (max-width: #{ 800 - 0.1}px) {
      max-width: 120px;
    }

    @media screen and (min-width: #{ 800 }px) {
      max-width: 40%;
    }
    overflow-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    white-space: pre-line;
  }
}

.dialog-message {
  padding: 0px 0px 0px 0px;
  font-size: 16px;
  white-space: pre-line;
  line-height: 18px;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-all;
}

.dialog-btn-row {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;

  .dialog-btn-right {
    flex: 0 0 auto;
    min-width: 100px;
    margin-left: 3px;
  }
  .dialog-btn-left {
    flex: 0 0 auto;
    min-width: 100px;
    margin-right: 3px;
  }
}

// Modal用クラス
.modal-container {
  z-index: 9999;
  position: fixed;
  inset: 0;
  background-color: rgba(23, 29, 78, 0.47);
  display: flex;
  justify-content: center;
  align-items: center;

  &.hover {
    cursor: pointer;

    > * {
      cursor: default;
    }

    // background-color: rgba(23, 29, 78, 0.241);
  }

  &:not(.down):not(.up):not(.left):not(.right) {
    opacity: 0;
    transition: opacity 300ms;
    pointer-events: none;

    &.isShow {
      pointer-events: all;
      opacity: 1;
    }
  }

  &.up {
    transform: translateY(100%);
    //
  }

  &.down {
    transform: translateY(-100%);
    // left     : 0;
  }

  &.left {
    transform: translateX(100%);
  }

  &.right {
    transform: translateX(-100%);
  }

  &.up,
  &.down,
  &.left,
  &.right {
    top: 0;
    left: 0;
    transition: transform 200ms;
    will-change: transform;

    &.isShow {
      transform: translateY(0%) translateX(0%);
    }
  }

  &.up.isShow,
  &.right.isShow,
  &.down.isShow,
  &.left.isShow {
    transform: translateY(0%);
  }

  > .modal {
    max-height: 100%;
    max-width: 100%;
  }

  > .modal.card > .card-body {
    overflow: auto;
  }
}
</style>
