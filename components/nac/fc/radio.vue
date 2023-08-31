<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/radio.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangSelect } from '../nac-static-lang';
import { IntNullable } from '../nac-main';
import type { SelectItem, SelectItemOrigin } from '../nac-main';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
const multiText = NacStaticLangSelect;
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number | null;
// [ Props ]
type Props = {
  classCol?: string | string[] | any;
  classRow?: string | string[] | any;
  /**
   * 非表示要素の表示非表示切り替えフラグ
   * コンポーネントからのデータ書き換えがあるので「v-model」を使用してください
   */
  isHiddenShow?: boolean;
  /**
   * 基本これは使用しない
   * ※削除済み項目はstate.valueで値がセットされない限り表示しない。
   */
  isDeletedShow?: boolean;
  text?: string | null;
  nullText?: MultiLang | undefined;
  nullable?: boolean;
  /**
   * 選択肢リスト配列
   * ```javascript
   * const list=[
   *    { id: 0, text: '1個目', isBold: false, isDeleted: false, isHidden: false },
   *    { id: 1, text: '2個目', isBold: false, isDeleted: false, isHidden: false }
   * ]
   * ```
   */
  list: SelectItem[] | readonly SelectItem[];
  // [ InputControl ]
  placeholder?: MultiLang;
  tabindex?: string | undefined;
  classInput?: string | undefined;
  // require
  require?: boolean;
  requireText?: MultiLang | undefined;
  // data
  data?: ValueType;
  diff?: ValueType | undefined;
  disabled?: boolean;
  // warn
  warn?: string;
  warnTitle?: MultiLang | undefined;
  toastTime?: number;
};

