<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/valuebox.ts
---------------------------------------------------------------------------- */

// [ node_modules ]
import BigNumber from 'bignumber.js';
// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
import { IsMobile, InsertComma } from '../lib/nac-func';
import { FloatNullable, Float } from '../lib/nac-func';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangToggleValuebox } from '../nac-static-lang';
// ----------------------------------------------------------------------------
type ValueType = number | null;
// [ nac-stroe ]
const storeNac = _useStoreNac();
const multiText = computed(() => NacStaticLangToggleValuebox);
const lang = computed(() => storeNac.lang);
// [ nac-ui ]
const Toast = storeNac.useToast();
// [ Props ]
type Props = {
  nullable?: boolean;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  digits?: number;
  isShowBtnControl?: boolean;
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
  nullable: true,
  unit: '',
  step: 1,
  min: -999999999999999,
  max: 999999999999999,
  digits: 0,
  isShowBtnControl: false,
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  // require
  require: false,
  requireText: undefined,
  tabindex: undefined,
  classInput: '',
  // data
  data: null,
  diff: undefined,
  disabled: false,
  // warn
  warn: '',
  warnTitle: undefined,
  toastTime: 2500,
});
//   [ emit ]
type InputFocusEventArg = {
  elm: HTMLElement;
  placeholder: MultiLang;
  data: number | null;
};
type Emits = {
  ref: [element: HTMLElement];
  focus: [arg: InputFocusEventArg];
  blur: [arg: InputFocusEventArg];
  // ----------------------------
  'update:data': [value: ValueType];
  'value-change': [after: ValueType, before: ValueType];
  // ----------------------------
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
//   [ reactive ]
interface State {
  value: string;
  inputMode: string;
}
const state = reactive<State>({
  value: '',
  inputMode: 'text',
});
onMounted(() => {
  state.inputMode = IsMobile() === true ? 'number' : 'text';
});
const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});
// ----------------------------------------------------------------------------
/**
 * 表示（カンマ表示）
 */
const displayText = computed(() => {
  if (props.data === null) return '';
  return InsertComma(props.data, props.digits);
});

watch(
  () => props.data,
  () => {
    setValueByPropsData();
  }
);

/**
 * prop.data からのデータ入力
 */
const setValueByPropsData = () => {
  const val = FloatNullable(props.data, props.digits);
  if (props.data !== val) {
    // 小数点許容確認とデータ修正
    updateData(val, false);
    return;
  }
  const validCheckResult = validCheck(val);
  if (validCheckResult.result === true) {
    if (validCheckResult.value === null) {
      state.value = '';
    } else {
      state.value = validCheckResult.value.toFixed(props.digits);
    }
  } else {
    updateData(validCheckResult.value, false);
    Toast.Warning(
      validCheckResult.message,
      GetTextByMultiLang(multiText.value.validErrorTitle, lang.value),
      props.toastTime
    );
  }
};

/**
 * 値が適正かチェックする
 */
const validCheck = (val: number | null): { result: boolean; message: string; value: number | null } => {
  if (val === null) {
    if (props.nullable === false) {
      return {
        result: false,
        value: 0,
        message: GetTextByMultiLang(multiText.value.validErrorNullValue, lang.value),
      };
    } else {
      return { result: true, value: null, message: '' };
    }
  }
  if (val < props.min) {
    return {
      result: false,
      value: props.min,
      message: GetTextByMultiLang(multiText.value.validErrorMinValue, lang.value).replace(/{value}/, String(props.min)),
      // `[${props.min}]以下の数値は入力できません`,
    };
  } else if (props.max < val) {
    return {
      result: false,
      value: props.max,
      message: GetTextByMultiLang(multiText.value.validErrorMaxValue, lang.value).replace(/{value}/, String(props.max)),
      // message: `[${props.max}]以上の数値は入力できません`,
    };
  }
  return { result: true, value: val, message: '' };
};

/**
 * 更新を親コンポーネントに伝える
 * @param val
 */
