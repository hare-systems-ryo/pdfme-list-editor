<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/toggle-switch.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
import { Themes } from '../nac-main';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangToggleSwitch } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number;
// [ Props ]
type Props = {
  leftLabel?: MultiLang | undefined;
  rightLabel?: MultiLang | undefined;
  rightColor?: 'yes' | 'no' | Themes | undefined;
  leftColor?: 'yes' | 'no' | Themes | undefined;
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
  leftLabel: undefined,
  rightLabel: undefined,
  rightColor: 'yes',
  leftColor: 'no',
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  // require
  require: false,
  requireText: undefined,
  tabindex: undefined,
  classInput: '',
  // data
  data: 0,
  diff: undefined,
  disabled: false,
  // warn
  warn: '',
  warnTitle: undefined,
  toastTime: 2500,
});
//   [ emit ]------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
interface State {
  value: boolean;
}
const state = reactive<State>({
  value: false,
});
const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

const leftLabel = computed(() => {
  if (props.leftLabel === undefined) {
    return GetTextByMultiLang(NacStaticLangToggleSwitch.props.leftLabel, storeNac.lang);
  }
  return GetTextByMultiLang(props.leftLabel, storeNac.lang);
});

const rightLabel = computed(() => {
  if (props.rightLabel === undefined) {
    return GetTextByMultiLang(NacStaticLangToggleSwitch.props.rightLabel, storeNac.lang);
  }
  return GetTextByMultiLang(props.rightLabel, storeNac.lang);
});

// ----------------------------------------------------------------------------
const toggleBodyBg = computed(() => {
  const color = props.data === 1 ? props.rightColor : props.leftColor;
  if (color === undefined) return 'bg-dark';
  switch (color.toUpperCase().replace(/^#/g, '')) {
    case 'YES':
      return 'bg-success';
    case 'NO':
      return 'bg-warning';
    default:
      return `bg-${color}`;
  }
});
//   [ watch ]-----------------------------------------------------------------------
watch(
  () => props.data,
  () => {
    if (props.data == null) {
      state.value = false;
    } else {
      state.value = props.data === 1;
    }
  }
);
//   [ methods ]---------------------------------------------------------------------

const switchValue = async () => {
  const before = props.data;
  if (props.disabled === true) {
    return;
  }
  let updateValue = 0;
  if (props.data == null || props.data !== 1) {
    updateValue = 1;
  }
  emit('update:data', updateValue);
  await nextTick();
  emit('value-change', updateValue, before);
  elmFocus();
};

//   [ ref ]-------------------------------------------------------------------------

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

//   [ focus, blur ]-----------------------------------------------------------------

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
};
const onBlur = () => {
  focusState.isActivate = false;
};

//   [ baseClass ]----------------------------------------------------------------
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    activate: computedActivate.value,
    diff: props.diff !== undefined && props.diff !== props.data,
    'vcas-toggle-switch': true,
  };
});

//   [ iconEventShowWarn ]-----------------------------------------------------------
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
    <div
      class="nac-c-input-box"
      :class="{ disabled: props.disabled }"
      @click="switchValue()"
      @mousedown="onMousedown()"
      @mouseup="onMouseup()"
    >
      <input
        :ref="(e) => setRef(e)"
        :class="{ activate: computedActivate }"
        :checked="state.value"
        type="checkbox"
        :tabindex="tabindex"
        :disabled="props.disabled"
        @blur="onBlur()"
        @focus="onFocus()"
        @keydown.enter="switchValue"
      />
      <div class="toggle-label-container left">
        <label class="toggle-label">
          <div class="toggle-label-line left" :class="{ activate: !props.data }"></div>
          <div class="">{{ leftLabel }}</div>
        </label>
      </div>
      <div class="toggle-switch" :class="[{ activate: props.data }, toggleBodyBg]"></div>
      <div class="toggle-label-container right">
        <label class="toggle-label">
          <div class="toggle-label-line right" :class="{ activate: props.data }"></div>
          <div class="">{{ rightLabel }}</div>
        </label>
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
.nac-c-input-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // padding: 0 12px;
  cursor: pointer;

  .toggle-switch {
    flex: 0 0 auto;
    margin: 0 6px;
    width: 34px;
    height: 21px;
    border-radius: 10px;
    border: solid 1px #000;
    background-color: #ffeecf;
    padding: 1px;

    &::after {
      position: absolute;
      content: '';
      top: 2px;
      width: 15px;
      height: 15px;
      border-radius: 10px;
      border: solid 1px #3b3b3b;
      transition: left 200ms;
      will-change: left;
      background-color: #ffffff;
      left: 1px;
    }
    &.activate::after {
      left: 16px;
    }
  }
  .toggle-label-container {
    flex: 0 1 auto;
    width: calc(50% - 23px);
    display: flex;
    align-items: center;

    &.left {
      justify-content: flex-end;
    }
    &.right {
      align-items: flex-start;
    }
  }

  .toggle-label {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    pointer-events: none;
    line-height: 1em;
    border-radius: 2px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .toggle-label-line {
      position: absolute;
      z-index: 0;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 0px;
      background-image: linear-gradient(transparent 84%, #f68708 0%);
      transition: all 300ms;
      transform: scaleX(0%);
      &.left {
        transform-origin: right center;
      }
      &.right {
        transform-origin: left center;
      }

      &.activate {
        transform: scaleX(100%);
      }
      &.activate {
        transform: scaleX(100%);
      }
    }
  }
  &.disabled {
    cursor: default;

    .toggle-body {
      background-color: #f3f3f3 !important;

      &::after {
        background-color: #797979 !important;
      }
    }

    .toggle-label-line {
      background-image: linear-gradient(transparent 84%, #717f93 0%);
    }
  }
}

input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  z-index: -1;
}
</style>

<style lang="scss" scoped>
.FormControl {
  cursor: pointer;

  &.disabled {
    cursor: default;

    .toggle-body.on {
      background-color: #577aa8 !important;

      &::after {
        background-color: #dddfe4 !important;
      }
    }

    .toggle-body::after {
      background-color: #dddfe4 !important;
    }
  }

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    z-index: -1;
  }
}
</style>
