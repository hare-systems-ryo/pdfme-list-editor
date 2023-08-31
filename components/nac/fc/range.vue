<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/range.ts
// ----------------------------------------------------------------------------

[使用方法]
 <NacFcRange
    class=""
    class-input=""
    text-align="left"
    type="text"
    autocomplete="false"
    :max-len="10"
    :datalist="['a', 'b']"
    placeholder="プレースホルダー"
    :data="'diff'"
    :diff="''"
    :warn="'warn'"
    :warn-title="'warn-title'"
    :disabled="false"
    :toast-time="1200"
    :require="false"
    :require-text="`必須`"
  />
---------------------------------------------------------------------------- */
// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
import { InsertComma } from '../lib/nac-func';

// [ nac-stroe ]
import { NacStaticLangVfc } from '../nac-static-lang';
import { _useStoreNac } from '../nac-store';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number;
// [ Props ]
type Props = {
  min?: number;
  max?: number;
  minLimit?: number | undefined;
  maxLimit?: number | undefined;
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
  minLimit: undefined,
  maxLimit: undefined,
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
  data: number;
};
type Emits = {
  ref: [element: HTMLElement];
  focus: [arg: InputFocusEventArg];
  blur: [arg: InputFocusEventArg];
  // ----------------------------
  'update:data': [value: ValueType];
  'value-change': [after: ValueType, before: ValueType];
};
const emit = defineEmits<Emits>();

// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
interface State {
  value: number;
  isShowBalloon: boolean;
}
const state = reactive<State>({
  value: 0,
  isShowBalloon: false,
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
  if (props.diff !== props.data) return true;
  return false;
});

const sliderStyle = computed(() => {
  const total = props.max - props.min;
  let left = total === 0 ? 0 : ((state.value - props.min) / total) * 100;
  if (left < 0) left = 0;
  if (left > 100) left = 100;
  // 更新の有無確認
  return {
    left: `${left.toFixed(2)}%`,
  };
});

const sliderSliderLimit = computed(() => {
  const total = props.max - props.min;
  let left: number, right: number;
  if (props.minLimit === undefined) {
    left = 0;
  } else {
    left = total === 0 ? 0 : ((props.minLimit - props.min) / total) * 100;
    if (left < 0) left = 0;
    if (left > 100) left = 100;
  }
  if (props.maxLimit === undefined) {
    right = 100;
  } else {
    right = total === 0 ? 0 : ((props.maxLimit - props.min) / total) * 100;
    if (right < 0) right = 0;
    if (left > 100) left = 100;
  }
  return {
    left: `${left.toFixed(6)}%`,
    right: `calc(100% - ${right.toFixed(6)}%)`,
  };
});
const valueDisplay = computed(() => {
  // 更新の有無確認
  return InsertComma(props.data) + GetTextByMultiLang(props.unit, storeNac.lang);
});

// ----------------------------------------------------------------------------

//   [ watch ]-----------------------------------------------------------------------
watch(
  () => props.data,
  () => {
    setValue(props.data);
  }
);
watch(
  () => [props.maxLimit, props.minLimit],
  () => {
    checkPropsValue();
  }
);
//   [ methods ]---------------------------------------------------------------------

const setValue = (val: number) => {
  if (val === null) {
    // 文字列型はnullを許容しないルールとします
    // ※親コンポーネントへ「空文字」として返却
    updateValue(0);
  } else {
    state.value = val;
  }
};

const checkPropsValue = () => {
  if (props.max < props.min) {
    console.error('Rangeコントロール範囲指定に問題があります', `props.min:${props.min}  :: props.max:${props.max}`);
    return;
  }
  if (props.maxLimit !== undefined && props.minLimit !== undefined && props.maxLimit < props.minLimit) {
    console.error(
      'Rangeコントロール範囲指定に問題があります',
      `props.minLimit:${props.minLimit}  :: props.maxLimit:${props.maxLimit}`
    );
    return;
  }
  if (props.maxLimit !== undefined && props.maxLimit < props.data) {
    state.value = props.maxLimit;
    if (props.data !== state.value) {
      updateValue(state.value);
    }
  } else if (props.minLimit !== undefined && props.data < props.minLimit) {
    state.value = props.minLimit;
    if (props.data !== state.value) {
      updateValue(state.value);
    }
  }
};

const onInput = () => {
  if (props.maxLimit !== undefined && props.minLimit !== undefined && props.maxLimit < props.minLimit) {
    console.error(
      'Rangeコントロール範囲指定に問題があります',
      `props.minLimit:${props.minLimit}  :: props.maxLimit:${props.maxLimit}`
    );
    state.value = props.data;
    return;
  }
  // console.log({ value: state.value, maxLimit: props.maxLimit, minLimit: props.minLimit });
  if (props.maxLimit !== undefined && props.maxLimit < state.value) {
    state.value = props.maxLimit;
    if (props.data !== state.value) {
      updateValue(state.value);
    }
  } else if (props.minLimit !== undefined && state.value < props.minLimit) {
    state.value = props.minLimit;
    if (props.data !== state.value) {
      updateValue(state.value);
    }
  } else {
    updateValue(state.value);
  }
};

//  更新を親コンポーネントに伝える
const updateValue = async (value: number) => {
  const before = props.data;
  emit('update:data', value);
  await nextTick();
  emit('value-change', value, before);
};

// [ ref ]

const inputElement = ref<HTMLElement>();
const setRef = (elm: any) => {
  inputElement.value = elm;
  emit('ref', elm as HTMLInputElement);
};

