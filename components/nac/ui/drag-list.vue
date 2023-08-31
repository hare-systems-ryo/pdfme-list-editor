<script setup lang="ts" generic="T">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/drag-list
---------------------------------------------------------------------------- */

// [ nac ]
import { Int } from '../nac-main';
import { DragList } from '../nac-main';

// ----------------------------------------------------------------------------
// [ Slots ]
defineSlots<{
  fixBefore?: (props: {}) => any;
  default?: (props: { row: T }) => any;
  fixAfter?: (props: {}) => any;
}>();

// [ Props ]
type Props = {
  list: DragList.ListRow<T>[];
  class?: string | string[] | any;
  classRow?: string | string[] | any;
  style?: any;
  styleRow?: any;
  disabled?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
  class: '',
  classRow: '',
  style: '',
  styleRow: '',
  disabled: false,
});
// [ emit ]
type Emits = {
  'change-order': [payload: DragList.ChangeOrderData<T>];
};
const emit = defineEmits<Emits>();
// [ reactive ]
interface Pos {
  x: number; // 基本的に使わない
  y: number;
}
interface State {
  move: {
    // ドラッグ対象要素のデータ
    objeData: DragList.ListRow<any> | null;
    // ドラッグ対象要素の中央座標からカーソルまでの距離
    // ドラッグ開始時に計測する
    // centrumOffset: Pos;
    index: number | null;
    // order: number | null;
  };
  target: {
    // 並べ替えの影響を受ける要素
    objeData: DragList.ListRow<any> | null;
  };
}
const state = reactive<State>({
  move: {
    objeData: null,
    index: null,
    // order: null,
  },
  target: {
    objeData: null,
  },
});

watch(
  () => props.list,
  () => {
    // indexが0からの連番になっているかの確認
    props.list.forEach((row, index) => {
      if (row.index !== index) {
        console.error('DragListコンポーネントのListプロパティ[index]がゼロ始まりのList Indexルールを外れています。');
      }
    });
  }
);

const emlList = ref<Element[]>([]);
onBeforeUpdate(() => {
  emlList.value.length = 0;
});

