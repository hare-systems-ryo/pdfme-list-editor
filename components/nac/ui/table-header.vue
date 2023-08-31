<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/table-header.vue
---------------------------------------------------------------------------- */

// [ vueuse ]
import { useWindowSize } from '@vueuse/core';
// [ nac ]
import { SelectItem } from '../nac-main';
import { MultiLang, GetTextByMultiLang } from '../nac-main';
import { _useStoreNac } from '../nac-store';
import { NacStaticLangTableHeader } from '../nac-static-lang';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
// [nac]
const storeNac = _useStoreNac();
const multiText = computed(() => NacStaticLangTableHeader);
const lang = computed(() => storeNac.lang);
// ----------------------------------------------------------------------------
// [ vueuse ]
const windowSize = useWindowSize();
const windowWidth = windowSize.width;
// [ Props ]
type Props = {
  color?: string;
  title?: MultiLang;
  listOriginCount: number;
  listFilterCount: number;
  sizeList?: number[];
  size?: number;
  pageIndex: number;
  hasHeaderTitle: boolean;
  classSmallSize?: string | string[] | any;
  classNormalSize?: string | string[] | any;
  dataDeviceSmallSize?: string;
  dataDeviceNormalSize?: string;
};
const props = withDefaults(defineProps<Props>(), {
  title: '',
  color: 'main1',
  listOriginCount: 0,
  listFilterCount: 0,
  sizeList: () => [],
  size: 20,
  hasHeaderTitle: true,
  classSmallSize: undefined,
  classNormalSize: undefined,
  dataDeviceSmallSize: '',
  dataDeviceNormalSize: '',
});

const sizeList = computed((): SelectItem[] => {
  if (props.sizeList.length === 0) {
    return [
      { id: 20, text: GetTextByMultiLang(multiText.value.pageUnitSelect, lang.value).replace(/{value}/g, '20') },
      { id: 50, text: GetTextByMultiLang(multiText.value.pageUnitSelect, lang.value).replace(/{value}/g, '50') },
      { id: 100, text: GetTextByMultiLang(multiText.value.pageUnitSelect, lang.value).replace(/{value}/g, '100') },
      { id: 200, text: GetTextByMultiLang(multiText.value.pageUnitSelect, lang.value).replace(/{value}/g, '200') },
    ];
  }
  return props.sizeList.map((value) => {
    return {
      id: value,
      text: GetTextByMultiLang(multiText.value.pageUnitSelect, lang.value).replace(/{value}/g, String(value)),
    };
  });
});
// [ emit ]
type Emits = {
  (e: 'update:size', value: number): void;
  (e: 'update:pageIndex', value: number): void;
  (e: 'pageIndexChange'): void;
};
const emit = defineEmits<Emits>();

const updateSize = (v: number | null) => {
  if (!v) return;
  emit('update:size', v);
};
const isPagePrevious = computed(() => {
  if (props.pageIndex !== 0) return true;
  return false;
});

const isPageNext = computed(() => {
  if (props.pageIndex + 1 < pageMax.value) return true;
  return false;
});

const pageMax = computed(() => {
  if (props.listFilterCount === 0) return 0;
  if (props.size === 0) return 0;
  return Math.ceil(props.listFilterCount / props.size);
});

const indexList = computed(() => {
  if (pageMax.value === 0) {
    return [{ id: 0, text: String(1) }];
  }
  const end = pageMax.value;
  const ret = [];
  for (let i = 0; i < end; i++) {
    ret.push({ id: i, text: String(i + 1) });
  }
  return ret;
});