const updateData = async (val: number | null, f = true) => {
  // console.log('updateData', val);
  const before = props.data;
  let updateValue: number | null = null;
  if (val !== null) {
    updateValue = val;
  } else if (props.nullable === false) {
    updateValue = 0;
  } else {
    updateValue = null;
  }
  emit('update:data', updateValue);
  await nextTick();
  if (f) emit('value-change', updateValue, before);
};

//   [ インプット要素からのデータ変更 ]

/**
 * 入力値の変更を起点としてチェック
 */
const checkValueByInput = () => {
  const inputText = hankakuToZenkaku(state.value)
    .replace(/ー/g, '-')
    .replace(/[^(0-9)|(.)|\-|+)]+/g, '');
  const inputValue = FloatNullable(inputText, props.digits);
  const validCheckResult = validCheck(inputValue);
  if (validCheckResult.value === null) {
    state.value = '';
  } else {
    state.value = validCheckResult.value.toFixed(props.digits);
  }
  if (props.data !== validCheckResult.value) {
    updateData(validCheckResult.value);
  }
  if (validCheckResult.result === false) {
    Toast.Warning(
      validCheckResult.message,
      GetTextByMultiLang(multiText.value.validErrorTitle, lang.value),
      props.toastTime
    );
  }
};

/**
 * 全角数値を半角数値へ変換する
 */
const hankakuToZenkaku = (str: string) => {
  return (str + '').replace(/[０-９]/g, (s) => {
    /* eslint-disable */
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    /* eslint-enable */
  });
};

/**
 * 要素のイベント keydown
 */
const keydown = (e: KeyboardEvent) => {
  emit('keydown', e);
  if (!props.isShowBtnControl) {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        return;
      default:
        break;
    }
  }
  switch (e.key) {
    case 'ArrowUp':
      stepValue(true);
      break;
    case 'ArrowDown':
      stepValue(false);
      break;
    default:
      break;
  }
};

/**
 * 要素のイベント keydown
 */
const onWheel = (e: WheelEvent) => {
  if (!props.isShowBtnControl) return;
  if (e.deltaY < 0) {
    stepValue(true);
  } else if (e.deltaY > 0) {
    stepValue(false);
  }
  e.preventDefault();
};

/**
 * 要素のイベント stepValue
 */
const stepValue = (isUp: boolean) => {
  let nextValue = 0;
  const inputValue = FloatNullable(props.data, props.digits);
  const step = isUp === true ? props.step : props.step * -1;
  if (inputValue === null) {
    nextValue = step;
    if (isUp === true) {
      if (nextValue < props.min || props.max < nextValue) {
        nextValue = props.max;
      }
    } else if (nextValue < props.min || props.max < nextValue) {
      nextValue = props.min;
    }
  } else if (props.digits > 0 || step < 1) {
    if (isUp === true) {
      nextValue = BigNumber(inputValue).plus(BigNumber(props.step)).toNumber();
    } else {
      nextValue = BigNumber(inputValue).minus(BigNumber(props.step)).toNumber();
    }
  } else {
    nextValue = inputValue + step;
  }
  const validCheckResult = validCheck(nextValue);
  // console.log({ validCheckResult });
  if (validCheckResult.result === true) {
    updateData(validCheckResult.value);
    // } else {
    // emit('warn', validCheckResult.message, '入力値の警告', props.toastTime);
  }
};

const isArrowUp = computed(() => {
  if (props.data === null) return true;
  if (props.data + props.step <= props.max) return true;
  return false;
});
const isArrowDown = computed(() => {
  if (props.data === null) return true;
  if (props.min <= props.data - props.step) return true;
  return false;
});

// [ ref ]
const inputElement = ref();
const setRef = (elm: any) => {
  inputElement.value = elm;
  emit('ref', elm as HTMLInputElement);
};

/**
 * 強制focus
 */
