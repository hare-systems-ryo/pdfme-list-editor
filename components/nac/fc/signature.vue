<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/signature.ts
// ----------------------------------------------------------------------------

[使用方法]
 <NacFcSignature
    v-model:control="state.NacFcSignature.no1.control"
    placeholder="プレースホルダー"
    :disabled="false"
  />
---------------------------------------------------------------------------- */

// [ node_modules ]
import dayjs from 'dayjs';
// [ vueuse ]
import { useElementSize } from '@vueuse/core';
import { useElementHover } from '@vueuse/core';
// [ lib ]
import { GetTextByMultiLang, MultiLang, Sleep } from '../nac-main';
import { GenerateUniqeKey } from '../nac-main';
import { ModalControl, InitModalControl, InitModals } from '../nac-main';

// [ type ]
import { Signature } from '../type/type-signature';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangSignature, NacStaticLangCom } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
// const multiText = computed(() => NacStaticLangSignature);
const lang = computed(() => storeNac.lang);
const storeNac = _useStoreNac();
const storeState = storeNac.signature.state;
// [ nac-ui ]
const Toast = storeNac.useToast();
// [ Props ]
interface Props {
  control: Signature.SignatureControl;
  isShowSetting?: boolean;
  // [ InputControl ]
  placeholder?: MultiLang;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  isShowSetting: false,
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  disabled: false,
});

// [ emit ]
type Emits = {
  (e: 'update:control', control: Signature.SignatureControl): void;
};
const emit = defineEmits<Emits>();

const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
const controlId = 'NacFcSignature-' + uid;
// ----------------------------------------------------------------------------

// [ reactive ]
interface State {
  size: {
    w: number;
    h: number;
  };
  penPos: {
    x: number;
    y: number;
  };

  draw: {
    isDrag: boolean;
  };
}

const state = reactive<State>({
  size: {
    w: props.control.state.size.w,
    h: props.control.state.size.h,
  },
  penPos: {
    x: 0,
    y: 0,
  },
  draw: {
    isDrag: false,
  },
});

const placeholder = computed(() => {
  return GetTextByMultiLang(props.placeholder, lang.value);
});

// ----------------------------------------------------------------------------
// [ キャンバス用 ]
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

onUnmounted(() => {
  ctx.value = null;
  canvas.value = null;
});

// ----------------------------------------------------------------------------
// [ Controler ]

const canvasReset = () => {
  if (ctx.value === null) return;
  ctx.value.clearRect(0, 0, size.value.w, size.value.h);
};

const getImage = () => {
  try {
    if (canvas.value === null) return null;
    const ret = canvas.value.toDataURL('image/png');
    return ret;
  } catch (error) {
    // console.log('getImage', error);
    return null;
  }
};

const setImage = (dataUrl: string | null) => {
  return new Promise<boolean>((resolve) => {
    try {
      if (dataUrl === null || dataUrl.length === 0) {
        Toast.Error('サインフォームに表示するデータが指定されていません。', 'サインフォーム');
        return;
      }
      const eMode = activeItem.value.control.state.draw.type === Signature.DrawType.Eraser;
      if (eMode) {
        // 何故か消しゴム状態だと真っ白な画像になる
        activeItem.value.control.state.draw.type = Signature.DrawType.Pen;
        Sleep(1);
        nextTick();
      }
      canvasReset();
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        if (ctx.value === null) return;
        ctx.value.drawImage(img, 0, 0);
        if (eMode) {
          activeItem.value.control.state.draw.type = Signature.DrawType.Eraser;
        }
        resolve(true);
      };
      img.onerror = () => {
        Toast.Error('サインフォームに表示するデータの展開に失敗しました。', 'サインフォーム');
        resolve(false);
      };
    } catch (error) {
      console.error('setImage', error);
      resolve(false);
    }
  });
};

const initControl = () => {
  return {
    controlId: controlId,
    control: {
      state: {
        size: {
          w: 1400,
          h: 250,
        },
        draw: Signature.InitDrawValue(),
      },
      Reset: canvasReset,
      GetImage: getImage,
      SetImage: setImage,
    },
  };
};

const activeItem = computed(() => {
  const ret = storeState.controlList.filter((row) => row.controlId === controlId);
  if (ret.length === 0) return initControl();
  return ret[0];
});

watch(
  () => activeItem.value.control,
  () => {
    // console.log('update:control');
    emit('update:control', activeItem.value.control);
  },
  { deep: true }
);

