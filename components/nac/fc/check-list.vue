<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/check-list.ts
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
import { ObjectCompare, ObjectCopy, ListIdSort } from '../lib/nac-func';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangCheckList } from '../nac-static-lang';
import type { SelectItem, SelectItemOrigin } from '../nac-main';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// ----------------------------------------------------------------------------
type ValueType = number[];
// [ Props ]
type Props = {
  list: SelectItem[] | readonly SelectItem[];
  /**
   * 画像を表示するかどうか
   */
  hasImage?: boolean;
  imageObjectFit?: 'contain' | 'cover';
  imageBorder?: string;

  classRow?: string | string[] | any;
  classCol?: string | string[] | any;
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
  list: () => [],
  listItemClass: '',
  hasImage: false,
  imageObjectFit: 'contain',
  imageBorder: 'border-gray',
  classRow: '',
  classCol: '',
  // Form系コントロール統一要素
  placeholder: () => ({ ja: '', en: '' }),
  tabindex: undefined,
  classInput: '',
  // require
  require: false,
  requireText: undefined,
  // data
  data: () => [],
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

// [ reactive ]
const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});

const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

const isChange = computed(() => {
  if (props.diff === undefined) return false;
  return !ObjectCompare(
    props.diff.map((row) => row).sort(),
    props.data.map((row) => row)
  );
});

const colClass = computed(() => {
  if (props.classCol === undefined) {
    return 'col-auto';
  }
  if (String(props.classCol).length === 0) {
    return 'col-auto';
  }
  if (/^col-|^col | col | col$| col-/g.test(props.classCol) === false) {
    return [`col-auto`, props.classCol];
  }
  return props.classCol;
});

const rowClass = computed(() => {
  return [`row`, props.classRow];
});

// [ 選択肢配列 ]
interface ItemListRow {
  id: number;
  text: MultiLang;
  focus: boolean;
  imgUrl: string | null;
}
const itemList = ref<ItemListRow[]>([]);
watch(
  () => [...props.list],
  () => {
    //
    setItemList();
  }
);
const setItemList = () => {
  itemList.value = props.list.map((row) => {
    return {
      id: row.id,
      text: row.text,
      imgUrl: row.imgUrl === undefined ? null : row.imgUrl,
      focus: false,
    } as ItemListRow;
  });
};
setItemList();

const itemListIdArray = computed(() => {
  return props.list.map((row) => row.id);
});

const notExistMessage = computed(() => {
  const lang = storeNac.lang;
  const list = itemListIdArray.value;
  const errorList: number[] = [];
  props.data.forEach((val) => {
    if (list.includes(val) === false) {
      errorList.push(val);
    }
  });
  if (errorList.length !== 0) {
    const ret = ObjectCopy(NacStaticLangCheckList.display.notExsitError);
    Object.keys(ret).forEach((key) => {
      (ret as any)[key] += `\n[${errorList.join(',')}]`;
    });
    return GetTextByMultiLang(ret, lang);
  } else {
    return '';
  }
});

// ----------------------------------------------------------------------------

const valueChange = async (id: number, value: number) => {
  const before = props.data.map((row) => row);
  let temp = props.data.map((row) => row);
  if (props.data.includes(id)) {
    // console.log('valueChange off', id);
    temp = props.data.filter((row) => {
      if (row === id) {
        return false;
      } else {
        return true;
      }
    });
  } else {
    // console.log('valueChange on', id, value);
    temp.push(id);
  }
  const ret = ListIdSort([...props.list], temp);
  emit('update:data', ret);
  await nextTick();
  emit('value-change', ret, before);
};

// ----------------------------------------------------------------------------
// [ ref ]
const inputElement = ref();
const setRef = (elm: any, index: number) => {
  if (index === 0) {
    inputElement.value = elm;
    emit('ref', inputElement.value as HTMLInputElement);
  }
};

/**
 * 強制focus
 */
const elmFocus = () => {
  inputElement.value.focus();
};

// [ focus, blur ]
interface FocusState {
  isMmousedown: boolean;
}

const focusState = reactive<FocusState>({
  isMmousedown: false,
});

/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  if (focusState.isMmousedown) return true;
  if (itemList.value.filter((row) => row.focus === true).length !== 0) return true;
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
        data: props.data.map((row) => row),
      });
    }, 10);
  } else {
    emit('blur', {
      elm: inputElement.value,
      placeholder: props.placeholder,
      data: props.data.map((row) => row),
    });
  }
});

const onMousedown = () => {
  focusState.isMmousedown = true;
};
const onMouseup = () => {
  // console.log('onMouseup');
  focusState.isMmousedown = false;
  elmFocus();
};

const onFocus = (row: ItemListRow) => {
  row.focus = true;
};

const onBlur = (row: ItemListRow) => {
  setTimeout(() => {
    row.focus = false;
  }, 10);
};

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: isChange.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    'vcas-textbox': true,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  if (notExistMessage.value.length === 0) {
    Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
  } else {
    Toast.Warning(
      notExistMessage.value + '\n' + props.warn,
      GetTextByMultiLang(warnTitle.value, storeNac.lang),
      props.toastTime
    );
  }
};

const hasWarn = computed(() => {
  return (notExistMessage.value + props.warn).length !== 0;
});

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
    @mouseup="onMouseup"
    @mousedown="onMousedown"
  >
    <div class="vcas-c-input-box" @mousedown.stop="" @mouseup.stop="">
      <div :class="rowClass">
        <template v-for="(row, index) in itemList" :key="index">
          <div :class="colClass">
            <nac-fc-check-box
              :data="props.data.includes(row.id) === true ? 1 : 0"
              class="cleck-list-item"
              :placeholder="row.text"
              :class="props.listItemClass"
              :image-border="props.imageBorder"
              :image-object-fit="props.imageObjectFit"
              :has-image="props.hasImage"
              :img-url="row.imgUrl"
              :tabindex="tabindex"
              :disabled="props.disabled"
              @value-change="(value) => valueChange(row.id, value)"
              @focus="() => onFocus(row)"
              @blur="() => onBlur(row)"
              @ref="(e) => setRef(e, index)"
            />
          </div>
        </template>
      </div>
    </div>
    <template #after-icon>
      <div v-if="hasWarn" data-sep="left" data-icon="warn" :title="props.warn" @click="iconEventShowWarn()"></div>
    </template>
  </nac-fc-form-control>
</template>

<style lang="scss" scoped>
.vcas-c-input-box {
  width: 100%;
  height: 100%;
}
.cleck-list-item {
  margin: 2px 6px;
}
</style>
