<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/select.ts
---------------------------------------------------------------------------- */

// [ node_modules ]
import dayjs from 'dayjs';

// [ vueuse ]
import { useFocusWithin } from '@vueuse/core';

// [ lib ]
import { GetTextByMultiLang, MultiLang, Sleep } from '../nac-main';
import { SelectItem, SelectItemOrigin } from '../nac-main';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangSelect, NacStaticLangCom } from '../nac-static-lang';

import SelectImgIcon from './select--img-icon.vue';

// ----------------------------------------------------------------------------

// [ nac-stroe ]
const storeNac = _useStoreNac();
const multiText = computed(() => NacStaticLangSelect);
const lang = computed(() => storeNac.lang);
// [ nac-ui ]
const Toast = storeNac.useToast();
type ValueType = number | null;
// [ Props ]
type Props = {
  /**
   * 非表示要素の表示非表示切り替えフラグ
   * コンポーネントからのデータ書き換えがあるので「v-model」を使用してください
   */
  isHiddenShow?: boolean;
  /**
   * 画像を表示するかどうか
   */
  hasImage?: boolean;
  imageObjectFit?: 'contain' | 'cover';
  imageBorder?: string;
  menu?: boolean;
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
  clickAndClose?: boolean;
  overFlow?: 'nowrap' | 'wrap';
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
  menu: false,
  hasImage: false,
  itemListHeight: 200,
  isHiddenShow: false,
  isDeletedShow: false,
  imageObjectFit: 'contain',
  imageBorder: 'border-gray',
  text: null,
  nullable: true,
  nullText: undefined,
  clickAndClose: true,
  overFlow: 'nowrap',
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
  'update:data': [value: ValueType];
  'value-change': [after: ValueType, before: ValueType];
  'update:text': [value: string | null];
  'update:is-hidden-show': [value: boolean];
  'text-change': [after: string | null, before: string | null];
  // 'open-select-item-window': [func: () => void];
  // 'close-select-item-window': [func: () => void];
  // 'toggle-select-item-window': [func: () => void];
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
const FocusType = {
  nullValue: 1,
  hiddenItemControl: 2,
  selectItem: 3,
} as const;
interface State {
  value: null | number;
  /**
   * 非表示要素の表示フラグ
   */
  isHiddenShow: boolean;
  /**
   * ドロップダウンの開閉フラグ
   */
  isShowSelectItem: boolean;
  /**
   * ドロップダウンの開閉フラグCSS操作用 setPos()関数で操作
   */
  isShowSelectItemCssControl: boolean;
  isShow: {
    base: boolean;
  };
  /**
   * ドロップダウンのフォーカスがあたっている要素
   * 上下キーで移動、クリックで移動等のアクティブな要素の表示用
   */
  focus: {
    /**
     * フォーカス要素の種類
     * 1:
     * 上下キーで移動、クリックで移動等のアクティブな要素の表示用
     */
    type: (typeof FocusType)[keyof typeof FocusType];
    id: null | number;
  };
}
const state = reactive<State>({
  value: props.data,
  isHiddenShow: props.isHiddenShow,
  isShowSelectItem: false,
  isShowSelectItemCssControl: false,
  isShow: {
    base: false,
  },
  focus: {
    type: FocusType.nullValue,
    id: null,
  },
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
  if (props.nullText === undefined) return NacStaticLangSelect.props.nullText;
  return props.nullText;
});

// ----------------------------------------------------------------------------

const activeValue = ref();
const activeFocus = ref(false);
const activeMenu = ref(props.menu);
const valueChangeAfter = ref(false);

const emlSelect = ref();
const { focused } = useFocusWithin(emlSelect);

let ts = dayjs().format('YYYYMMDD HHmmssSSS');
const setValueChange = (v: number | null) => {
  valueChange(v);
  ts = dayjs().format('YYYYMMDD HHmmssSSS');
  const temp = ts;
  valueChangeAfter.value = true;
  setTimeout(() => {
    if (temp === ts) {
      valueChangeAfter.value = false;
    }
  }, 400);
};

const setFocusByPorpsData = () => {
  if (props.data === undefined) return;
  state.value = props.data;
  setFucusByValue();
};
const setFucusByValue = () => {
  if (state.value === null) {
    // setFocusItem(state.value, FocusType.nullValue);
  } else {
    // setFocusItem(state.value, FocusType.selectItem);
  }
};

/**
 * いちばん重要な値
 */
watch(
  () => props.data,
  () => setFocusByPorpsData()
);
onMounted(() => {
  setFocusByPorpsData();
});

/**
 * 値を変更する処理
 */
const valueChange = async (value: number | null) => {
  if (props.disabled) return;
  const before = state.value;
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
  state.isHiddenShow = flag;
  await nextTick();
  // setFocusItem(null, FocusType.hiddenItemControl);
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
      isControl: false,
    } as SelectItemOrigin;
  });
});

/**
 * 表示用リスト
 */
