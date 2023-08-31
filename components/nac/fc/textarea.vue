<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/textarea.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangTextarea } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
type ValueType = string | null;
// [ Props ]
type Props = {
  rows?: number;
  maxRows?: number;
  maxRowsUnit?: MultiLang | undefined;
  maxLen?: number;
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
  rows: 1,
  maxRows: 0,
  maxRowsUnit: undefined,
  maxLen: 0,
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  tabindex: undefined,
  classInput: '',
  // require
  require: false,
  requireText: undefined,
  // data
  data: null,
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
  data: string | null;
};
type Emits = {
  ref: [element: HTMLElement];
  focus: [arg: InputFocusEventArg];
  blur: [arg: InputFocusEventArg];
  // ----------------------------
  'update:data': [value: ValueType];
  'value-change': [after: ValueType, before: ValueType];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
interface State {
  value: string;
}
const state = reactive<State>({
  value: '',
});
const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});
const maxRowsUnit = computed(() => {
  if (props.maxRowsUnit === undefined) {
    return GetTextByMultiLang(NacStaticLangTextarea.props.maxRowsUnit, storeNac.lang);
  }
  return GetTextByMultiLang(props.maxRowsUnit, storeNac.lang);
});

//  更新の有無確認
const computedIsChange = computed(() => {
  if (props.diff === undefined) return false;
  if (props.diff === null && props.data === '') return false;
  if (props.diff === '' && props.data === null) return false;
  if (props.diff !== props.data) return true;
  return false;
});

// ----------------------------------------------------------------------------
watch(
  () => props.data,
  () => {
    setValue(props.data);
  }
);

const CutLen = (text: string, len: number, addWard = '') => {
  if (text === null) return '';
  if (len === 0) return text;
  return text.substring(0, len) + addWard;
};
const getCheckedText = (text: string) => {
  // 各行を配列の要素に分ける
  let ret = text;
  if (props.maxRows !== 0) {
    const lines = text.split('\n');
    let amari = '';
    // 入力行数が制限を超えた場合
    if (lines.length > props.maxRows) {
      const result = [];
      for (let i = 0; i < lines.length; i++) {
        if (i < props.maxRows) {
          result.push(lines[i]);
        } else {
          amari += lines[i].replace(/\n/g, '');
        }
      }
      ret = result.join('\n') + amari;
    }
  }
  if (props.maxLen !== 0 || ret.length > props.maxLen) {
    ret = CutLen(ret, props.maxLen, '');
  }
  return ret;
};

const setValue = (text: string | null) => {
  if (text === null) {
    state.value = '';
    return;
  }
  const lineCheckedText = getCheckedText(text);
  if (lineCheckedText === text) {
    state.value = text;
  } else {
    // 文字数のオーバーフロー確定
    // 親コンポーネントへの更新処理に移動
    updateValue(text);
  }
};
setValue(props.data);

//  更新を親コンポーネントに伝える
const updateValue = async (text: string | null) => {
  const before = props.data;
  let setText = '';
  if (text === null) {
    setText = '';
  } else {
    // 各行を配列の要素に分ける
    setText = getCheckedText(text);
  }
  state.value = setText;
  emit('update:data', setText);
  await nextTick();
  emit('value-change', setText, before);
};

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
    diff: computedIsChange.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    'nac-textarea': true,
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
    <template #header>
      <div
        data-type="max-word-message"
        :data-last="props.maxRows - state.value.split('\n').length"
        :data-maxLen="props.maxRows"
      >
        {{ state.value.split('\n').length }} / {{ props.maxRows }}
        {{ maxRowsUnit }}
      </div>
      <div data-type="max-word-message" :data-last="props.maxLen - state.value.length" :data-maxLen="props.maxLen">
        {{ state.value.length }} / {{ props.maxLen }}
      </div>
    </template>

    <div class="nac-c-input-box">
      <textarea
        :ref="(e) => setRef(e)"
        v-model="state.value"
        type="text"
        :rows="props.rows"
        :disabled="props.disabled"
        :tabindex="tabindex"
        @blur="onBlur()"
        @focus="onFocus()"
        @mousedown="onMousedown"
        @mouseup="onMouseup"
        @input="updateValue(state.value)"
        @keydown="(e: KeyboardEvent) => emit('keydown', e)"
        @keyup="(e: KeyboardEvent) => emit('keyup', e)"
      ></textarea>
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
@import './_fc-variables.scss';
.nac-c-input-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;

  ::-webkit-scrollbar {
    width: 6px;
    padding-top: 3px;
    padding-bottom: 4px;
    cursor: pointer;
  }

  /*スクロールバーの軌道*/
  ::-webkit-scrollbar-track {
    border-radius: 3px;
    margin-top: 3px;
    margin-bottom: 8px;
    background-color: rgba(57, 97, 126, 0.219);
  }

  /*スクロールバーの動く部分*/
  ::-webkit-scrollbar-thumb {
    background-color: rgba(4, 40, 65, 0.5);
    border-radius: 3px;
  }

  ::-webkit-resizer {
    background-color: transparent;
    opacity: 0;
    height: 2px !important;
  }

  &::after {
    position: absolute;
    z-index: 0;
    bottom: 0px;
    right: 0px;
    width: 10px;
    height: 16px;
    content: '\f338';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    pointer-events: none;
    text-align: right;
    font-size: 10px;
    padding-right: 2px;
    color: #e26f2c;

    @media screen and (min-width: #{ 0 }px) and (max-width: #{ 600 - 0.1}px) {
      opacity: 0;
    }
  }
}

textarea {
  resize: vertical; // 1
  width: 100%;
  height: 100%;
  margin-top: 1px;
  line-height: 1.2em !important;
  min-height: 2em;

  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0px;
  outline: none;

  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
  overflow-y: scroll;
  &[disabled]::-webkit-resizer {
    background: #f3f3f3;
  }
}
</style>