const props = withDefaults(defineProps<Props>(), {
  classCol: undefined,
  classRow: undefined,
  isHiddenShow: false,
  isDeletedShow: false,
  text: null,
  nullable: true,
  nullText: undefined,
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
  'update:text': [value: string | null];
  'text-change': [after: string | null, before: string | null];
  'update:is-hidden-show': [value: boolean];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
interface State {
  value: null | number;
  /**
   * 非表示要素の表示フラグ
   */
  isHiddenShow: boolean;
  // isActivate: boolean;
}
const state = reactive<State>({
  value: props.data,
  isHiddenShow: props.isHiddenShow,
  // isActivate: false,
});

const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

const nullText = computed(() => {
  if (props.nullText === undefined) return multiText.props.nullText;
  return props.nullText;
});

// ----------------------------------------------------------------------------
/**
 * いちばん重要な値
 */
watch(
  () => props.data,
  () => {
    if (props.data === undefined) return;
    state.value = props.data;
  }
);

/**
 * 値を変更する処理
 */
const onChange = async (e: any) => {
  if (props.disabled) return;
  // inputElm.value.focus();
  const before = props.data;
  const value = IntNullable(state.value);
  state.value = value;
  emit('update:data', value);
  await nextTick();
  emit('value-change', value, before);
};

//  ------------------------------------------------------------------------------
/**
 * 非表示要素の表示設定変更
 */
watch(
  () => props.isHiddenShow,
  () => {
    state.isHiddenShow = props.isHiddenShow;
  }
);

/**
 * 非表示要素の表示設定変更
 */
const isHiddenShowChange = async (flag: boolean) => {
  if (props.disabled) return;
  state.isHiddenShow = flag;
  await nextTick();
  emit('update:is-hidden-show', flag);
};

//  ------------------------------------------------------------------------------

//  ------------------------------------------------------------------------------

/**
 * Propから取得したオリジナルのリスト
 * ※undefinedの要素は初期値をセットする
 */
const listOrigin = computed(() => {
  return props.list.map((row: SelectItem) => {
    return {
      id: row.id,
      text: row.text,
      imgUrl: row.imgUrl === undefined ? null : row.imgUrl,
      isHidden: row.isHidden === undefined ? false : row.isHidden,
      isDeleted: row.isDeleted === undefined ? false : row.isDeleted,
      isBold: row.isBold === undefined ? false : row.isBold,
    } as SelectItemOrigin;
  });
});

/**
 * ID重複チェックリスト
 */
const validIdList = computed(() => {
  const idList = props.list.map((row) => row.id);
  return props.list.filter((row, index) => {
    return idList.indexOf(row.id) !== idList.lastIndexOf(row.id);
  });
});

watch(validIdList, () => {
  checkListVaild();
  //
});
onMounted(() => {
  checkListVaild();
});

/**
 * ID重複チェックリスト
 */
const checkListVaild = () => {
  if (validIdList.value.length !== 0) {
    const message = `[VfcRadio:${GetTextByMultiLang(props.placeholder, storeNac.lang)}]のListにID重複が見られます。\n`;
    console.error(message, validIdList.value);
    Toast.Error(message + '\n' + JSON.stringify(validIdList.value, null, 3), 'システムエラー');
  }
};

/**
 * 表示用リスト
 */
interface SelectItemShow extends SelectItemOrigin {
  elm: HTMLElement | null;
  activate: boolean;
}
const listShow = ref<SelectItemShow[]>([]);

const setListShow = () => {
  const isHiddenShow = state.isHiddenShow;
  const isDeletedShow = props.isDeletedShow;
  // console.log('setListShow', isHiddenShow);
  listShow.value = listOrigin.value
    .filter((row) => {
      // console.log(row);
      if (state.value !== row.id) {
        if (row.isDeleted === true && isDeletedShow !== true) return false;
        if (row.isHidden === true && isHiddenShow !== true) return false;
      }
      return true;
    })
    .map((row) => {
      return {
        ...row,
        elm: null,
        activate: false,
      };
    });
};
setListShow();
watch(listOrigin, () => setListShow());

watch(
  () => [state.isHiddenShow, props.isDeletedShow, state.value],
  () => setListShow()
);
//  ------------------------------------------------------------------------------

/**
 * 選択中のアイテム
 * nullを返す条件は
 * ・選択中要素がnull
 * ・選択中要素がリストにない場合
 */
const selectedItem = computed(() => {
  if (state.value === null) return null;
  const ret = listOrigin.value.find((row) => {
    return row.id === state.value;
  });
  if (ret === undefined) {
    return null;
  }
  return ret;
});

/**
 * 表示中テキスト
 */
const displayText = computed(() => {
  const item = selectedItem.value;
  if (item === null) {
    if (state.value === null) {
      // nullの時でnullが許容されていない場合は空文字を返す
      if (props.nullable === true) {
        return GetTextByMultiLang(nullText.value, storeNac.lang);
      } else {
        return '';
      }
    } else {
      // 想定外の値が表示されている場合
      return '';
    }
  }
  return GetTextByMultiLang(item.text, storeNac.lang);
});

const DisplayTextType = {
  itemText: 1,
  nullText: 0,
  nullableError: -1,
  notExsitError: -2,
} as const;

/**
 * 表示中テキストの表示状態
 *  itemText: 1,
 *  nullText: 0,
 *  nullableError: -1,
 *  notExsitError: -2,
 */
const displayTextType = computed(() => {
  const item = selectedItem.value;
  if (item === null) {
    if (state.value === null) {
      // nullの時でnullが許容されていない場合は空文字を返す
      if (props.nullable === true) {
        return DisplayTextType.nullText;
      } else {
        return DisplayTextType.nullableError;
      }
    } else {
      // 想定外の値が表示されている場合
      return DisplayTextType.notExsitError;
    }
  }
  return DisplayTextType.itemText;
});

/**
 * 表示中テキストの変更通知イベント
 */
watch(
  () => [displayText.value, displayTextType],
  async () => {
    const before = props.text;
    let ret: null | string = null;
    switch (displayTextType.value) {
      case DisplayTextType.nullText:
      case DisplayTextType.nullableError:
      case DisplayTextType.notExsitError:
        ret = GetTextByMultiLang(nullText.value, storeNac.lang);
        break;
      default:
        ret = displayText.value;
        break;
    }
    emit('update:text', ret);
    await nextTick();
    emit('text-change', ret, before);
  }
);

/**
 * Propから取得したオリジナルのリストから非表示状態になる要素をカウント
 * 非表示要素が・・・
 * ①表示中の場合->マイナスの値
 * ①非表示の場合->プラスの値
 */
const hiddenCount = computed(() => {
  const ret = listOrigin.value.reduce((sum, row) => {
    if (row.isDeleted === false && row.isHidden === true) {
      return sum + 1;
    }
    return sum;
  }, 0);
  if (state.isHiddenShow) {
    return -ret;
  } else {
    return ret;
  }
});

const computedColClass = computed(() => {
  if (props.classCol === undefined) {
    return 'col-auto';
  } else {
    return props.classCol;
  }
});

// ----------------------------------------------------------------------------

// [ ref ]
const inputElement = computed(() => {
  if (inputElementNull.value !== null) return inputElementNull.value;
  if (listShow.value.length !== null) {
    return listShow.value[0].elm;
  }
  return null;
});
const inputElementNull = ref<HTMLElement | null>(null);

/**
 * 強制focus
 */
const elmFocus = () => {
  if (inputElement.value !== null) {
    inputElement.value.focus();
  }
};

// [ focus, blur ]

interface FocusState {
  isActivate: boolean;
  isMmousedownItem: boolean;
  isNullActivate: boolean;
  isKeyDown: boolean;
}

const focusState = reactive<FocusState>({
  isActivate: false,
  isMmousedownItem: false,
  isNullActivate: false,
  isKeyDown: false,
});

/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  if (props.disabled === true) return false;
  if (storeNac.state.uid !== uid) return false;
  if (focusState.isActivate) return true;
  if (focusState.isMmousedownItem) return true;
  if (focusState.isNullActivate) return true;
  if (focusState.isKeyDown) return true;
  if (listShow.value.filter((row) => row.activate === true).length === 1) return true;
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
const onMousedownItem = () => {
  focusState.isMmousedownItem = true;
};
const onMouseupItem = (elm: HTMLElement | null) => {
  focusState.isMmousedownItem = false;
  if (elm !== null) {
    elm.focus();
  }
};

const onKeydown = () => {
  focusState.isKeyDown = true;
};

const onKeyup = () => {
  focusState.isKeyDown = false;
};

const onFocus = (index: null | number) => {
  focusState.isActivate = true;
  if (index === null) {
    focusState.isNullActivate = true;
  } else {
    listShow.value[index].activate = true;
  }
  storeNac.state.uid = uid;
};
const onBlur = (index: null | number) => {
  if (index === null) {
    focusState.isNullActivate = false;
  } else {
    listShow.value[index].activate = false;
  }
  setTimeout(() => {
    focusState.isActivate = false;
  }, 5);
};

//  ------------------------------------------------------------------------------
/**
 * FormContorlのクラス用
 */
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: props.diff !== undefined && props.diff !== state.value,
    hasWarn: displayTextType.value === DisplayTextType.notExsitError || props.warn !== '',
    activate: computedActivate.value,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};

//  ------------------------------------------------------------------------------

onMounted(() => {
  emit('update:text', displayText.value);
});
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
    <div ref="focusGroup" class="vcas-c-input-box" :class="[{ disabled: props.disabled }]">
      <div
        class="radio-row"
        :class="[`row`, classRow]"
        @keyup.up="onKeyup"
        @keydown.up="onKeydown"
        @keyup.down="onKeyup"
        @keydown.down="onKeydown"
        @keyup.left="onKeyup"
        @keydown.left="onKeydown"
        @keyup.right="onKeyup"
        @keydown.right="onKeydown"
      >
        <!-- null -->
        <div v-if="props.nullable" class="radio-col" :class="computedColClass">
          <div
            class="vcas-radio"
            :class="[{ disabled: props.disabled, checked: state.value == null }]"
            @mousedown="onMousedownItem"
            @mouseup="onMouseupItem(inputElementNull)"
          >
            <input
              :id="`radio${uid}-null`"
              :ref="(e:any) => (inputElementNull = e)"
              v-model="state.value"
              type="radio"
              :name="`radio${uid}`"
              :tabindex="props.tabindex"
              :value="null"
              :disabled="props.disabled"
              @focus="onFocus(null)"
              @blur="onBlur(null)"
              @change="onChange"
            />
            <label class="radio-mark" :class="{ checked: state.value == null }" :for="`radio${uid}-null`"></label>
            <label class="radio-label" :for="`radio${uid}-null`">
              <span>{{ GetTextByMultiLang(nullText, storeNac.lang) }}</span>
            </label>
          </div>
        </div>
        <!-- list -->
        <template v-for="(row, index) in listShow" :key="index">
          <div
            class="radio-col"
            :class="computedColClass"
            @mousedown="onMousedownItem"
            @mouseup="onMouseupItem(row.elm)"
          >
            <div class="vcas-radio" :class="[{ disabled: props.disabled, checked: state.value == row.id }]">
              <input
                :id="`radio${uid}-${row.id}`"
                :ref="(e:any) => (row.elm = e)"
                v-model="state.value"
                type="radio"
                class=""
                :name="`radio${uid}`"
                :tabindex="props.tabindex"
                :value="row.id"
                :disabled="props.disabled"
                @focus="onFocus(index)"
                @blur="onBlur(index)"
                @change="onChange"
              />
              <label class="radio-mark" :for="`radio${uid}-${row.id}`"></label>
              <label
                class="radio-label"
                :for="`radio${uid}-${row.id}`"
                :class="{
                  isBold: row.isBold === true,
                  isDeleted: row.isDeleted === true,
                  isHidden: row.isHidden === false,
                }"
              >
                <span>{{ GetTextByMultiLang(row.text, storeNac.lang) }}</span>
              </label>
            </div>
          </div>
        </template>
      </div>
      {{}}
      <template v-if="0 < hiddenCount">
        <div :class="[`text-dark`, `item-hidden-control`]" :value="null" @click.stop="isHiddenShowChange(true)">
          <span>
            <i :class="[`fas`, `fa-caret-right`, `mx-1`]"></i>
            {{ GetTextByMultiLang(multiText.item.hiddenItemShow, storeNac.lang) }}
          </span>
          <span class="icons">
            <i :class="[`fas`, `fa-eye-slash`, `}text-warning`]"></i>
            <i class="fas fa-caret-right"></i>
            <i :class="[`fas`, `fa-eye`, `text-success`]"></i>
          </span>
        </div>
      </template>
      <template v-if="hiddenCount < 0">
        <div :class="[`item-hidden-control`, `text-action`]" :value="null" @click.stop="isHiddenShowChange(false)">
          <span>
            <i :class="[`fas`, `fa-caret-right`, `mx-1`]"></i>
            {{ GetTextByMultiLang(multiText.item.hiddenItemHide, storeNac.lang) }}
          </span>
          <span class="icons">
            <i :class="[`fas`, `fa-eye`, `text-success`]"></i>
            <i :class="[`fas`, `fa-caret-right`]"></i>
            <i :class="[`fas`, `fa-eye-slash`, `text-warning`]"></i>
          </span>
        </div>
      </template>
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
$control-fore-color: #222222 !default;
$control-line-color: #112288 !default;
//   .dummy {
//     position: absolute;
//   }

