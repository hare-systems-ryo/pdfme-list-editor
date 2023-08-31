<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/datepicker.ts
---------------------------------------------------------------------------- */

// [ node-modules ]
import flatpickr from 'flatpickr';
import dayjs from 'dayjs';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { Japanese as ja } from 'flatpickr/dist/l10n/ja';
import { english as en } from 'flatpickr/dist/l10n/default';
// [ vueuse ]
import { useMounted } from '@vueuse/core';

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';

// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { NacStaticLangVfc, NacStaticLangDatePicker } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ nac-ui ]
const Toast = storeNac.useToast();
// [ vueuse ]
const isMounted = useMounted();
const MonthSelectPlugin: any = monthSelectPlugin;

// ----------------------------------------------------------------------------
type ValueType = string | null;
// [ Props ]
type Props = {
  // DatePicker関連要素
  textAlign?: 'left' | 'center' | 'right';
  mode?: 'all' | 'date' | 'time' | 'month';
  dataFormat?: string;
  showFormat?: string;
  minDate?: string | null;
  maxDate?: string | null;
  hideDeleteBtn?: boolean;
  disableMobile?: boolean;
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
  mode: 'date',
  dataFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  showFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  minDate: null,
  maxDate: null,
  hideDeleteBtn: false,
  disableMobile: false,
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
};
const emit = defineEmits<Emits>();
// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// [ reactive ]
interface State {
  picker: any;
  // FormControl値
  date: Date | null;
  // text: string;
  option: any;
}
const state = reactive<State>({
  // text: '',
  picker: null,
  date: null,
  option: {
    dateFormat: 'Z',
    locale: ja,
    time_24hr: true,
    minDate: undefined,
    maxDate: undefined,
    // disableMobile: props.disableMobile,
    plugins: [],
  },
});
onMounted(() => {
  state.option.maxDate = dayjs(props.maxDate).isValid() === true ? dayjs(props.maxDate).toISOString() : undefined;
  state.option.minDate = dayjs(props.minDate).isValid() === true ? dayjs(props.minDate).toISOString() : undefined;
});

const requireText = computed(() => {
  if (props.requireText === undefined) return NacStaticLangVfc.requireText;
  return props.requireText;
});
const warnTitle = computed(() => {
  if (props.warnTitle === undefined) return NacStaticLangVfc.warnTitle;
  return props.warnTitle;
});

//  更新の有無確認
const computedIsChange = computed(() => {
  if (props.diff === undefined) return false;
  if (props.diff === null && props.data === '') return false;
  if (props.diff === '' && props.data === null) return false;
  if (props.diff !== props.data) return true;
  return false;
});

const inputBoxClass = computed(() => {
  if (props.textAlign === 'left') {
    return 'display-left';
  } else if (props.textAlign === 'center') {
    return 'display-center';
  } else {
    return 'display-right';
  }
});
const displayText = computed(() => {
  const lang = storeNac.lang;
  /* eslint-disable */
  dayjs.locale(lang);
  /* eslint-enable */
  if (props.data === null) {
    return '';
  } else {
    return dayjs(props.data).format(props.showFormat);
  }
});

// ----------------------------------------------------------------------------
watch(
  () =>
    computed(() => {
      return [props.minDate, props.maxDate, storeNac.lang];
    }).value,
  () => {
    if (!isMounted.value) return;
    setTimeout(() => {
      resetPicekr();
    }, 1);
  }
);

const checkDate = (date: any) => {
  // console.log(props.minDate);
  if (props.minDate !== '' && dayjs(date).isBefore(props.minDate)) {
    // console.log('最小日付を下回っています', props.data, props.minDate);
    return false;
  } else if (props.maxDate !== '' && dayjs(date).isAfter(props.maxDate)) {
    // console.log('最大日付を下回っています', props.data, props.maxDate);
    return false;
  }
  return true;
};

const keyDown = (event: any) => {
  const before = props.data;
  // console.log('keyDown', state.picker);
  if (event.key === 'Enter') {
    datePickerToday();
    return;
  }
  if (event.key === 'Backspace') {
    iconEventDelete();
    return;
  }
  let move = 0;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    move--;
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    move++;
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    // Flatpickerにフォーカスを奪われるキーイベントはフォーカスを取り戻す予約
    setTimeout(() => {
      // console.log('フォーカス戻す');
      if (inputElement.value != null) {
        inputElement.value.focus();
      }
    }, 150);
  }
  if (move !== 0) {
    let m = props.data == null ? dayjs() : dayjs(props.data);
    if (move < 0) {
      m = m.subtract(1, 'd');
    } else {
      m = m.add(1, 'd');
    }
    if (props.data !== '') {
      if (checkDate(m) === false) {
        // console.log('行き過ぎ');
        return false;
      }
    } else if (move < 0) {
      m = dayjs(props.maxDate).subtract(1, 'd');
    } else {
      m = dayjs(props.minDate).add(1, 'd');
    }
    emit('update:data', m.format(props.dataFormat));
    nextTick(() => {
      emit('value-change', m.format(props.dataFormat), before);
    });
    return false;
  }
};