const elmFocus = () => {
  inputElement.value.focus();
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
  if (storeNac.state.uid !== uid) return false;
  // console.log(uid, JSON.stringify(focusState));
  // console.log(uid, storeNac.state.uid);
  if (props.disabled === true) return false;
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
        elm: inputElement.value,
        placeholder: props.placeholder,
        data: props.data,
      });
    }, 10);
  } else {
    emit('blur', {
      elm: inputElement.value,
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
  storeNac.state.uid = uid;
  focusState.isActivate = true;
  inputElement.value.select();
};
const onBlur = () => {
  focusState.isActivate = false;
  focusState.isMmousedown = false;
  checkValueByInput();
};

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: props.diff !== undefined && props.diff !== props.data,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    'nac-valuebox': true,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};

onMounted(() => {
  setValueByPropsData();
});
const tabindex = computed(() => {
  if (props.disabled === true) return -1;
  return props.tabindex;
});
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
    <div class="nac-c-input-box" @wheel="onWheel" @mousedown="onMousedown()" @mouseup="onMouseup()">
      <div class="input-container">
        <input
          v-if="props.isShowBtnControl === true"
          :ref="(e) => setRef(e)"
          v-model="state.value"
          :type="state.inputMode"
          class="input"
          :class="[{ isShow: computedActivate }]"
          maxlength="20"
          :disabled="props.disabled"
          :tabindex="tabindex"
          @keydown="keydown"
          @keyup="(e) => emit('keyup', e)"
          @blur="onBlur()"
          @focus="onFocus()"
        />
        <input
          v-else
          :ref="(e) => setRef(e)"
          v-model="state.value"
          :type="state.inputMode"
          class="input"
          :class="[{ isShow: computedActivate }]"
          maxlength="20"
          :disabled="props.disabled"
          :tabindex="tabindex"
          @keydown="keydown"
          @keyup="(e) => emit('keyup', e)"
          @blur="onBlur()"
          @focus="onFocus()"
          @wheel.prevent=""
        />
        <input
          type="text"
          class="input displayText"
          :class="[{ isShow: !computedActivate }]"
          :value="displayText"
          :disabled="props.disabled"
          :tabindex="-1"
          readonly
        />
      </div>
      <div v-if="props.unit.length !== 0" class="unit">{{ props.unit }}</div>
    </div>
    <template #after-icon>
      <div v-if="props.isShowBtnControl === true" class="FormControlUpDownIcon">
        <div :class="[{ activate: isArrowUp }]" @click="stepValue(true)">
          <i class="fas fa-caret-up"></i>
        </div>
        <div :class="[{ activate: isArrowDown }]" @click="stepValue(false)">
          <i class="fas fa-caret-down"></i>
        </div>
      </div>
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
@import './_fc-variables.scss';
.nac-c-input-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
  .input-container {
    flex: 1 1 auto;
    min-width: 0;
  }

  .unit {
    flex: 0 0 auto;
  }
}

input {
  width: 100%;
  height: 100%;
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0px;
  outline: none;
  text-align: right;
  opacity: 0;
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
  &.isShow {
    pointer-events: all;
    opacity: 1;
  }

  &.displayText {
    position: absolute;
    inset: 0 0 0 0;
    margin-top: auto;
    margin-bottom: auto;
    pointer-events: none;
  }
}

.unit {
  color: #696969;
  align-items: flex-end;
  align-self: flex-end;
  margin: 0px 0px 2px 4px;
  font-size: 0.8em;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
//   .form-control-inner {
//     align-items: center;
//     user-select: none;
//   }

.FormControl .FormControlBody .FormControlInput {
  display: flex;
  justify-content: center;
  align-items: center;

  .input {
    text-align: right;
    flex: 1 1 auto;
  }
}

.valuebox-unit {
  flex: 0 0 auto;
  color: #696969;
  align-items: flex-end;
  margin: 6px 6px 0 6px;
  font-size: 0.8em;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.FormControlUpDownIcon {
  width: 2em;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  overflow: hidden;

  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    cursor: pointer;
    background-color: transparent;
    color: #cccccc;
    border-left: solid 1px gray;
    pointer-events: none;

    &.activate {
      cursor: pointer;
      background-color: transparent;
      color: #f68708;
      transition: all 300ms;
      pointer-events: all;

      &:hover {
        background-color: #f687084c;
      }
    }
  }

  > div:first-child {
    border-bottom: solid 1px gray;
  }
}
</style>