watch(activeItem, () => {
  if (canvas.value === null) return;
  if (ctx.value !== null) ctx.value = null;
  ctx.value = canvas.value.getContext('2d');
  if (ctx.value === null) return;
  ctx.value.lineCap = 'round';
  ctx.value.lineJoin = 'round';
});

onMounted(() => {
  if (uid === '') return console.error('コントロールが存在しません');
  storeState.controlList.push({
    controlId: controlId,
    control: {
      state: {
        size: {
          w: props.control.state.size.w,
          h: props.control.state.size.h,
        },
        draw: props.control.state.draw,
      },
      Reset: canvasReset,
      GetImage: getImage,
      SetImage: setImage,
    },
  });
});

const size = computed(() => {
  return activeItem.value.control.state.size;
});

const draw = computed(() => {
  return activeItem.value.control.state.draw;
});

watch(
  () => size.value,
  (value) => {
    resizeCanvas();
  },
  { deep: true }
);

const imageLoad = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = src;
  });
};

const resizeCanvasFlag = ref('');
const resizeCanvasRun = ref(false);
const resizeCanvas = async () => {
  if (canvas.value === null) return;
  if (ctx.value === null) return;
  if (resizeCanvasRun.value === true) return;
  const ukey = dayjs().format('x') + '' + GenerateUniqeKey();
  try {
    resizeCanvasFlag.value = ukey;
    resizeCanvasRun.value = true;
    const ret = canvas.value.toDataURL();
    await Sleep(300);
    state.size = size.value;
    await nextTick();
    if (canvas.value === null) return;
    if (ctx.value === null) return;
    const img = await imageLoad(ret);
    ctx.value.drawImage(img, 0, 0);
  } catch (error) {
    console.error(error);
  } finally {
    resizeCanvasRun.value = false;
    if (resizeCanvasFlag.value !== ukey) {
      resizeCanvas();
    }
  }
};

watch(
  () => draw.value.type,
  () => {
    if (ctx.value === null) return;
    if (ctx.value.globalCompositeOperation !== draw.value.type) {
      ctx.value.globalCompositeOperation = draw.value.type;
    }
  }
);

watch(
  () => draw.value.color,
  () => {
    if (ctx.value === null) return;
    ctx.value.strokeStyle = draw.value.color;
  }
);

watch(
  () => [draw.value.lineWidth, draw.value.type],
  () => {
    if (ctx.value === null) return;
    if (draw.value.type === Signature.DrawType.Pen) {
      ctx.value.lineWidth = draw.value.lineWidth.pen;
    } else {
      ctx.value.lineWidth = draw.value.lineWidth.eraser;
    }
  },
  { deep: true }
);
// ----------------------------------------------------------------------------
// [ CanvasのZoom自動サイズ調整 ]
/**
 * サイズ計測用要素
 */
const elmSigContainer = ref<HTMLElement | null>(null);

const { width } = useElementSize(elmSigContainer);
/**
 * Canvasのズームレート
 */
const zoomScale = computed(() => {
  if (activeItem.value === null) return 1;
  if (width.value === 0) return 1;
  return width.value / size.value.w;
});

/**
 * ズーム調整のCanvas内包要素のスタイル
 */
const signatureZoomStyle = computed(() => {
  return { transform: `scale(${zoomScale.value.toFixed(3)})` };
});

/**
 * ズーム調整後のCanvas内包要素のスタイル
 */
const signatureContainerStyle = computed(() => {
  return {
    height: `${Math.ceil(size.value.h * zoomScale.value)}px`,
    'border-width': props.disabled ? '0px' : '2px',
  };
});

// ----------------------------------------------------------------------------
// [ 描画系 ]

/**
 * 描画開始
 */
const dragStart = (e: any) => {
  // console.log(`dragStart`, props.disabled);
  // console.log(`dragStart`, zoomScale.value);
  // console.log(`dragStart ctx`, ctx.value);
  if (props.disabled === true) return;
  e.preventDefault();
  // console.log(e);
  state.penPos.x = e.layerX / zoomScale.value;
  state.penPos.y = e.layerY / zoomScale.value;
  if (ctx.value === null) return;
  ctx.value.beginPath();
  ctx.value.lineTo(state.penPos.x, state.penPos.y);
  ctx.value.stroke();
  state.draw.isDrag = true;
};

/**
 * 描画
 */
const drawCanvas = (e: any) => {
  if (props.disabled === true) return;
  e.preventDefault();
  if (e.buttons === 1 || e.witch === 1 || e.type === 'touchmove') {
    state.penPos.x = e.layerX / zoomScale.value;
    state.penPos.y = e.layerY / zoomScale.value;
    if (!state.draw.isDrag) {
      return;
    }
    if (ctx.value === null) return;
    ctx.value.lineTo(state.penPos.x, state.penPos.y);
    ctx.value.stroke();
  } else {
    state.penPos.x = e.layerX / zoomScale.value;
    state.penPos.y = e.layerY / zoomScale.value;
  }
};

