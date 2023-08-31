<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/range-multi.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
import { InsertComma, Sleep } from '../lib/nac-func';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number[];
// [ Props ]
type Props = {
  min?: number;
  max?: number;
  step?: number;
  /**
   * 表示する単位
   */
  unit?: MultiLang;
  // [ InputControl ]
  placeholder?: MultiLang;
  tabindex?: string | undefined;
  classInput?: string | undefined;
  // require
  require?: boolean;
  requireText?: MultiLang | undefined;
  // data
  data: ValueType;
  diff?: ValueType | undefined;
  disabled?: boolean;
  // warn
  warn?: string;
  warnTitle?: MultiLang | undefined;
  toastTime?: number;
};
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  unit: '',
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  tabindex: undefined,
  classInput: '',
  // require
  require: false,
  requireText: undefined,
  // data
  diff: undefined,
  disabled: false,
  // warn
  warn: '',
  warnTitle: undefined,
  toastTime: 2500,
});

// [ emit ]
type InputFocusEventArg = {
  elm: HTMLElement;
  placeholder: MultiLang;
  data: number[];
};
type Emits = {
  ref: [element: HTMLElement];
  focus: [arg: InputFocusEventArg];
  blur: [arg: InputFocusEventArg];
  'update:data': [value: ValueType];
  'value-change': [after: ValueType, before: ValueType];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
interface State {
  valueMin: number;
  valueMax: number;
  valueVirtual: number;
}
const state = reactive<State>({
  valueMin: 0,
  valueMax: 0,
  valueVirtual: 0,
});
const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

const isChangeData = computed(() => {
  // 更新の有無確認
  if (props.diff === undefined) return false;
  if (props.diff[0] !== props.data[0]) return true;
  if (props.diff[1] !== props.data[1]) return true;
  return false;
});

const sliderMinLeft = computed(() => {
  const total = props.max - props.min;
  let left = total === 0 ? 0 : ((state.valueMin - props.min) / total) * 100;
  if (left < 0) left = 0;
  if (left > 100) left = 100;
  // 更新の有無確認
  return {
    left: `${left.toFixed(2)}%`,
  };
});

const sliderMaxLeft = computed(() => {
  const total = props.max - props.min;
  let left = total === 0 ? 0 : ((state.valueMax - props.min) / total) * 100;
  if (left < 0) left = 0;
  if (left > 100) left = 100;
  // 更新の有無確認
  return {
    left: `${left.toFixed(2)}%`,
  };
});

const sliderBar = computed(() => {
  const total = props.max - props.min;
  let left = total === 0 ? 0 : ((state.valueMin - props.min) / total) * 100;
  if (left < 0) left = 0;
  if (left > 100) left = 100;
  let right = total === 0 ? 0 : ((state.valueMax - props.min) / total) * 100;
  if (right < 0) right = 0;
  if (left > 100) left = 100;
  // 更新の有無確認
  return {
    // left: `calc(${left.toFixed(2)}% + 8px)`,
    left: `${left.toFixed(6)}%`,
    right: `calc(100% - ${right.toFixed(6)}%)`,
  };
});
// ----------------------------------------------------------------------------

watch(
  () => props.data,
  () => {
    setValue(props.data);
  }
);

const setValue = (arg: number[]) => {
  // console.log({ arg });
  if (arg === null || arg.length !== 2 || arg[1] < arg[0]) {
    // 文字列型はnullを許容しないルールとします
    // ※親コンポーネントへ「空文字」として返却
    updateValue([0, 0]);
  } else {
    state.valueMin = arg[0];
    state.valueMax = arg[1];
  }
};

const onInputMin = () => {
  if (state.valueMax < state.valueMin) {
    state.valueMin = state.valueMax;
    if (props.data[0] !== state.valueMin) {
      updateValue([state.valueMin, state.valueMax]);
    }
  } else {
    updateValue([state.valueMin, state.valueMax]);
  }
};

const onInputMax = () => {
  if (state.valueMax < state.valueMin) {
    state.valueMax = state.valueMin;
    if (props.data[1] !== state.valueMax) {
      updateValue([state.valueMin, state.valueMax]);
    }
  } else {
    updateValue([state.valueMin, state.valueMax]);
  }
};

const onInputVirtual = () => {
  if (state.valueVirtual < state.valueMin) {
    updateValue([state.valueVirtual, state.valueMax]);
  }
  if (state.valueMax < state.valueVirtual) {
    updateValue([state.valueMin, state.valueVirtual]);
  }
  if (state.valueVirtual - state.valueMin < state.valueMax - state.valueVirtual) {
    updateValue([state.valueVirtual, state.valueMax]);
  } else {
    updateValue([state.valueMin, state.valueVirtual]);
  }
};

//  更新を親コンポーネントに伝える
const updateValue = async (arg: number[]) => {
  const before = props.data;
  emit('update:data', arg);
  await nextTick();
  emit('value-change', arg, before);
};

const minValueDisplay = computed(() => {
  // 更新の有無確認
  return InsertComma(props.data[0]) + GetTextByMultiLang(props.unit, storeNac.lang);
});

const maxValueDisplay = computed(() => {
  // 更新の有無確認
  return InsertComma(props.data[1]) + GetTextByMultiLang(props.unit, storeNac.lang);
});

// [ ref ]
const inputElementVirtual = ref();
const inputElementMin = ref();
const inputElementMax = ref();
const setRef = (elm: any) => {
  inputElementMin.value = elm;
  emit('ref', elm as HTMLInputElement);
};

// [ focus, blur ]

interface FocusState {
  isActivate: boolean;
  isActivateVirtual: boolean;
  isActivateMin: boolean;
  isActivateMax: boolean;
  isMmousedownVirtual: boolean;
  isMmousedownMin: boolean;
  isMmousedownMax: boolean;
}

const focusState = reactive<FocusState>({
  isActivate: false,
  isActivateVirtual: false,
  isActivateMin: false,
  isActivateMax: false,
  isMmousedownVirtual: false,
  isMmousedownMin: false,
  isMmousedownMax: false,
});

/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  if (props.disabled === true) return false;
  if (storeNac.state.uid !== uid) return false;
  // console.log(JSON.stringify(focusState));
  if (focusState.isActivate) return true;
  if (focusState.isActivateVirtual) return true;
  if (focusState.isActivateMin) return true;
  if (focusState.isActivateMax) return true;
  if (focusState.isMmousedownVirtual) return true;
  if (focusState.isMmousedownMin) return true;
  if (focusState.isMmousedownMax) return true;
  return false;
});