const dragstart = (event: any, row: DragList.ListRow) => {
  if (props.disabled) return;
  const elm = event.target as HTMLElement;
  try {
    if (elm.classList.contains('drag-list-item') === false) return;
    // console.log('dragstart');
    state.move.objeData = row;
    state.target.objeData = row;
    state.move.index = row.index;
    // state.move.order = row.order;

    event.dataTransfer.effectAllowed = 'move';
  } catch (error) {
    console.error('dragstart', error);
  }
};
const dragover = (event: any, row: DragList.ListRow<T>) => {
  if (props.disabled) return;
  try {
    if (state.move.objeData === null) return;
    // ドラッグ対象にドラッグしている場合無視
    if (state.move.objeData.index === row.index) {
      // state.target.objeData = row;
      // state.move.index = state.move.objeData.index;
      return;
    }
    // ----------------------
    const elm = emlList.value[row.index];
    const rect = elm.getBoundingClientRect();
    // ドラッグ対象の中央座標
    // const targetCentrumX = rect.x + rect.width / 2;
    const targetCentrumY = rect.y + rect.height / 2;
    // Pointer位置
    // const pointerX = Int(event.clientX);
    const pointerY = Int(event.clientY);
    // --------------------------------
    // dev用要素
    // dev.nowCursor.y = pointerY;
    // dev.nowCursor.x = pointerX;
    // dev.targetCentram.y = targetCentrumY;
    // dev.targetCentram.x = targetCentrumX;
    const mData = state.move.objeData;
    const tData = row;
    if (mData.index > tData.index) {
      // 上方向に移動
      if (pointerY < targetCentrumY) {
        // console.log('上方向に移動 targetの上', tData.index);
        state.move.index = row.index - 0.5;
        state.target.objeData = row;
      } else if (mData.index - tData.index !== 1) {
        // console.log('上方向に移動 targetの下', tData.index);
        state.move.index = row.index + 0.5;
        state.target.objeData = props.list[row.index + 1];
      } else {
        // console.log('上方向に移動 targetの下 自分の場所に戻る', tData.index);
        state.move.index = state.move.objeData.index;
        state.target.objeData = row;
      }
    } else if (mData.index < tData.index) {
      // ↓方向に移動
      if (targetCentrumY < pointerY) {
        // console.log('↓方向に移動 target > down', tData.index);
        state.move.index = row.index + 0.5;
        state.target.objeData = row;
      } else if (tData.index - mData.index !== 1) {
        // console.log('↓方向に移動 target  up ', tData.index);
        state.move.index = row.index - 0.5;
        state.target.objeData = props.list[row.index - 1];
      } else {
        // console.log('↓方向に移動 target up   > back my place', tData.index);
        state.move.index = state.move.objeData.index;
        state.target.objeData = row;
      }
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  } catch (error) {
    console.error('dragstart', error);
  }
};

const dragend = (event: any, row: DragList.ListRow<T>) => {
  if (props.disabled) return;
  if (state.move.objeData === null) return;
  if (state.target.objeData === null) return;
  if (state.move.objeData.index === state.target.objeData.index) return;
  try {
    emit('change-order', { from: state.move.objeData.data, to: state.target.objeData.data });
  } catch (error) {
    console.error('dragend', error);
  } finally {
    state.move.index = null;
    state.move.objeData = null;
    state.target.objeData = null;
  }
};
// setList();
</script>
<template>
  <div class="drag-list d-flex flex-column" :class="[props.class]">
    <div
      v-if="$slots.fixBefore"
      class="drag-list-item fix d-flex align-items-center border border-dark"
      :class="[props.classRow]"
    >
      <div class="flex-grow-1 flex-shrink-1 slot-parent">
        <slot name="fixBefore"></slot>
      </div>
      <div class="drag-icon d-flex-cc h-100">
        <i class="fa-solid fa-lock text-error"></i>
      </div>
    </div>
    <template v-for="(row, index) in props.list" :key="index">
      <div
        :ref="(e :any) => emlList.push(e)"
        class="drag-list-item d-flex align-items-center border border-dark"
        draggable="true"
        :class="[props.classRow, { active: state.move.objeData?.index === row.index }]"
        @dragstart.stop="(e) => dragstart(e, row)"
        @dragover.stop="(e) => dragover(e, row)"
        @dragend.stop="(e) => dragend(e, row)"
      >
        <div class="flex-grow-1 flex-shrink-1 slot-parent">
          <slot name="default" :row="row.data"></slot>
        </div>
        <div
          class="drag-icon d-flex-cc h-100 text-accent1 fs-4"
          :class="{ 'text-dark': props.disabled, 'cursor-default': props.disabled }"
        >
          <i class="fa-solid fa-grip-lines"></i>
        </div>
        <template v-if="state.move.index">
          <div
            v-if="row.index === state.move.index + 0.5"
            class="drag-divider top"
            :class="{ edge: row.index === 0 }"
          ></div>
          <div
            v-if="row.index === state.move.index - 0.5"
            class="drag-divider bottom"
            :class="{ edge: row.index + 1 === props.list.length }"
          ></div>
        </template>
      </div>
    </template>
    <div
      v-if="$slots.fixAfter"
      class="drag-list-item fix d-flex align-items-center border border-dark"
      :class="[props.classRow]"
    >
      <div class="flex-grow-1 flex-shrink-1 slot-parent">
        <slot name="fixAfter"></slot>
      </div>
      <div class="drag-icon d-flex-cc h-100">
        <i class="fa-solid fa-lock text-error"></i>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.drag-list {
  transition: all 200ms;
}
.disabled {
  background-color: gray;
}

.drag-list-item {
  transition: all 200ms;
  // padding-right: 2em;
  margin-top: -1px;

  background-color: rgb(167, 0, 0);

  &.active::before {
    content: '';
    position: absolute;
    inset: 0 0 0 0;
    background-color: rgba(2, 0, 113, 0.224) !important;
  }
  &.fix {
    pointer-events: none;
    &::before {
      content: '';
      position: absolute;
      inset: 0 0 0 0;
    }
  }
}

.drag-icon {
  position: absolute;
  right: 0;
  top: 0;
  width: 36px;
  cursor: grab;
  &.disabled {
    cursor: default;
  }
}
.drag-list-item:deep(.slot-parent > *) {
  // padding:36px;
  padding-right: 36px;
}
.drag-divider {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  // height: 40px;
  background-color: #eb6600;
  opacity: 1;
  pointer-events: none;
  filter: blur(1px);
  // safari対策
  transform: translateZ(0);
  margin-top: -1px;
  transition: all 200ms;
  // background-color: red;

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;
  }

  &.edge {
    height: 3px;
  }
}
</style>