watch(
  () => [props.listFilterCount, props.pageIndex, pageMax.value],
  () => {
    //
    if (pageMax.value < props.pageIndex + 1) {
      emit('update:pageIndex', 0);
    }
  }
);
const slots = useSlots();
const hasBtnList = computed(() => {
  try {
    const slot = slots['btn-list'];
    // console.log(uid, 'hasBtnList  slot === undefined?', slot === undefined);
    if (slot === undefined) return false;
    // console.log(uid, 'hasBtnList  slot()', slot());
    const nodes = slot().filter(({ type }) => {
      if (typeof type === 'object') return true;
      return type.toString() !== 'Symbol(v-cmt)';
    });
    return nodes.length !== 0;
  } catch (error) {
    console.error('error', error);
    return false;
  }
});
</script>
<template>
  <div class="">
    <!-- Normal Table-header -->
    <div class="" :class="props.classNormalSize" :data-device="props.dataDeviceNormalSize">
      <div class="d-flex align-item-center" style="height: 42px">
        <template v-if="props.hasHeaderTitle">
          <!-- Normal Table-header  Title -->
          <div class="flex-grow-1 flex-shrink-1 d-flex align-items-center" style="height: 42px">
            <div class="ps-2 border bg-white" :class="`border-${props.color}`" style="height: 42px">
              <div class="title-index-left ps-2" :class="`bg-${props.color}`"></div>
              <v-menu v-if="hasBtnList" open-on-hover variant="flat" z-index="9999">
                <template #activator="{ props: p }">
                  <v-btn :color="props.color" variant="text" rounded="0" v-bind="p" class="h-100">
                    <span class="fs-6 text-black">{{ GetTextByMultiLang(props.title, lang) }}</span>
                    <i class="ms-2 fa-solid fa-caret-down text-accent1 fs-6"></i>
                  </v-btn>
                </template>
                <slot name="btn-list"></slot>
              </v-menu>
              <div v-else class="h-100 px-4 d-flex align-items-center">{{ GetTextByMultiLang(props.title, lang) }}</div>
            </div>
            <div class="d-flex"><slot name="default"></slot></div>
          </div>
        </template>
        <!-- Normal Table-header  Pagination -->
        <div class="flex-grow-0 flex-shrink-1 ms-auto d-flex align-items-center">
          <div class="mx-1">
            <div class="fs-8 lh-1 pb-1">
              {{ GetTextByMultiLang(multiText.resultDisplay, lang) }}
              {{
                props.listFilterCount === props.listOriginCount
                  ? ''
                  : GetTextByMultiLang(multiText.resultDisplayFilter, lang)
              }}
            </div>
            <div class="text-end fs-7 lh-1">
              <template v-if="props.listFilterCount !== props.listOriginCount">
                {{ props.listOriginCount }}{{ GetTextByMultiLang(multiText.displayCountUnit, lang) }}
                <i :class="`fas fa-angle-double-right`"></i>
              </template>
              {{ props.listFilterCount }}{{ GetTextByMultiLang(multiText.displayCountUnit, lang) }}
            </div>
          </div>
          <nac-fc-select
            :data="props.size"
            :placeholder="multiText.displayCount"
            :nullable="false"
            :list="sizeList"
            :max-height="400"
            @update:data="(v) => updateSize(v)"
          />
          <div class="d-flex align-items-center" style="height: 42px">
            <v-pagination
              :model-value="props.pageIndex + 1"
              :length="pageMax"
              total-visible="0"
              size="42"
              rounded="2"
              variant="flat"
              color="accent2"
              :border="`1px gray solid`"
              :disabled="false"
              active-color="main"
              class="pagination"
              @update:model-value="(v:any) => emit('update:pageIndex', v-1)"
            ></v-pagination>
          </div>
          <!-- Normal Table-header  Info -->
          <span class="mx-1 lh-1">
            {{ GetTextByMultiLang(multiText.sumPage, lang).replace(/{value}/g, String(pageMax)) }}
          </span>
        </div>
      </div>
    </div>
    <!-- ---------------------------------------- -->
    <!-- ---------------------------------------- -->
    <!-- Small Table-header  Title -->
    <div class="" :class="props.classSmallSize" :data-device="props.dataDeviceSmallSize">
      <template v-if="props.hasHeaderTitle">
        <div class="d-flex flex-wrap my-2">
          <div class="flex-grow-1 px-2 border bg-white" :class="`border-${props.color}`" style="height: 42px">
            <div class="title-index-left ps-2" :class="`bg-${props.color}`"></div>
            <div class="title-index-right pe-2" :class="`bg-${props.color}`"></div>
            <v-menu v-if="hasBtnList" variant="flat">
              <template #activator="{ props: p }">
                <v-btn :color="props.color" variant="text" rounded="0" v-bind="p" class="w-100 h-100">
                  <span class="fs-6 text-black">
                    {{ GetTextByMultiLang(props.title, lang) }}
                    <i class="ms-1 fa-solid fa-caret-down text-accent1 fs-6"> </i>
                  </span>
                </v-btn>
              </template>
              <slot name="btn-list"></slot>
            </v-menu>
            <div v-else class="h-100 px-4 d-flex align-items-center">{{ props.title }}</div>
          </div>
          <div class="">
            <slot name="default"></slot>
          </div>
        </div>
      </template>
      <!-- Small Table-header  Pagination -->
      <div class="d-flex justify-content-between pagination-sp">
        <div class="left-btn bg-white radius-1">
          <v-btn
            variant="outlined"
            color="accent1"
            class="border border-accent1 w-100"
            :disabled="!isPagePrevious"
            @click="
              emit('update:pageIndex', props.pageIndex - 1);
              emit('pageIndexChange');
            "
          >
            <i class="fas fa-caret-left" :class="`me-1`"></i>前ページ
          </v-btn>
        </div>

        <div
          class="center-select px-2 bg-white border border-main1 d-flex justify-content-center align-items-center fw-bold text-main1"
        >
          {{ props.pageIndex + 1 }}
        </div>
        <div class="right-btn bg-white radius-1">
          <v-btn
            variant="outlined"
            color="accent1"
            class="border border-accent1 w-100"
            :disabled="!isPageNext"
            @click="
              emit('update:pageIndex', props.pageIndex + 1);
              emit('pageIndexChange');
            "
          >
            次ページ<i class="fas fa-angle-right"></i>
          </v-btn>
        </div>
      </div>
      <!-- Small Table-header  Info -->
      <div class="d-flex flex-wrap justify-content-between mt-1">
        <div>
          <span class="me-3">検索結果{{ props.listOriginCount === props.listFilterCount ? '' : '(絞り込み)' }}</span>
          <template v-if="props.listOriginCount !== props.listFilterCount">
            {{ props.listOriginCount }}件 <i class="fas fa-angle-double-right"></i>
          </template>
          <span class="mx-1"> {{ props.listFilterCount }}件</span>
        </div>
        <div class="ms-1">合計 {{ pageMax }}ページ</div>
      </div>
      <!-- -------------------------------------------------------- -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title-index-left {
  position: absolute;
  inset: 0px auto 0px 0px;
}

.title-index-right {
  position: absolute;
  inset: 0px 0px 0px auto;
}

.pagination-sp {
  .left-btn {
    width: calc(50% - 2em);
    flex: 0 0 auto;
    height: 42px;
  }
  .center-select {
    width: 3.5em;
    flex: 0 0 auto;
    height: 42px;
  }
  .right-btn {
    width: calc(50% - 2em);
    flex: 0 0 auto;
    height: 42px;
  }
}

.pagination :deep(.v-btn) {
  border: solid 1px gray;
}

.pagination {
  :deep(.v-pagination__list) {
    margin: 0;
    padding: 0;
  }
  :deep(.v-pagination__item--is-active) {
    pointer-events: none;
  }
}

// --------------------------------------------------------------------
// --------------------------------------------------------------------
// --------------------------------------------------------------------
// --------------------------------------------------------------------

//---------------------------
</style>
