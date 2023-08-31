<script setup lang="ts">
/* ----------------------------------------------------------------------------
components\nac\fc\pin-code-input.vue
 ---------------------------------------------------------------------------- */

// [ node_modules ]
import { useElementSize } from '@vueuse/core';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
import { Sleep } from '../nac-main';
import { _useStoreNac } from '../nac-store';
// [ nac-stroe ]
const storeNac = _useStoreNac();
// [ Nuxt ]
// ----------------------------------------------------------------------------
// [ Props ]
interface Props {
  len: number;
}
const props = withDefaults(defineProps<Props>(), {
  len: 4,
});

// [ emit ]
type Emits = {
  close: [];
  'reset-value': [func: () => void];
  'set-focus': [func: () => void];
  'update-count': [count: number];
  'update-data': [value: string];
  completed: [value: string];
};
const emit = defineEmits<Emits>();
// ----------------------------------------------------------------------------
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// ----------------------------------------------------------------------------
interface State {
  data: string[];
  dummy: string[];
  hasFocus: boolean[];
}
const state = reactive<State>({
  data: new Array(props.len).fill(''),
  dummy: new Array(props.len).fill(''),
  hasFocus: new Array(props.len).fill(false),
});

const resetValue = async () => {
  await nextTick();
  await Sleep(0);
  state.data = new Array(props.len).fill('');
  state.dummy = new Array(props.len).fill('');
  state.hasFocus = new Array(props.len).fill(false);
};
resetValue();
emit('reset-value', resetValue);
watch(
  () => state.data,
  () => {
    if (!state.data.join('')) return;
    emit('update-data', state.data.join(''));
    const count = state.data.filter((row) => row !== '').length;
    if (count === props.len) {
      emit('completed', state.data.join(''));
    }
  },
  { deep: true }
);
/**
 * 全角数値を半角数値へ変換する
 */
const hankakuToZenkaku = (str: string) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    /* eslint-disable */
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    /* eslint-enable */
  });
};

const setFocus = () => {
  elms.value[0].focus();
};
emit('set-focus', setFocus);
const onInput = (index: number, e: any) => {
  const islast = state.data.length === index + 1;
  // console.log('onInput dumm', index, JSON.stringify(state.dummy));
  // await nextTick();
  try {
    if (e.data !== state.dummy[index] && e.data) {
      state.dummy[index] = e.data;
    }
  } catch (err) {
    // console.log('onInput dumm', index, JSON.stringify(state.dummy));
  }
  const inputText = hankakuToZenkaku(state.dummy[index]);

  state.dummy[index] = '';
  if (!inputText || inputText.length > 1) {
    state.data[index] = '';
    return;
  }
  state.data[index] = inputText;
  // console.log('onInput data', index, JSON.stringify(state.data));
  if (!islast) {
    elms.value[index + 1].focus();
  }
};

const elms = ref<HTMLElement[]>([]);
onBeforeUpdate(() => {
  elms.value = [];
});
const setRef = (e: any) => {
  elms.value.push(e);
};

// [ focus, blur ]
interface FocusState {
  isActivate: boolean;
}

const focusState = reactive<FocusState>({
  isActivate: false,
});

const dummyClick = (index: number) => {
  const count = state.data.length;
  for (let i = 0; i < count; i++) {
    if (!state.data[i]) {
      if (index !== i) {
        // return index;
        elms.value[i].focus();
        return;
      } else if (index === i) {
        return;
      }
    }
  }
};

const keydown = (e: KeyboardEvent, index: number) => {
  const islast = state.data.length === index + 1;
  // console.log(e.key);
  switch (e.key) {
    case 'Backspace':
      if (index !== 0) {
        if (state.data[index]) {
          state.data[index] = '';
          elms.value[index - 1].focus();
        } else {
          state.data[index - 1] = '';
          elms.value[index - 1].focus();
        }
      } else {
        state.data[0] = '';
      }
      // console.log(' backspace が押されました');
      break;
    case 'ArrowLeft':
      if (index !== 0) {
        elms.value[index - 1].focus();
      }
      // console.log(' ArrowLeft が押されました');
      break;
    case 'ArrowRight':
      if (!islast) {
        elms.value[index + 1].focus();
      }
      // console.log(' ArrowRight が押されました');
      break;
    case 'Delete':
      // console.log(' Delete が押されました');
      state.data[index] = '';
      break;
  }
};

const onFocus = (index: number) => {
  focusState.isActivate = true;
  state.hasFocus[index] = true;
  storeNac.state.uid = uid;
};
const onBlur = (index: number) => {
  state.hasFocus[index] = false;
  focusState.isActivate = false;
};

const pinboxWitdh = computed(() => {
  if (props.len === 0) return '';
  return 'width:' + (100 / props.len).toFixed(6) + '%;';
});

const pinContainerElm = ref(null);
const { height } = useElementSize(pinContainerElm);
const fontSize = computed(() => {
  return Math.max(16, height.value - 20);
});
// ----------------------------------------------------------------------------
</script>
<template>
  <div ref="pinContainerElm" class="pin-container mx-n2">
    <template v-for="(row, index) in state.dummy" :key="index">
      <div class="px-2" :style="pinboxWitdh">
        <div class="aspect-container" :style="`--aspect-rate:140%`">
          <div
            class="pin-box"
            :class="{ ok: state.data[index], hasFocus: state.hasFocus[index] }"
            :style="`font-size:${fontSize}px;`"
          >
            <input
              :ref="(e) => setRef(e)"
              v-model="state.dummy[index]"
              type="text"
              :style="`height:${height}px;font-size:${fontSize}px;`"
              @blur="onBlur(index)"
              @click="dummyClick(index)"
              @focus="onFocus(index)"
              @input="(e) => onInput(index, e)"
              @keydown=" (e: KeyboardEvent) =>keydown(e,index)"
            />
          </div>
        </div>
      </div>
    </template>
    <!-- <div class="dev p-2 mb-10">
      <div class="bg-error">PIN CODE INPUT</div>
      <div class="">props.len:{{ props.len }}</div>
      <div class="">state.data = {{ state.data }}</div>
      <div class="">state.dummy = {{ state.dummy }}</div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.pin-code-input {
  font-size: 1rem;
}
.dev {
  position: fixed;
  inset: auto 0 0 auto;
  background-color: white;
}
.pin-container {
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
}
.pin-box {
  border: solid 2px gray;
  border-radius: 10px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  // アスタリスクとカーソル
  &::before,
  &::after {
    line-height: 1em;
    pointer-events: none;
    font-size: 0.6em;
    position: absolute;
    inset: 0 0 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
  }

  // アスタリスク
  &::before {
    color: #ff8000;
    content: '\2a';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
  }

  // カーソル
  &::after {
    content: '|';
    color: #0d8ee4;
    font-family: 'Prompt', sans-serif;
    font-weight: normal;
  }

  &.ok {
    border: solid 2px #ff8000;

    // アスタリスク
    &::before {
      opacity: 1;
    }
  }
  &.hasFocus {
    border: solid 2px #0d8ee4;
    background-color: rgb(228, 251, 255);
    box-shadow: inset 0px 0px 2px 2px #0d8ee4;
    &.ok::before {
      opacity: 0.4;
    }
    // カーソル
    &::after {
      animation: blink 1000ms infinite; /* 点滅アニメーション呼び出し */
    }
  }
}

input {
  position: absolute;
  inset: 0 0 0 0;
  width: 100%;
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0px;
  outline: none;
  line-height: 1em;
  font-size: inherit;
  text-align: center;
  caret-color: rgb(2, 86, 160);
  caret-color: transparent;
  color: transparent;
}
</style>