const listShow = computed(() => {
  // console.log('create:listItem');
  const isHiddenShow = state.isHiddenShow;
  const isDeletedShow = props.isDeletedShow;
  const hiddenCount = listOrigin.value.filter((row) => row.isHidden === true).length;
  const list = listOrigin.value.filter((row) => {
    if (state.value !== row.id) {
      if (row.isDeleted === true && isDeletedShow !== true) return false;
      if (row.isHidden === true && isHiddenShow !== true) return false;
    }
    return true;
  });
  if (state.value === null || props.nullable) {
    list.unshift({
      id: null,
      text: '',
      imgUrl: null,
      isHidden: false,
      isDeleted: false,
      isBold: false,
      isControl: false,
    });
  }

  if (hiddenCount > 0) {
    list.push({
      id: null,
      text: '',
      imgUrl: null,
      isHidden: false,
      isDeleted: false,
      isBold: false,
      isControl: true,
    });
  }
  return list;
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
    const p = GetTextByMultiLang(props.placeholder, lang.value);
    const tilte = GetTextByMultiLang(NacStaticLangCom.systemError, lang.value);
    const message = GetTextByMultiLang(multiText.value.display.validError, lang.value).replace(/{placeholder}/, p);
    console.error(message, validIdList.value);
    Toast.Error(message + '\n' + JSON.stringify(validIdList.value, null, 3), tilte);
  }
};

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
  () => {
    updateText();
  }
);
const updateText = async () => {
  const before = props.text;
  let ret: null | string = null;
  switch (displayTextType.value) {
    case DisplayTextType.nullText:
    case DisplayTextType.nullableError:
    case DisplayTextType.notExsitError:
      ret = null;
      break;
    default:
      ret = displayText.value;
      break;
  }
  emit('update:text', ret);
  await nextTick();
  emit('text-change', ret, before);
};

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

//  ------------------------------------------------------------------------------

// watch(
//   () => state.isShowSelectItem,
//   async (value) => {
//     state.isShow.base = state.isShowSelectItem;
//     await Sleep(1);
//     await nextTick();
//     if (value === true) {
//       // setPos();
//     } else {
//       state.isShowSelectItemCssControl = value;
//     }
//   }
// );

//  ------------------------------------------------------------------------------

//   [ ref ]-------------------------------------------------------------------------
const inputElement = ref();
const setRef = (elm: any) => {
  emlSelect.value = elm;
  emit('ref', elm as HTMLElement);
};

/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  if (props.disabled) return false;
  if (focused.value) return true;
  if (activeFocus.value) return true;
  if (activeMenu.value) return true;
  if (state.isShowSelectItem) return true;
  if (valueChangeAfter.value) return true;
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

const onFocus = () => {
  // focusState.isActivate = true;
  storeNac.state.uid = uid;
};
const onBlur = () => {
  // focusState.isActivate = false;
};

// [ baseClass ]
/**
 * FormContorlのクラス用
 */
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: props.diff !== undefined && props.diff !== state.value,
    hasWarn: displayTextType.value === DisplayTextType.notExsitError || props.warn !== '',
    activate: computedActivate.value,
    // activate: activeFocus.value || activeMenu.value,
    zIndexTop: state.isShowSelectItemCssControl,
  };
});