.vcas-c-input-box {
  width: 100%;
  height: 100%;
  display: block;
  font-size: 1em;
}

//  ------------------------------------------------------

.vcas-c-input-box {
  width: 100%;
  height: 100%;

  // display: flex;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .radio-row {
    display: flex;
    align-items: center;
    width: 100%;
    // height: 100%;
  }
  .radio-col {
    display: flex;
    align-items: center;
    // width: 100%;
    // height: 100%;
  }

  .vcas-radio {
    display: flex;
    align-items: center;
    min-width: 0;
    cursor: pointer;

    align-self: center;
    padding: 0 6px 0 0;

    input {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      background-color: transparent;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border: 0px;
      outline: none;
    }

    .radio-mark {
      flex: 0 0 15px;
      justify-content: flex-start;
      flex: 0 0 auto;
      width: 15px;
      height: 15px;
      border-radius: 100%;
      border: 1px solid gray;
      margin-right: 3px;
      margin: 3px 2px 2px 0;
      box-shadow: inset 0 0 6px rgba(23, 97, 236, 0.308);
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid $control-line-color;
      cursor: pointer;

      transition: all 300ms;

      &::after {
        content: '';
        width: 9px;
        height: 9px;
        position: relative;
        border-radius: 100%;
        background-color: #ffdd9f;
        box-shadow: inset 0 0 6px #ffa600;
        transform: scale(0);
        transition: all 300ms;
      }
    }
    .radio-label {
      min-width: 0;
      flex: 1 1 auto;
      overflow: hidden;
      overflow-wrap: break-word;
      word-break: break-all;
      cursor: pointer;
    }

    &.checked {
      .radio-mark {
        border: 1px solid #f55a00;

        &::after {
          background-color: #ffbcab;
          box-shadow: inset 0 0 7px #f58b00;
          // border: 1px solid #f58b00;
          transform: scale(100%);
        }
      }
    }

    &.disabled {
      cursor: default;
      .radio-mark {
        border: 1px solid #818181;
        cursor: default;

        &::after {
          background-color: #9e9e9e;
          box-shadow: inset 0 0 6px #505050;
        }
      }
      .radio-label {
        cursor: default;
      }
    }

    .radio-label.isDeleted {
      color: rgb(165, 0, 0);
    }
  }
}

.item-hidden-control {
  width: calc(100% - 0px);
  padding: 8px 0;
  margin: 6px 0px 0 0px;
  border-top: solid 1px gray;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;

  cursor: pointer;

  > .icons {
    margin: 0 0 0 3px;
    border: solid 1px rgb(190, 190, 190);
    border-radius: 4px;
    padding: 2px 8px;
    background-color: rgba(255, 255, 255, 0.212);

    i:nth-child(2) {
      margin: 0 8px;
    }
    .fa-caret-right {
      color: #9e9e9e;
    }
  }
}
//  disabled
.vcas-c-input-box.disabled {
  .select-display::after {
    color: #969696;
  }
  .select-display > .img-box {
    cursor: default;
  }
  .select-display > .select-display-text {
    cursor: default;
  }

  .item-hidden-control {
    cursor: default;
    color: rgb(92, 92, 92) !important;
    i {
      color: rgb(92, 92, 92) !important;
    }
  }
}
</style>
