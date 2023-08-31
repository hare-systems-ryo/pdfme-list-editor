<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/form-control.vue
---------------------------------------------------------------------------- */

// [ lib ]
import { GetTextByMultiLang, MultiLang } from '../lib/nac-func';
// [ nac-stroe ]
import { NacStaticLangVfc } from '../nac-static-lang';
import { _useStoreNac } from '../nac-store';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
//   [ Props ]
type Props = {
  // [ InputControl ]
  placeholder?: MultiLang;
  classInput?: string | undefined;
  diff?: boolean;
  // require
  require?: boolean;
  requireText?: MultiLang | undefined;
  // data
  disabled?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
  classInput: '',
  // [ InputControl ]
  placeholder: () => ({ ja: '', en: '' }),
  // require
  require: false,
  requireText: undefined,
  // data
  disabled: false,
});

//   [ emit ]
type Emits = {
  ref: [element: HTMLElement];
};
const emit = defineEmits<Emits>();

//   [ reactive ]
const requireText = computed(() => {
  if (props.requireText === undefined) {
    return GetTextByMultiLang(NacStaticLangVfc.requireText, storeNac.lang);
  }
  return GetTextByMultiLang(props.requireText, storeNac.lang);
});
const placeholder = computed(() => {
  return GetTextByMultiLang(props.placeholder, storeNac.lang);
});
// ----------------------------------------------------------------------------
</script>
<template>
  <div :ref="(e:any) => emit('ref', e)" class="nac-control" :class="{ disabled: props.disabled, diff: props.diff }">
    <div class="nac-c-left">
      <slot name="before-icon"></slot>
    </div>
    <div class="nac-c-center">
      <div v-if="placeholder.length > 0 || props.require == true" class="nac-c-header">
        <div class="nac-c-header-left">
          <div class="nac-c-placeholder">{{ placeholder }}</div>
        </div>
        <div class="nac-c-header-right">
          <slot name="header"></slot>
          <div v-if="props.require == true" data-type="require">{{ requireText }}</div>
        </div>
      </div>
      <div class="nac-c-input" :class="[props.classInput]">
        <slot></slot>
      </div>
    </div>
    <div class="nac-c-right">
      <slot name="after-icon"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import './_fc-variables.scss';
@import './_form-control.scss';
</style>