//  btn要素のa,buttonタグがindex=1 それ以上の設定が必要
const baseStyle = computed(() => {
  return {
    // 'z-index': storeNac.state.uid === uid ? 10000 : undefined,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};

const isUnknownSelect = computed(() => {
  const selectId = state.value;
  const ret = listShow.value.filter((row) => {
    return row.id === selectId;
  });
  return ret.length === 0;
});

// ----------------------------------------------------------------------------
const tabindex = computed(() => {
  if (props.disabled === true) return -1;
  return props.tabindex;
});

onMounted(() => {
  updateText();
});
</script>
<template>
  <!--  -->
  <nac-fc-form-control
    :placeholder="props.placeholder"
    :class="baseClass"
    :class-input="props.classInput"
    :require="props.require"
    :require-text="requireText"
    :disabled="props.disabled"
    :style="baseStyle"
  >
    <template v-if="state.value === null">
      <div class="null-display h-100 d-flex align-items-center pt- pb-0 ps-5 pe-2">
        <SelectImgIcon
          v-if="props.hasImage"
          :image-border="props.imageBorder"
          :image-object-fit="props.imageObjectFit"
        />
        <div class="item-text" :class="`${props.overFlow}`">
          {{ GetTextByMultiLang(nullText, storeNac.lang) }}
        </div>
      </div>
    </template>
    <v-select
      :ref="(e) => setRef(e)"
      v-model="state.value"
      :items="listShow"
      item-title="text"
      item-value="id"
      variant="plain"
      class="nac-select h-100"
      label=""
      density="compact"
      :tabindex="tabindex"
      z-index="10001"
      hide-details
      @update:focused="(f) => (activeFocus = f)"
      @update:menu="(e) => (activeMenu = e)"
      @update:model-value="(v) => setValueChange(v)"
    >
      <template #selection="{ item: { raw: row } }">
        <!-- 表示部分 -->
        <template v-if="state.value === null"> </template>
        <template v-else>
          <div class="d-flex align-items-center pb-0 pt-1 ps-5 pe-2">
            <SelectImgIcon
              v-if="props.hasImage"
              :img-url="row.imgUrl"
              :image-border="props.imageBorder"
              :image-object-fit="props.imageObjectFit"
            />
            <div class="item-text" :class="`${props.overFlow}`">
              <template v-if="isUnknownSelect">
                <div
                  class="text-error"
                  :title="GetTextByMultiLang(multiText.display.notExsitError, storeNac.lang)"
                  @click="Toast.Warning(GetTextByMultiLang(multiText.display.notExsitError, storeNac.lang), '', 3500)"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ GetTextByMultiLang(multiText.display.error, storeNac.lang) }}
                </div>
              </template>
              <template v-else-if="row.id === null">
                {{ GetTextByMultiLang(nullText, storeNac.lang) }}
              </template>
              <template v-else>
                {{ GetTextByMultiLang(row.text, storeNac.lang) }}
              </template>
            </div>
          </div>
        </template>
      </template>
      <template #item="{ item: { raw: row }, props: p }">
        <!-- リスト部分 -->
        <v-list-item v-bind="p" title="" class="list-row bg-white p-0" z-index="10001">
          <template #title>
            <template v-if="!row.isControl">
              <div class="d-flex align-items-center ps-5 py-1 pe-5">
                <div class="selected d-flex-cc text-success" :class="{ active: row.id === state.value }">
                  <i class="fa-solid fa-check"></i>
                </div>
                <div class="hidden d-flex-cc text-dark pe-1" :class="{ active: row.isHidden === true }">
                  <i class="fa-solid fa-eye-slash"></i>
                </div>
                <SelectImgIcon
                  v-if="props.hasImage"
                  :img-url="row.imgUrl"
                  :image-border="props.imageBorder"
                  :image-object-fit="props.imageObjectFit"
                />
                <div class="item-text" :class="`${props.overFlow}`">
                  <template v-if="row.id === null">
                    {{ GetTextByMultiLang(nullText, storeNac.lang) }}
                  </template>
                  <template v-else>
                    {{ GetTextByMultiLang(row.text, storeNac.lang) }}
                  </template>
                </div>
              </div>
            </template>
            <template v-if="row.isControl">
              <div class="d-flex align-items-center ps-5 py-1 pe-2" @click.stop="isHiddenShowChange(0 < hiddenCount)">
                <div class="icons">
                  <i
                    class="fas"
                    :class="{
                      'fa-eye-slash': 0 < hiddenCount,
                      'fa-eye': hiddenCount < 0,
                      [`text-warning`]: 0 < hiddenCount,
                      [`text-success`]: hiddenCount < 0,
                    }"
                  ></i>
                  <i class="fas fa-caret-right mx-1"></i>
                  <i
                    class="fas"
                    :class="{
                      'fa-eye': 0 < hiddenCount,
                      'fa-eye-slash': hiddenCount < 0,
                      [`text-success`]: 0 < hiddenCount,
                      [`text-warning`]: hiddenCount < 0,
                    }"
                  ></i>
                </div>
              </div>
            </template>
          </template>
        </v-list-item>
      </template>
      <template #append-inner="{}">
        <!-- プルダウン表示 -->
        <span class="pe-2 lh-1">
          <i class="text-accent1 fa-solid fa-caret-down rotate rotateX-0" :class="{ 'rotateX-180': activeMenu }"> </i>
        </span>
      </template>
    </v-select>
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

<style lang="scss">
.nac-select {
  .v-field__input {
    padding: 0;
  }
  .v-field__append-inner {
    padding: 0 !important;
  }
  .v-field__input {
    min-height: 10px !important;
  }
  .v-select__selection {
    line-height: 1em !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .v-select__menu-icon {
    color: #f68708;
    display: none;
    opacity: 1;
  }
}
</style>

<style lang="scss" scoped>
.list-row {
  min-height: auto !important;
  &:not(:last-child) {
    border-bottom: solid 1px rgb(187, 187, 187);
  }

  .selected {
    width: 20px;
    position: absolute;
    inset: 0 auto 0 0;
    opacity: 0;

    &.active {
      opacity: 1;
    }
  }
  .hidden {
    width: 20px;
    position: absolute;
    inset: 0 0 0 auto;
    opacity: 0;

    &.active {
      opacity: 0.5;
    }
  }
}

.item-img {
  height: 20px;
  width: 40px;
  // margin: 0 4px 0 0;
  // border: 1px solid rgb(128, 128, 128);
  // background-color: rgb(241, 241, 241);
  // display: flex;
  // justify-content: center;
  // align-items: center;

  // > div {
  //   text-align: center;
  //   line-height: 1em;
  //   font-size: 10px;
  // }
}

.null-display {
  position: absolute;
  inset: 0 0 0 0;
}
</style>