/**
 * focus, blur イベント
 */
watch(computedActivate, (value, before) => {
  if (value === before) return;
  if (value === true) {
    // クリックでの遷移の場合に
    // 一つ前のコントロールのblurイベントよりも早くfocusが発生しないようにする対策で10ミリ秒処理をずらす
    setTimeout(() => {
      emit('focus', {
        elm: inputElementMin.value,
        placeholder: props.placeholder,
        data: props.data,
      });
    }, 10);
  } else {
    emit('blur', {
      elm: inputElementMin.value,
      placeholder: props.placeholder,
      data: props.data,
    });
  }
});

//   [ focus, blur ]-----------------------------------------------------------------
const onFocusVirtual = () => {
  focusState.isActivate = true;
  focusState.isActivateVirtual = true;
  storeNac.state.uid = uid;
};
const onBlurVirtual = () => {
  setTimeout(() => {
    focusState.isActivate = false;
    focusState.isActivateVirtual = false;
  }, 5);
};

const onFocusMin = () => {
  focusState.isActivate = true;
  focusState.isActivateMin = true;
  storeNac.state.uid = uid;
};
const onBlurMin = () => {
  setTimeout(() => {
    focusState.isActivate = false;
    focusState.isActivateMin = false;
  }, 5);
};
const onFocusMax = () => {
  focusState.isActivate = true;
  focusState.isActivateMax = true;
  storeNac.state.uid = uid;
};
const onBlurMax = () => {
  setTimeout(() => {
    focusState.isActivate = false;
    focusState.isActivateMax = false;
  }, 5);
};

const onMousedownVirtual = () => {
  focusState.isMmousedownVirtual = true;
};
const onMouseupVirtual = () => {
  focusState.isMmousedownVirtual = false;
  if (state.valueVirtual === state.valueMin) {
    // console.log('min!');
    inputElementMin.value?.focus();
  } else if (state.valueVirtual === state.valueMax) {
    // console.log('max!');
    inputElementMax.value?.focus();
  }
};