/**
 * 描画終了（mouseup, mouseout）
 */
const dragEnd = (e: any) => {
  if (props.disabled === true) return;
  e.preventDefault();
  if (ctx.value === null) return;
  ctx.value.closePath();
  state.draw.isDrag = false;
};

// ----------------------------------------------------------------------------
// [ ポインターのスタイル ]

/**
 * CanvasにマウスがHoverしているかどうか
 */
const isHovered = useElementHover(elmSigContainer);

/**
 * ポインターを描画する要素のスタイル
 */
const penPointerStyle = computed(() => {
  if (props.disabled === true) return { display: 'none' };
  if (isHovered.value === false) return { display: 'none' };
  const width =
    draw.value.type === Signature.DrawType.Eraser ? draw.value.lineWidth.eraser : draw.value.lineWidth.pen + 1;
  const color = draw.value.type === Signature.DrawType.Eraser ? 'red' : '#0016c0';
  return {
    top: (state.penPos.y - width / 2).toFixed(3) + 'px',
    left: (state.penPos.x - width / 2).toFixed(3) + 'px',
    width: width + 'px',
    height: width + 'px',
    'border-color': color,
    'background-color': 'rgba(255, 0, 0, 0.11)',
  };
});

// ----------------------------------------------------------------------------

// [ Modal ]
interface Modal {
  setting: ModalControl;
}
const modal = reactive<Modal>({
  setting: InitModalControl(),
});
onMounted(() => {
  InitModals(modal, nextTick);
});
// ----------------------------------------------------------------------------
</script>
<template>
  <div class="nac-signature">
    <div class="size-change" :class="{ isShow: resizeCanvasRun }">サイズ変更中...</div>
    <div class="nac-signature-header">
      <div class="placeholder">{{ placeholder }}</div>
      <div class="tools">
        <div class="pen-type-toggle" :class="{ disabled: props.disabled }">
          <div
            class="pen"
            :class="{ activate: activeItem.control.state.draw.type === Signature.DrawType.Pen }"
            @click="activeItem.control.state.draw.type = Signature.DrawType.Pen"
          >
            <i class="fas fa-pencil-alt"></i>
          </div>
          <div
            class="eraser"
            :class="{ activate: activeItem.control.state.draw.type === Signature.DrawType.Eraser }"
            @click="activeItem.control.state.draw.type = Signature.DrawType.Eraser"
          >
            <i class="fas fa-eraser"></i>
          </div>
        </div>
        <v-btn
          v-if="props.isShowSetting === true"
          variant="flat"
          size=""
          color="accent1"
          class="btn-config"
          rounded="0"
          @click="modal.setting.show()"
        >
          <i class="fa-solid fa-gear"></i>
        </v-btn>
      </div>
    </div>
    <div class="nac-signature-body">
      <div
        ref="elmSigContainer"
        class="signature-container"
        :class="{ disabled: props.disabled }"
        :style="signatureContainerStyle"
      >
        <div class="signature-zoom" :style="signatureZoomStyle">
          <canvas
            ref="canvas"
            :height="state.size.h"
            :width="state.size.w"
            class="draw"
            @mousedown="dragStart"
            @mouseup="dragEnd"
            @mouseout="dragEnd"
            @mousemove="drawCanvas"
            @touchstart="dragStart"
            @touchend="dragEnd"
            @touchmove="drawCanvas"
          >
          </canvas>
          <div class="pointer" :style="penPointerStyle"></div>
        </div>
        <div v-if="props.disabled" class="signature-disabled"></div>
      </div>
    </div>
  </div>
  <v-overlay v-model="modal.setting.isShow" :close-on-back="false" :persistent="true">
    <!-- <div class="overlay-modal p-0 p-800-3">
      <div
        ref="focusTrapElm"
        class="modal-container hover"
        :class="{ isShow: modal.setting.isShow }"
        :style="{ 'z-index': 99999 }"
        @click="modal.setting.close()"
      >
        <div class="modal">
          <div class="card setting-card" @click.stop>
            <div class="card-header bg-main1">
              設定
              <v-btn variant="outlined" color="white" class="" @click="modal.setting.close()">
                <i class="fa-solid fa-xmark"></i>
              </v-btn>
            </div>
            <div class="card-body">
              <nac-fc-form-control
                class="mb-1"
                placeholder="文字色"
                :diff="false"
                :require="false"
                :require-text="`必須`"
                :disabled="false"
                class-input=" d-flex justify-content-center"
              >
                <input v-model="activeItem.control.state.draw.color" type="color" class="cursor-pointer" />
              </nac-fc-form-control>
              <nac-fc-range
                v-model:data="activeItem.control.state.draw.lineWidth.pen"
                placeholder="ペンサイズ"
                class="mb-1"
                :min="1"
                :max="30"
                :step="1"
                :is-show-btn-control="true"
              />
              <nac-fc-range
                v-model:data="activeItem.control.state.draw.lineWidth.eraser"
                placeholder="消しゴムサイズ"
                class=""
                :min="1"
                :step="1"
                :max="30"
                :is-show-btn-control="true"
              />
              <v-btn variant="flat" color="error" block class="mt-3" @click="canvasReset()">
                <i class="fa-solid fa-trash-can"></i>削除
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </v-overlay>
</template>

