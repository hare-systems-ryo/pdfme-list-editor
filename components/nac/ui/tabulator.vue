<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/tabulator.vue
// ----------------------------------------------------------------------------

使用方法 注意
必ず<ClientOnly>で挟むこと

<template>
  <ClientOnly>
    <NacUiTabulator :columns="tableColumns()" :rows="tableData" />
  </ClientOnly>
</template>
---------------------------------------------------------------------------- */

// [ node_modules ]
import { TabulatorFull as Tabulator } from 'tabulator-tables';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { TypeTabulator } from '../type/type-tabulator';
// [nac]
const storeNac = _useStoreNac();

// ----------------------------------------------------------------------------
// [ Props ]
type Props = {
  columns: any[];
  rows: any[];
  rowCountHeight?: number;
  option?: any;
};
const props = withDefaults(defineProps<Props>(), {
  rowCountHeight: 0,
  option: () => TypeTabulator.Option(),
});
// [ emit ]
type Emits = {
  'row-click': [data: any];
  'row-dbl-click': [data: any];
  init: [flag: boolean];
  tabulator: [tabulator: any];
  'table-rebuild': [func: () => void];
  'table-redraw': [func: () => void];
  'table-refresh': [func: () => void];
};
const emit = defineEmits<Emits>();
// [ reactive ]
const table = ref<HTMLElement | null>(null); // reference to your table element
const tabulator = ref<any>(null); // variable to hold your table

const data = computed(() => {
  return [...props.rows];
});

watch(
  () => props.rows,
  () => {
    if (tabulator.value !== null) {
      tabulator.value.replaceData(data.value as any);
    }
  },
  { deep: true }
);

watch(
  () => storeNac.lang,
  () => {
    // console.log('watch  > prop.lang', tabulator.value);
    tabulator.value.setLocale(storeNac.lang);
    // console.log('watch  > prop.lang', tabulator.value.redraw);
    tabulator.value.redraw(true);
  }
);

// [▼ 初期化 ▼]
Tabulator.extendModule('localize', 'langs', TypeTabulator.Option().langs);
const isInit = ref(false);

watch(isInit, (value) => {
  // console.log('table isinit', value);
  emit('init', value);
});

watch(
  () => props.columns,
  (value) => {
    tabulator.value.setColumns(props.columns);
  }
);

const initTabulator = () => {
  // console.log('inittable');
  if (table.value === null) return;
  let height = 0;
  if (props.rowCountHeight !== 0) {
    height = props.rowCountHeight * 39 + 85 + 2;
  }
  const option = props.option;
  option.height = height === 0 ? '' : height;
  option.columns = props.columns;
  option.data = data.value;
  option.reactiveData = false;
  tabulator.value = new Tabulator(table.value, option);
  tabulator.value.on('rowClick', (e: any, row: any) => {
    emit('row-click', row._row.data);
    e.stopPropagation();
  });
  tabulator.value.on('rowDblClick', (e: any, row: any) => {
    emit('row-dbl-click', row._row.data);
    e.stopPropagation();
  });
  tabulator.value.on('tableBuilding', () => (isInit.value = false));
  tabulator.value.on('tableBuilt', () => (isInit.value = true));
  tabulator.value.on('tableDestroyed', () => (isInit.value = false));

  // 親コントロールへtableを伝達
  emit('tabulator', tabulator.value);
  /**
   * 意図的にテーブルを再描画する
   */
  const reBuild = () => {
    if (tabulator.value === null || isInit.value === false) return;
    tabulator.value.destroy();
    tabulator.value = null;
    initTabulator();
  };

  // 上部emit宣言で使用方法記述
  emit('table-rebuild', reBuild);

  /**
   * 意図的にテーブルを再描画する
   */
  const redraw = () => {
    if (tabulator.value === null || isInit.value === false) return;
    tabulator.value.redraw(true);
  };
  // 上部emit宣言で使用方法記述
  emit('table-redraw', redraw);

  /**
   * 意図的にテーブルデータをリフレッシュする
   */
  const refresh = async () => {
    if (tabulator.value === null || isInit.value === false) return;
    await tabulator.value.replaceData(data.value as any);
  };
  // 上部emit宣言で使用方法記述
  emit('table-refresh', refresh);
};

onMounted(() => {
  initTabulator();
});
onUnmounted(() => {
  tabulator.value.destroy();
  tabulator.value = null;
});

// ----------------------------------------------------------------------------
</script>
<template>
  <div ref="table"></div>
</template>
<style lang="scss" scoped></style>