// ----------------------------------------------------------------------------
// [ flatpicker関連 ]
const initFlatPickerOption = () => {
  if (props.mode === 'all' || props.mode === 'time') {
    state.option.enableTime = true;
    if (props.mode === 'time') {
      state.option.noCalendar = true;
    }
  }
  if (props.mode === 'month') {
    state.option.disableMobile = true;
  }
  if (props.disableMobile) {
    state.option.disableMobile = true;
  }
  if (props.mode === 'month') {
    state.option.plugins = [
      new MonthSelectPlugin({
        shorthand: true, // デフォルトはfalse
        dateFormat: 'm.y', // デフォルトは"F Y"
        altFormat: 'F Y', // デフォルトは"F Y"
        theme: 'dark', // デフォルトは"light"
      }),
    ];
  }
};

const onOpen = (selectedDates: any, dateStr: any, instance: any) => {
  focusState.isOpenFlatpickr = true;
};

const onClose = (selectedDates: any, dateStr: any, instance: any) => {
  focusState.isOpenFlatpickr = false;
  focusState.isClosingFlatpickr = true;
  setTimeout(() => {
    focusState.isClosingFlatpickr = false;
  }, 200);
};

const onChange = (selectedDates: any, dateStr: any, instance: any) => {
  const before = props.data;
  let value = null;
  if (selectedDates.length === 0) {
    value = null;
  } else {
    const d = selectedDates[0];
    if (d == null) {
      value = null;
    } else {
      value = d;
    }
  }
  updateValue(value);
};

const generateFlatPickerOption = () => {
  // console.log('generatePicker', elmInput.value);
  if (inputElement.value != null) {
    /* eslint-disable */
    dayjs.locale(storeNac.lang);
    /* eslint-enable */
    switch (storeNac.lang) {
      case 'ja':
        state.option.locale = ja;
        break;
      case 'en':
        state.option.locale = en;
        break;
      default:
        state.option.locale = en;
        break;
    }
    state.picker = flatpickr(inputElement.value, state.option);
    state.picker.config.onChange.push(onChange);
    state.picker.config.onOpen.push(onOpen);
    state.picker.config.onClose.push(onClose);
    setValue();
    // MonthSelectPlugin();
  }
};
const flag = ref(false);

const resetPicekr = () => {
  if (flag.value) return;
  try {
    flag.value = true;
    state.picker.destroy();
    state.picker = false;
    focusState.isOpenFlatpickr = false;
    /* eslint-disable */
    dayjs.locale(storeNac.lang);
    /* eslint-enable */
    if (props.minDate !== null) {
      state.option.minDate = dayjs(props.minDate).isValid() === true ? dayjs(props.minDate).toISOString() : undefined;
    }
    if (props.maxDate !== null) {
      state.option.maxDate = dayjs(props.maxDate).isValid() === true ? dayjs(props.maxDate).toISOString() : undefined;
    }
    generateFlatPickerOption();
  } catch (error) {
    console.error('resetPicekr()', error);
  } finally {
    flag.value = false;
  }
};

watch(
  () => props.data,
  () => {
    setValue();
  }
);

const setValue = () => {
  const before = props.data;
  // console.log('setValue');
  try {
    if (props.data == null) {
      state.picker.setDate(null);
      state.date = null;
      return;
    }
    if (dayjs(props.data).isValid() === true) {
      if (checkDate(props.data) === true) {
        state.date = dayjs(props.data).toDate();
        state.picker.setDate(state.date);
        return;
      }
    }
    throw new Error('変換失敗');
  } catch {
    state.picker.setDate(null);
    state.date = null;
    updateValue(null);
  }
};
//  アイコン系イベント
const datePickerToggle = () => {
  if (props.disabled === true) return;
  if (state.picker === null) return;
  if (focusState.isClosingFlatpickr) return;
  storeNac.state.uid = uid;
  state.picker.open();
};

