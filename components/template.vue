<script setup lang="ts">
/* ----------------------------------------------------------------------------
components\template.vue
 ---------------------------------------------------------------------------- */

// [ node_modules ]
import dayjs from 'dayjs';

// [ vueuse ]
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
// [nac]
import { Sleep, IsMobile } from '@/components/nac/nac-main';
import { TypeTabulator } from '@/components/nac/nac-main';
import { ObjectCompare, ObjectKeys, ObjectCopy } from '@/components/nac/nac-main';
import { ArrayInt, ArrayIntNullable, ArrayString } from '@/components/nac/nac-main';
import { DayjsFormat, DayjsFormatNullable } from '@/components/nac/nac-main';
// [nac > Modals ]
import { ModalControl, InitModalControl, InitModals } from '@/components/nac/nac-main';
// ----------------------------------------------------------------------------
// [ stores ]
const storeApp = useStoreApp();
// [ Nuxt ]
const router = useRouter();
const route = useRoute();
// [nac]
const storeNac = useStoreNac();
const WindowLoader = storeNac.useWindowLoader();
const Toast = storeNac.useToast();
const Dialog = storeNac.useDialog();
const FileSelect = storeNac.useFileSelect();
// ----------------------------------------------------------------------------
// [ Props ]
interface Props {
  isShow: boolean;
  hoge?: string;
  fuge?: { a: string };
  hogehoge?: { a: string }[];
}
const props = withDefaults(defineProps<Props>(), {
  hoge: '',
  fuge: () => ({ a: '' }),
  hogehoge: () => [],
});

// [ emit ]
type Emits = {
  (e: 'close'): void;
  (e: 'update:hoge', value: string): void;
};
const emit = defineEmits<Emits>();
// ----------------------------------------------------------------------------
const instance = getCurrentInstance(); // コンポーネント固有のUIDを取得する
const uid = instance != null ? String(instance.uid) : '';
// ----------------------------------------------------------------------------
interface State {
  hoge: string;
}
const state = reactive<State>({
  hoge: '',
});
// ----------------------------------------------------------------------------
// [ useFocusTrap ]
const focusTrapElm = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(focusTrapElm, { allowOutsideClick: true });
watch(
  () => props.isShow,
  (isShow) => (isShow ? activate() : deactivate())
);

// ----------------------------------------------------------------------------
// [ Modal ]
interface Modal {
  hoge: ModalControl;
}
const modal = reactive<Modal>({
  hoge: InitModalControl(),
});
onMounted(() => {
  InitModals(modal, nextTick);
});
</script>
<template>
  <div ref="focusTrapElm" class="mx-3">
    <div class=""></div>
    <v-overlay v-model="modal.hoge.isShow" :close-on-back="false" :persistent="true">
      <div class="overlay-modal p-0 p-800-3" :style="`height:${storeApp.windowFixedH}`">
        <div class="card">
          <div class="card-header bg-main1">
            modal
            <v-btn variant="outlined" color="white" size="" class="border-2 py-1 px-3" @click="modal.hoge.close()">
              <i class="fa-solid fa-xmark"></i>
              Close
            </v-btn>
          </div>
          <div class="card-body bg-back">body</div>
        </div>
      </div>
    </v-overlay>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
</style>
