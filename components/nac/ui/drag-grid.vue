<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/drag-grid
// ----------------------------------------------------------------------------

使用方法 注意

---------------------------------------------------------------------------- */
// [ node_modules ]
// [ vueuse ]
import { useWindowSize } from '@vueuse/core';
// [ nac ]
import { _useStoreNac } from '../nac-store';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
// [nac]
const storeNac = _useStoreNac();
const WindowLoader = storeNac.useWindowLoader();
// const Toast = storeNac.useToast();
// const Dialog = storeNac.useDialog();
// const FileSelect = storeNac.useFileSelect();
// const multiText = computed(() => NacStaticLang.NacFcTableHeader);
// const lang = computed(() => storeNac.lang);
// ----------------------------------------------------------------------------
// [ vueuse ]
// [ Props ]
interface ListRow<T = any> {
  id: number;
  order: number;
  visible?: boolean;
  data: T;
}
type Props = {
  list: ListRow<any>[];
  class?: string | string[] | any;
  classCol?: string | string[] | any;
  classCell?: string | string[] | any;
  style?: any;
  styleCol?: any;
  styleCell?: any;
};
const props = withDefaults(defineProps<Props>(), {
  class: '',
  classCol: '',
  classCell: '',
  style: '',
  styleCol: '',
  styleCell: '',
});
// [ emit ]
type ChangeOrderParam = {
  a: {
    id: number;
    order: number;
  };
  b: {
    id: number;
    order: number;
  };
};
type Emits = {
  (name: 'changeOrder', payload: ChangeOrderParam): void;
};
const emit = defineEmits<Emits>();
// [ reactive ]
interface State {
  list: {
    id: number;
    order: number;
    visible: boolean;
    data: any;
  }[];
  start: {
    id: number | null;
    order: number | null;
  };
  move: {
    id: number | null;
    order: number | null;
  };
}
const state = reactive<State>({
  list: [],
  start: {
    id: null,
    order: null,
  },
  move: {
    id: null,
    order: null,
  },
});

// [ getCurrentInstance ]
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';

// [ computed ]--------------------------------------------------------------------
// [ watch ]-----------------------------------------------------------------------

const idList = computed(() => {
  // console.log('computed idList');
  return props.list.map((row) => row.id);
});

const itemList = computed(() => {
  // console.log('computed itemList');
  return props.list.reduce(
    (ret: { [key: number]: { id: number; order: number; visible: boolean; data: any } }, row) => {
      ret[row.id] = {
        id: row.id,
        order: row.order,
        visible: row.visible === true,
        data: row,
      };
      return ret;
    },
    {}
  );
});

watch(
  () => [...props.list],
  () => {
    //
    setList();
  },
  { deep: true }
);
// [ methods ]---------------------------------------------------------------------
const setList = () => {
  state.list = props.list
    .map((row) => {
      return {
        id: row.id,
        order: row.order,
        visible: row.visible === true,
        data: row,
      };
    })
    .sort((a, b) => {
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });
};
const dragstart = (event: any, id: number) => {
  // console.log('dragstart', id);
  const elm = event.target as HTMLElement;
  try {
    if (elm.classList.contains(`drag-grid-uid-${uid}`) === false) return;
    state.start.id = id;
    state.start.order = itemList.value[id].order;
    event.dataTransfer.effectAllowed = 'move';
  } catch (error) {
    console.error('dragstart', error);
  }
};

const dragenter = (event: any, id: number) => {
  // console.log('dragenter', id);
  try {
    if (state.start.order === null) return;
    if (state.move.id === id && state.move.order === itemList.value[id].order) return;
    state.move.id = itemList.value[id].id;
    state.move.order = itemList.value[id].order;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  } catch (error) {
    console.error('dragstart', error);
  }
};

const dragend = (event: any, id: number) => {
  // console.log('dragend', id);
  // 実行時間を計測した処理
  try {
    if (
      state.start.order != null &&
      state.move.order != null &&
      state.start.order !== state.move.order &&
      state.move.id !== null &&
      state.start.id !== null
    ) {
      const ChangeOrderParam = {
        a: {
          id: state.start.id,
          order: state.move.order,
        },
        b: {
          id: state.move.id,
          order: state.start.order,
        },
      };
      emit('changeOrder', ChangeOrderParam);
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.start.id = null;
    state.start.order = null;
    state.move.id = null;
    state.move.order = null;
  }
};
setList();
</script>
<template>
  <div class="nac-ui-drag-grid" :class="[props.class]" :style="props.style">
    未調整
    <!-- <div v-if="$slots.fixBefore" class="drag-grid-col" :class="[props.classCol]" :style="props.styleCol">
      <div class="grid-cell" :class="[props.classCell]" :style="props.styleCell">
        <slot name="fixBefore"></slot>
      </div>
    </div>
    <template v-for="(id, index) in idList" :key="index">
      <div
        v-if="itemList[id].visible !== false"
        class="drag-grid-col"
        :class="[props.classCol]"
        :style="props.styleCol"
      >
        <div
          class="drag-grid-cell"
          draggable="true"
          :class="[
            props.classCell,
            `drag-grid-uid-${uid}`,
            {
              isHover: state.move.id != null && id === state.move.id && id !== state.start.id,
              isActivate: state.start.id != null && id === state.start.id,
            },
          ]"
          :style="props.styleCell"
          @dragstart="(e) => dragstart(e, id)"
          @dragenter="(e) => dragenter(e, id)"
          @dragend="(e) => dragend(e, id)"
        >
          <slot :row="itemList[id].data"> </slot>
        </div>
      </div>
    </template>
    <div v-if="$slots.fixAfter" class="drag-grid-col" :class="[props.classCol]" :style="props.styleCol">
      <div class="grid-cell" :class="[props.classCell]" :style="props.styleCell">
        <slot name="fixAfter"></slot>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.nac-ui-drag-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.grid-cell {
  cursor: grab;
  &.isHover {
    will-change: box-shadow;
    box-shadow: 0px 0px 5px 2px rgb(184, 57, 6);
  }

  &.isActivate::after {
    content: '';
    position: absolute;
    opacity: 0.3;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgb(151, 149, 148);
  }
}
</style>
