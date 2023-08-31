<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/check-box.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc } from '../nac-static-lang';

import SelectImgIcon from './select--img-icon.vue';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number | null;
// [ Props ]
interface Props {
  // [ InputControl ]
  placeholder?: MultiLang;
  tabindex?: string | undefined;
  hasImage?: boolean;
  imageObjectFit?: 'contain' | 'cover';
  imageBorder?: string;
  imgUrl?: string | null;
  // data
  data: ValueType;
  diff?: ValueType | undefined;
  disabled?: boolean;
  // warn
  warn?: string;
  warnTitle?: MultiLang | undefined;
  toastTime?: number;
}
const props = withDefaults(defineProps<Props>(), {
  hasImage: false,
  imageObjectFit: 'contain',
  imageBorder: 'border-gray',
  imgUrl: null,
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  tabindex: undefined,
  // data
  data: 0,
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
  'update:data': [value: number];
  'value-change': [after: number, before: number];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
const placeholder = computed(() => {
  return GetTextByMultiLang(props.placeholder, storeNac.lang);
});

const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

// ----------------------------------------------------------------------------

const switchValue = () => {
  const before = props.data as number;
  if (props.disabled === true) {
    return;
  }
  if (props.data === 1) {
    emit('update:data', 0);
    nextTick(() => {
      emit('value-change', 0, before);
    });
  } else {
    emit('update:data', 1);
    nextTick(() => {
      emit('value-change', 1, before);
    });
  }
  if (inputElement.value !== null) {
    inputElement.value.focus();
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
        elm: inputElement.value,
        placeholder: props.placeholder,
        data: props.data as number,
      });
    }, 10);
  } else {
    emit('blur', {
      elm: inputElement.value,
      placeholder: props.placeholder,
      data: props.data as number,
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
};
const onBlur = () => {
  focusState.isActivate = false;
};
// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    activate: computedActivate.value,
    diff: props.diff !== undefined && props.diff !== props.data && !(props.diff === null && props.data === 0),
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
  <div class="nac-checkbox" :class="baseClass" @click="switchValue()">
    <input
      :ref="(e) => setRef(e)"
      :tabindex="tabindex"
      type="checkbox"
      class="checkbox"
      @blur="onBlur()"
      @focus="onFocus()"
    />
    <div class="nac-checkbox-box" :class="{ checked: props.data === 1 }">
      <div class="nac-checkbox-check">
        <i class="fas fa-check"></i>
      </div>
    </div>
    <div class="nac-checkbox-text d-flex align-items-center" @mousedown="onMousedown()" @mouseup="onMouseup()">
      <select-img-icon
        v-if="props.hasImage"
        :img-url="props.imgUrl"
        :image-border="props.imageBorder"
        :image-object-fit="props.imageObjectFit"
      />
      {{ placeholder }}
      <span v-if="props.warn.length !== 0" class="warn" @click.stop="iconEventShowWarn()">
        <i class="fas fa-exclamation-triangle"></i>{{ props.warn }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './_fc-variables.scss';
.nac-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;

  $box-shadow-diff: inset 0px 0px 3px 2px #fd9831be;
  $box-shadow-activate: inset 0px 0px 3px 2px #86cbf8;
  $box-shadow-warn: inset 0px 0px 3px 2px #f1000067;
  $box-shadow-disabled: inset 0px 0px 3px 2px #cfcecebb;

  &.disabled {
    cursor: default;
  }

  > .checkbox {
    z-index: -1;
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .nac-checkbox-box {
    position: relative;
    width: 16px;
    height: 16px;
    margin: 0 0.3em 0 0;
    background-color: rgb(255, 255, 255);
    border: solid 1px gray;

    .nac-checkbox-check {
      transform: scale(0%);
      transition: transform 100ms;
      will-change: transform;
      transform-origin: center center;
      position: absolute;
      inset: 0;
      > i {
        position: absolute;
        inset: 0;
      }
    }
    &.checked {
      color: rgb(0, 177, 9);
      .nac-checkbox-check {
        color: rgb(0, 177, 9);
        transform: scale(100%);
      }
    }
  }
  .nac-checkbox-text {
    font: inherit;
    line-height: 1em;
    .warn {
      color: rgb(190, 0, 0);
    }
  }

  &.disabled:not(.activate) {
    .nac-checkbox-box {
      box-shadow: $box-shadow-disabled;
    }

    .nac-checkbox-text {
      opacity: 0.8;
    }
  }
  &.warn:not(.diff) {
    .nac-checkbox-box {
      box-shadow: $box-shadow-warn;
    }
  }

  &.diff:not(.activate):not(.disabled) {
    .nac-checkbox-box {
      box-shadow: $box-shadow-diff;
    }
  }

  &.activate:not(.disabled) {
    .nac-checkbox-box {
      box-shadow: $box-shadow-activate;
    }
    .nac-checkbox-text {
      text-decoration: underline;
    }
  }

  .nac-checkbox-text.warn i {
    color: var(--FormControlCheck--FormControlCheck-Text-warn-color);
    margin: 0 3px;
  }

  //---------------------------------------
  .FormControlCheck-Text {
    line-height: 1em;
  }
}
</style>