const datePickerToday = () => {
  const before = props.data;
  if (props.disabled === true) {
    return;
  }
  if (state.date != null) {
    return;
  }
  let inputValue = dayjs();
  if (props.mode === 'month') {
    inputValue = inputValue.startOf('month');
  }
  if (checkDate(inputValue.format('YYYY-MM-DD')) === false) {
    const title = GetTextByMultiLang(NacStaticLangDatePicker.error.outObInputRangeTitle, storeNac.lang);
    const message = GetTextByMultiLang(NacStaticLangDatePicker.error.outObInputRangeMessage, storeNac.lang);
    Toast.Warning(message, title, props.toastTime);
    return;
  }
  updateValue(inputValue.format(props.dataFormat));
};

const updateValue = async (text: string | null) => {
  const before = props.data;
  if (text === null || text.length === 0) {
    emit('update:data', null);
    await nextTick();
    emit('value-change', null, before);
    return;
  }
  if (props.mode === 'all' || props.mode === 'time') {
    emit('update:data', dayjs(text).format(props.dataFormat));
    nextTick(() => {
      emit('value-change', dayjs(text).format(props.dataFormat), before);
    });
  } else {
    // 時間情報を削除する
    emit('update:data', dayjs(dayjs(text).format('YYYY-MM-DD')).format(props.dataFormat));
    nextTick(() => {
      emit('value-change', dayjs(dayjs(text).format('YYYY-MM-DD')).format(props.dataFormat), before);
    });
  }
};

const iconEventDelete = () => {
  const before = props.data;
  if (props.disabled === true) {
    return;
  }
  if (state.date != null) {
    emit('update:data', null);
    nextTick(() => {
      emit('value-change', null, before);
    });
  }
};

// [ ref ]
const inputElement = ref();
onMounted(() => {
  emit('ref', inputElement.value as HTMLInputElement);
});

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
  isOpenFlatpickr: boolean;
  isClosingFlatpickr: boolean;
}

const focusState = reactive<FocusState>({
  isOpenFlatpickr: false,
  isClosingFlatpickr: false,
});

/**
 * コントロールのFocus判定
 */
const computedActivate = computed(() => {
  if (props.disabled === true) return false;
  if (storeNac.state.uid !== uid) return false;
  if (focusState.isOpenFlatpickr) return true;
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

// [ baseClass ]
const baseClass = computed(() => {
  return {
    disabled: props.disabled,
    diff: computedIsChange.value,
    hasWarn: props.warn !== '',
    activate: computedActivate.value,
    'nac-datepicker': true,
  };
});

// [ iconEventShowWarn ]
const iconEventShowWarn = () => {
  Toast.Warning(props.warn, GetTextByMultiLang(warnTitle.value, storeNac.lang), props.toastTime);
};

onMounted(() => {
  initFlatPickerOption();
  generateFlatPickerOption();
});
onUnmounted(() => {
  if (state.picker != null) {
    state.picker.destroy();
    state.picker = null;
  }
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
    <template #before-icon>
      <div data-sep="right" data-icon="calendar" @click="datePickerToggle()"></div>
    </template>
    <div class="nac-c-input-box" :class="[{ disabled: props.disabled }, inputBoxClass]" @click="datePickerToggle()">
      <input
        :ref="(e) => setRef(e)"
        type="text"
        class="flatpickr-body"
        :disabled="props.disabled"
        :tabindex="tabindex"
        @keydown="keyDown"
      />
      <span>{{ displayText }}</span>
      <span v-if="props.data === null" class="today" @click.stop="datePickerToday()">
        {{ props.mode === 'month' ? 'Now' : 'Today' }}
      </span>
    </div>
    <template #after-icon>
      <div
        v-if="!props.hideDeleteBtn"
        data-sep="left"
        data-icon="delete"
        :title="props.warn"
        @click="iconEventDelete()"
      ></div>
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
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 0 4px;
  .today {
    margin: 0 0 0 4px;
    border-radius: 4px;
    border: solid 1px #f68708;
    background-color: rgb(255, 246, 237);
    color: #e26f2c;
    font-size: 12px;
    padding: 1px 4px;
  }

  .flatpickr-body {
    position: absolute;
    opacity: 0 !important;
    top: 0px;
    height: 40px;
    height: 100%;
    width: 40px;
    left: 0;
    z-index: -1;
    pointer-events: none;
  }
}

:deep(.flatpickr-mobile) {
  position: absolute;
  opacity: 0;
}
.nac-c-input-box {
  display: flex;
  align-items: center;
  &.display-left {
    justify-content: flex-start;
  }

  &.display-center {
    justify-content: center;
  }

  &.display-right {
    justify-content: flex-end;
  }
}

.nac-datepicker.disabled {
  .nac-c-input-box {
    cursor: default;
    .today {
      display: none;
    }
  }
}
</style>