/**
 * 強制focus
 */
const elmFocus = () => {
  inputElement.value?.focus();
};

// [ focus, blur ]

interface FocusState {
  isActivate: boolean;
  isMmousedown: boolean;
}
const focusState = reactive<FocusState>({
  isActivate: false,
  isMmousedown: false,
});
/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  // console.log(JSON.stringify(focusState));
  if (props.disabled === true) return false;
  if (storeNac.state.uid !== uid) return false;
  if (focusState.isActivate) return true;
  if (focusState.isMmousedown) return true;
  return false;
});

/**
 * focus, blur イベント
 */
watch(computedActivate, (value, before) => {
  if (value === true) {
    // クリックでの遷移の場合に
    // 一つ前のコントロールのblurイベントよりも早くfocusが発生しないようにする対策で10ミリ秒処理をずらす
    setTimeout(() => {
      emit('focus', {
        elm: inputElement.value as HTMLElement,
        placeholder: props.placeholder,
        data: props.data,
      });
    }, 10);
  } else {
    emit('blur', {
      elm: inputElement.value as HTMLElement,
      placeholder: props.placeholder,
      data: props.data,
    });
  }
});

const onMousedown = () => {
  focusState.isMmousedown = true;
};
const onMouseup = () => {
  elmFocus();
  focusState.isMmousedown = false;
};

const onFocus = () => {
  focusState.isActivate = true;
  storeNac.state.uid = uid;
};
const onBlur = () => {
  focusState.isActivate = false;
};

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: isChangeData.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    'nac-range': true,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};
// ----------------------------------------------------------------------------
const tabindex = computed(() => {
  if (props.disabled === true) return -1;
  return props.tabindex;
});

setValue(props.data);
checkPropsValue();
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
    <div class="nac-c-input-box">
      <div class="range-body">
        <div class="slider-body">
          <div
            class="slider-balloon"
            :style="sliderStyle"
            :class="[{ showBalloon: state.isShowBalloon, activate: focusState.isActivate }]"
          >
            <div class="slider-value">{{ valueDisplay }}</div>
          </div>
          <div class="slider" :style="sliderStyle" :class="[{ activate: focusState.isActivate }]"></div>
        </div>
        <div class="slider-line">
          <div class="slider-slider-limit" :style="sliderSliderLimit"></div>
        </div>
        <input
          :ref="(elm) => emit('ref', elm as HTMLInputElement)"
          v-model.number="state.value"
          type="range"
          class=""
          :disabled="props.disabled"
          :min="props.min"
          :max="props.max"
          :step="props.step"
          @blur="onBlur()"
          @focus="onFocus()"
          @mousedown="onMousedown()"
          @mouseup="onMouseup()"
          @touchstart="onMousedown()"
          @touchend="onMouseup()"
          @input="onInput()"
        />
      </div>
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

$slider-height: 18;
$slider-width: 18;
$slider-radius: 50%;
.nac-c-input-box {
  width: 100%;
  height: 100%;
}

.range-body {
  position: absolute;
  top: auto;
  bottom: auto;
  height: #{$slider-height}px;
  left: #{math.div($slider-width, 2)}px;
  right: #{math.div($slider-width, 2)}px;
}

.slider-body {
  z-index: 2;
  position: absolute;
  top: 0;
  bottom: 0px;
  pointer-events: none;
  //
  left: #{math.div($slider-width, 2)}px;
  right: #{math.div($slider-width, 2)}px;
}

.slider {
  position: absolute;
  top: 0;
  //leftは動的に指定する
  width: #{$slider-width}px;
  height: #{$slider-height}px;
  background-color: #f68708;
  border: solid 1px #ffffff;
  transition: left 50ms;
  //
  border-radius: 50%;
  transform: translateX(-#{math.div($slider-width, 2) + 0}px);
  will-change: filter, left;
  &.activate {
    filter: drop-shadow(0 0 2px #2369d2);
  }
}

.slider-balloon {
  opacity: 0;
  z-index: 2;
  position: absolute;
  height: auto;
  width: 0px;
  transition: all 50ms, opacity 300ms;
  filter: drop-shadow(0 0 2px #2369d2);
  will-change: filter, left;
  transform: translate3d(0, 0, 0);
  background-color: #f68708;
  display: flex;
  &.activate,
  &.showBalloon {
    opacity: 1;
  }
  //
  justify-content: center;

  &::before {
    content: '';
    z-index: 2;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    transform: translateY(-#{$slider-height + 12}px);
    //
    bottom: -6px;
    margin: auto;
    right: auto;
    left: auto;
    border-width: 6px 4px 0 4px;
    border-color: #2369d2 transparent transparent transparent;
  }
}

.slider-value {
  height: auto;
  font-size: 0.8rem;
  padding: 2px 4px;
  background-color: #fff5ec;
  border-radius: 2px;
  border: solid 1px #2369d2;
  white-space: nowrap;

  //
  transform: translateY(-#{$slider-height + 12}px);
}

.slider-line {
  z-index: 1;
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
  border-radius: #{math.div($slider-height, 2)}px;
}

//  -----------------
[type='range'] {
  z-index: 1;

  z-index: 9;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: #{$slider-height}px;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  &:focus,
  &:active {
    outline: none;
  }

  &::-webkit-slider-thumb {
    opacity: 0;
    z-index: 9;
    border: solid 1px red;
    position: relative;
    width: #{$slider-width}px;
    height: #{$slider-height}px;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    display: block;
    border-radius: 50%;
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
