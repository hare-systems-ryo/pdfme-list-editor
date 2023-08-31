<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/textbox.ts
// ----------------------------------------------------------------------------

[使用方法]
 <NacFcTextbox
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

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = string | null;
// [ Props ]
type Props = {
  textAlign?: 'left' | 'center' | 'right';
  type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
  autocomplete?: string;
  maxLen?: number;
  datalist?: string[];
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
  textAlign: 'left',
  type: 'text',
  autocomplete: 'off',
  maxLen: 0,
  datalist: () => [],
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
  // ----------------------------
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

const isChangeData = computed(() => {
  // 更新の有無確認
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

const setValue = (text: string | null) => {
  // console.log({ text });
  if (text === null) {
    state.value = '';
    return;
  }
  if (props.maxLen === 0 || text.length <= props.maxLen) {
    state.value = text;
  } else {
    // 文字数のオーバーフロー確定
    // 親コンポーネントへの更新処理に移動
    updateValue(text);
  }
};
setValue(props.data);

// 更新を親コンポーネントに伝える
const updateValue = async (text: string | null) => {
  const before = props.data;
  let setText = '';
  if (text === null) {
    setText = '';
  } else if (props.maxLen === 0 || text.length <= props.maxLen) {
    setText = text;
  } else {
    const CutLen = (text: string, len: number, addWard = '') => {
      if (text === null) return '';
      if (len === 0) return text;
      return text.substring(0, len) + addWard;
    };
    setText = CutLen(text, props.maxLen, '');
  }
  state.value = setText;
  emit('update:data', setText);
  await nextTick();
  emit('value-change', setText, before);
};

const setFocus = () => {
  if (props.disabled === false && inputElement) {
    inputElement.value.select();
  }
};
// [ ref ]
const inputElement = ref();
const setRef = (elm: any) => {
  inputElement.value = elm;
  emit('ref', elm);
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
  if (props.disabled === true) return;
  focusState.isMmousedown = true;
};
const onMouseup = () => {
  if (props.disabled === true) return;
  elmFocus();
  focusState.isMmousedown = false;
};
const onFocus = () => {
  if (props.disabled === true) return;
  focusState.isActivate = true;
  storeNac.state.uid = uid;
  // console.log('onFocus', { uid }, storeNac.state.uid);
};
const onBlur = () => {
  // console.log('onBlur', { uid }, storeNac.state.uid);
  focusState.isActivate = false;
};

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: isChangeData.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    '-textbox': true,
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
// ----------------------------------------------------------------------------
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
        v-if="props.maxLen > 0"
        data-type="max-word-message"
        :data-last="props.maxLen - state.value.length"
        :data-maxLen="props.maxLen"
      >
        {{ state.value.length }} / {{ props.maxLen }}
      </div>
    </template>
    <div class="nac-c-input-box" @click="setFocus()" @mousedown="onMousedown()" @mouseup="onMouseup()">
      <input
        :ref="(e) => setRef(e)"
        v-model="state.value"
        :list="`textbox-list-${uid}`"
        :type="props.type"
        :autocomplete="props.autocomplete"
        :style="`text-align:${props.textAlign};`"
        :disabled="props.disabled"
        :tabindex="tabindex"
        @blur="onBlur()"
        @focus="onFocus()"
        @input="updateValue(state.value)"
        @keydown="(e: KeyboardEvent) => emit('keydown', e)"
        @keyup="(e: KeyboardEvent) => emit('keyup', e)"
        @click.stop=""
      />
    </div>
    <datalist v-if="props.datalist.length != 0" :id="`textbox-list-${uid}`">
      <template v-for="(row, index) in props.datalist" :key="index">
        <option :value="row" />
      </template>
    </datalist>
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
  padding: 0 4px;
}
input {
  width: 100%;
  height: auto;
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0px;
  outline: none;
  line-height: 1em;
  height: 20px;
}
input::-webkit-calendar-picker-indicator {
  opacity: 0;
}
</style>