<style lang="scss" scoped>
@import './_fc-variables.scss';
$control-line-color: #112288 !default;
$control-back-color: #ffffff !default;
$control-fore-color: #222222 !default;
//  vcas-form-controlで記述

.dev-display {
  position: fixed;
  inset: auto auto 0 0;
  z-index: 999999;
  pointer-events: none;
}
.dev {
  background-color: black;
  color: white;
  padding: 4px;
  white-space: pre-line;
}
.setting-card {
  min-width: 260px;
  width: 60%;
  max-width: 500px;
  z-index: 1;
}
.size-change {
  position: absolute;
  inset: 0 0 0 0;
  background-color: rgba(8, 8, 71, 0.225);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  color: rgb(255, 255, 255);
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 300ms;
  pointer-events: none;
  &.isShow {
    opacity: 1;
    pointer-events: all;
  }
}
.nac-signature {
  overflow: hidden;
  width: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: map-get($nac-control-color, 'default-line');
  background-color: map-get($nac-control-color, 'default-back');
  max-width: 100%;

  .nac-signature-header {
    padding: 2px 3px 0px 3px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .placeholder {
      padding: 1px 0px 0px 0px;
      font-size: 0.8rem;
      line-height: 1em;
      color: map-get($nac-control-header, 'placeholder-fore');
    }
  }

  .nac-signature-body {
    padding: 4px;
  }

  .signature-container {
    overflow: hidden;
    background-color: rgb(255, 255, 255);
    border-style: dotted;
    border-color: #4f4f4f;

    .signature-zoom {
      transform-origin: left top;

      .pointer {
        z-index: 2;
        position: absolute;
        pointer-events: none;
        border-style: solid;
        border-width: 1px;
        border-radius: 50%;
      }
    }
  }

  .tools {
    margin-left: auto;
    display: flex;
    justify-content: center;
    align-items: center;

    > :not(:last-child) {
      margin-right: 4px;
    }

    .pen-color {
      height: 22px;

      input[type='color'] {
        height: 22px !important;
        appearance: none !important;
        padding: 0px 0px !important;
        background-color: rgb(255, 255, 255);
      }
    }

    .pen-type-toggle {
      display: flex;
      width: 100px;
      height: 22px;
      border-width: 1px;
      font-size: 0.9rem;

      border-style: solid;
      border-color: rgb(16, 163, 28);

      .pen,
      .eraser {
        text-align: center;
        flex: 0 0 50%;
        background-color: white;
        transition: all 300ms;
        cursor: pointer;
        background-color: #f5fff6;
      }

      .pen.activate,
      .eraser.activate {
        background-color: #039810;
        color: #ffffff;
      }

      &.disabled {
        border-color: rgb(81, 81, 81);

        .pen,
        .eraser {
          background-color: #c1c1c1;
          color: #767676;
        }

        .pen.activate,
        .eraser.activate {
          background-color: #677b69;
          color: #ffffff;
        }
      }
    }
  }

  .signature-disabled {
    position: absolute;
    inset: 0 0 0 0;
    background-color: rgba(25, 41, 101, 0.127);
    opacity: 1;

    &::before,
    &:after {
      position: absolute;
      inset: 0 auto auto 0;
      width: 2rem;
      height: 2rem;
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.5;
    }

    &::after {
      content: '\f303';
      position: absolute;
      color: #ba0000;
      font-size: 1rem;
    }

    &:before {
      content: '\f05e';
      color: #ed8c8c;
      font-size: 1.8rem;
    }
  }
}
.btn-config {
  height: 22px;
  padding: 0 20px;
}
</style>