const onMousedownMin = () => {
  focusState.isMmousedownMin = true;
};
const onMouseupMin = () => {
  focusState.isMmousedownMin = false;
};

const onMousedownMax = () => {
  focusState.isMmousedownMax = true;
};
const onMouseupMax = () => {
  focusState.isMmousedownMax = false;
};

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: isChangeData.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
  };
});

// [ iconEventShowWarn ]

const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};

const tabindex = computed(() => {
  if (props.disabled === true) return -1;
  return props.tabindex;
});

//   [ VueComponent Lifecycle ]------------------------------------------------------
setValue(props.data);
//  ---------------------------------------------------------------------------------
//  --template-----------------------------------------------------------------------
//  ---------------------------------------------------------------------------------
</script>
<template>
  <nac-fc-form-control
    :placeholder="props.placeholder"
    :class="baseClass"
    :class-input="props.classInput"
    :require="props.require"
    :require-text="requireText"
    :disabled="props.disabled"
  >
    <div class="range-body">
      <div class="slider-line">
        <div class="slider-slider-limit" :style="sliderBar"></div>
      </div>
      <div class="slider-body min">
        <div class="slider min" :style="sliderMinLeft" :class="[{ activate: focusState.isActivateMin }]"></div>
      </div>
      <div class="slider-body min">
        <div
          class="slider-balloon min"
          :style="sliderMinLeft"
          :class="[
            {
              activate: focusState.isActivateMin || focusState.isActivateMax || focusState.isActivateVirtual,
            },
          ]"
        >
          <div class="slider-value min">{{ minValueDisplay }}</div>
        </div>
      </div>
      <div class="slider-body max">
        <div class="slider max" :style="sliderMaxLeft" :class="[{ activate: focusState.isActivateMax }]"></div>
      </div>
      <div class="slider-body max">
        <div
          class="slider-balloon max"
          :style="sliderMaxLeft"
          :class="[
            {
              activate: focusState.isActivateMin || focusState.isActivateMax || focusState.isActivateVirtual,
            },
          ]"
        >
          <div class="slider-value max">{{ maxValueDisplay }}</div>
        </div>
      </div>
      <input
        ref="inputElementVirtual"
        v-model.number="state.valueVirtual"
        type="range"
        class="input-range virtual"
        :disabled="props.disabled"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        tabindex="-1"
        @input="onInputVirtual()"
        @focus="onFocusVirtual()"
        @blur="onBlurVirtual()"
        @mousedown="onMousedownVirtual()"
        @mouseup="onMouseupVirtual()"
        @touchstart="onMousedownVirtual()"
        @touchend="onMouseupVirtual()"
      />
      <input
        :ref="(elm) => setRef(elm)"
        v-model.number="state.valueMin"
        type="range"
        class="input-range min"
        :disabled="props.disabled"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        @focus="onFocusMin()"
        @blur="onBlurMin()"
        @input="onInputMin()"
        @mousedown="onMousedownMin()"
        @mouseup="onMouseupMin()"
        @touchstart="onMousedownMin()"
        @touchend="onMouseupMin()"
      />
      <input
        ref="inputElementMax"
        v-model.number="state.valueMax"
        type="range"
        class="input-range max"
        :disabled="props.disabled"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        @focus="onFocusMax()"
        @blur="onBlurMax()"
        @mousedown="onMousedownMax()"
        @mouseup="onMouseupMax()"
        @touchstart="onMousedownMax()"
        @touchend="onMouseupMax()"
        @input="onInputMax()"
      />
    </div>
    <template #after-icon>
      <div
        v-if="props.warn != ''"
        data-sep="left"
        data-icon="warn"
        :title="props.warn"
        @click="iconEventShowWarn()"
      ></div>
    </template>
  </nac-fc-form-control>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@import './_fc-variables.scss';
$slider-height: 18;
$slider-width: math.div($slider-height, 10) * 7 + 2;

.range-body {
  position: absolute;
  top: auto;
  bottom: auto;
  height: #{$slider-height}px;
  left: #{$slider-width}px;
  right: #{$slider-width}px;
}

