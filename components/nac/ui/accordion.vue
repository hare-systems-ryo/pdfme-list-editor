<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/accordion.vue
---------------------------------------------------------------------------- */

// [ nac ]
// [ nac-func ]
import { Sleep } from '../lib/nac-func';
// ----------------------------------------------------------------------------
// [ Props ]
type Props = {
  isShow: boolean;
  // control?: typeof AccordionControl;
  span?: number;
};
const props = withDefaults(defineProps<Props>(), {
  isShow: false,
  control: undefined,
  span: 300,
});
// [ emit ]
type Emits = {
  closed: [];
};
const emit = defineEmits<Emits>();
// [ reactive ]
const elmAccordion = ref<HTMLElement>();
const state = reactive({
  height: props.isShow === true ? 'auto' : '0px',
  visibled: false,
  opacity: props.isShow === true ? '1' : '0',
  isResize: false,
  overflow: props.isShow === true ? 'visible' : 'hidden !important',
  wait: 0,
});
// ----------------------------------------------------------------------------
const accordionStyle = computed(() => {
  return {
    height: state.height,
    transition: `height ${props.span}ms`,
    opacity: state.opacity === '' ? '0' : state.opacity,
    overflow: state.overflow,
  };
});
watch(
  () => props.isShow,
  () => {
    const isShow = props.isShow;
    setTimeout(() => {
      if (isShow === props.isShow) resize();
    }, 10);
  }
);
// ----------------------------------------------------------------------------
const resize = async () => {
  // console.log('resize', props.isShow);
  if (state.isResize) {
    // リサイズ中は待機処理
    state.wait++;
    return;
  }

  try {
    state.isResize = true;

    if (props.isShow === true) {
      state.visibled = true;
      await Sleep(10);
      state.opacity = '1';
      await nextTick();
      if (elmAccordion.value) {
        const height = elmAccordion.value.getBoundingClientRect().height;
        state.height = height + 'px';
      }
      await Sleep(props.span);
      state.height = 'auto';
      state.overflow = 'visible';
    } else {
      state.overflow = 'hidden !important';
      await nextTick();
      if (elmAccordion.value) {
        state.height = String(elmAccordion.value.clientHeight) + 'px';
      }
      await nextTick();
      await Sleep(10);
      state.height = '0px';
      await Sleep(props.span);
      state.opacity = '0';
      await Sleep(10);
      state.visibled = false;
      emit('closed');
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.isResize = false;
    if (state.wait !== 0) {
      state.wait = 0;
      resize();
    }
  }
};

onMounted(() => {
  if (props.isShow === true) resize();
});
// ----------------------------------------------------------------------------
</script>
<template>
  <div v-if="state.visibled" class="nac-accordion" :style="accordionStyle">
    <div ref="elmAccordion" class="nac-accordion-container">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nac-accordion {
  position: relative;
  width: 100%;
  transition: height 300ms;
  will-change: height;
  padding: 0 !important;

  .nac-accordion-container {
    position: relative;
    width: 100%;
    height: auto;
    overflow: visible;
  }
}
.dev {
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: white;
}
</style>