.slider-line {
  position: absolute;
  top: #{math.div($slider-height, 10) * 4}px;
  bottom: #{math.div($slider-height, 10) * 4}px;
  left: #{math.div($slider-width, 2)}px;
  right: #{math.div($slider-width, 2)}px;
  background-color: #ffe6c7;
  border-radius: #{math.div($slider-height, 2)}px;
}

.slider-slider-limit {
  position: absolute;
  background-color: #ff8c00;
  top: 0;
  bottom: 0;
  transition: all 50ms;
}

.slider-body {
  position: absolute;
  top: 0;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
  &.min {
    left: 0px;
    right: #{$slider-width}px;
  }

  &.max {
    right: 0px;
    left: #{$slider-width}px;
  }
}

.slider {
  z-index: 0;
  position: absolute;
  top: 0;
  //leftは動的に指定する
  width: #{$slider-width}px;
  height: #{$slider-height}px;
  background-color: #f68708;
  border: solid 1px #ffffff;
  transition: all 50ms;
  will-change: filter, left;

  &.activate {
    filter: drop-shadow(0 0 2px #2369d2);
  }
  &.min {
    border-radius: 50% 0 0 50%;
    transform: translateX(-#{math.div($slider-width, 2) + 0}px);
  }
  &.max {
    border-radius: 0 50% 50% 0;
    transform: translateX(-#{math.div($slider-width, 2) + 0}px);
  }
}

.slider-balloon {
  opacity: 0;
  z-index: 1;
  position: absolute;
  height: auto;
  width: 0px;
  transition: all 50ms, opacity 300ms;
  filter: drop-shadow(0 0 2px #2369d2);
  transform: translate3d(0, 0, 0);
  display: flex;
  will-change: filter, left;
  &.activate,
  &.showBalloon {
    opacity: 1;
  }
  &.min {
    justify-content: flex-start;
    transform: translateX(-#{math.div($slider-width, 2) - 2}px);
  }
  &.max {
    justify-content: flex-end;
    transform: translateX(#{math.div($slider-width, 2) - 2}px);
  }
}

.slider-value {
  z-index: 4;
  height: auto;
  font-size: 0.8rem;
  padding: 2px 4px;
  background-color: #fff5ec;
  border-radius: 2px;
  border: solid 1px #2369d2;
  white-space: nowrap;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  &::before {
    content: '';
    // z-index: 9999;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }
  &.min {
    transform: translateY(-#{$slider-height + 12}px);
    &::before {
      bottom: -6px;
      left: 0;
      border-width: 6px 4px 0 4px;
      border-color: #2369d2 transparent transparent transparent;
    }
  }
  &.max {
    transform: translateY(#{$slider-height + 5}px);

    &::before {
      top: -6px;
      right: 0;
      border-width: 0 4px 6px 4px;
      border-color: transparent transparent #2369d2 transparent;
    }
  }
}

//  -----------------

[type='range'] {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: #{$slider-height}px;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  pointer-events: none;

  &.virtual {
    pointer-events: all;
    z-index: 0;
  }
  &:focus,
  &:active {
    outline: none;
  }

  &::-webkit-slider-thumb {
    opacity: 0;
    position: relative;
    width: #{$slider-width}px;
    height: #{$slider-height}px;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    display: block;
    pointer-events: auto;
  }

  &.virtual::-webkit-slider-thumb {
    opacity: 0;
    pointer-events: none;
  }
  &.min::-webkit-slider-thumb {
    border-radius: 50% 0 0 50%;
    transform: translateX(-#{math.div($slider-width, 2) - 0}px);
  }
  &.max::-webkit-slider-thumb {
    border-radius: 0 50% 50% 0;
    transform: translateX(#{math.div($slider-width, 2) - 0}px);
  }
  ::-ms-tooltip {
    opacity: 0;
  }

  ::-moz-range-track {
    opacity: 0;
  }
  ::-moz-range-thumb {
    opacity: 0;
  }
}

.disabled {
  .slider {
    background-color: #a5a5a5;
    border: solid 2px #7a7a7a;
  }
  .slider-slider-limit {
    background-color: #a1a1a1;
  }
  .slider-line {
    background-color: #c7c7c7;
  }
  [type='range']::-webkit-slider-thumb {
    pointer-events: none;
    cursor: default;
  }
}
</style>
