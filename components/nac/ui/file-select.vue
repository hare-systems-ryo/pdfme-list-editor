<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/file-select.vue
---------------------------------------------------------------------------- */

// [ vueuse ]
import { useEventListener, Fn } from '@vueuse/core';
// [ nac-stroe ]
import { _useStoreNac } from '../nac-store';
import { Sleep } from '../nac-main';
// ----------------------------------------------------------------------------
// [ nac-stroe ]
const storeNac = _useStoreNac();
// ----------------------------------------------------------------------------
const storeState = storeNac.fileSelect.state;
// ----------------------------------------------------------------------------
const Toast = storeNac.useToast();

// [ reactive ]
const elmFileSelect = ref<HTMLInputElement>();
interface State {
  pending: boolean;
}
const state = reactive<State>({
  pending: false,
});

// ----------------------------------------------------------------------------
const activeItem = computed(() => {
  if (storeState.pendingList.length !== 0) {
    return storeState.pendingList[0];
  } else {
    return null;
  }
});

const activateTs = computed(() => {
  if (activeItem.value !== null) {
    return activeItem.value.ts;
  } else {
    return null;
  }
});

watch(activateTs, async (value) => {
  if (value === null) return;
  await nextTick();
  fileSelect();
});

let cleanupEvent: Fn | null = null;

const checkCleanupEvent = () => {
  if (cleanupEvent !== null) {
    cleanupEvent();
    cleanupEvent = null;
  }
};
const fileSelect = () => {
  // console.log(`fileSelect`);
  if (activeItem.value === null || activeItem.value.ts.length === 0) {
    Toast.Error('不明なエラーが発生しました。', 'File Select Error');
    return;
  }
  try {
    // inputタグにAcceptなど設定が反映されるまで待機する
    // console.log('fileSelect', storeState);
    if (elmFileSelect.value === undefined) {
      return activeItem.value.data.error('File Select Error : System Error!');
    }
    state.pending = true;
    elmFileSelect.value.value = '';
    setTimeout(() => {
      checkCleanupEvent();
      cleanupEvent = useEventListener(window, 'focus', async (e) => {
        checkCleanupEvent();
        await Sleep(1000);
        // console.log(`fileSelectDialogLostFocus`);
        if (!state.pending) return;
        if (activeItem.value === null) return;
        state.pending = false;
        return activeItem.value.data.completed(null);
      });
    }, 500);
    elmFileSelect.value.click();
  } catch (error) {
    console.error('fileSelect', error);
    Toast.Error('エラーが発生しました。\n' + String(error), '画像選択');
    state.pending = false;
    activeItem.value.data.error(String(error));
    checkCleanupEvent();
  }
};

// [ methods ]---------------------------------------------------------------------
/**
 * ファイルが選択されたときの処理
 */
const fileChange = (e: any) => {
  // console.log(`fileChange   activeItem:`, activeItem.value);
  state.pending = false;
  if (activeItem.value === null) {
    Toast.Error('不明なエラーが発生しました。', 'File Select Error');
    return;
  }
  try {
    const extRegExpList = activeItem.value.data.option.extRegExpList;
    const fileList: File[] = e.target.files;
    if (fileList == null) {
      // console.log(`fileList:null`);
      return activeItem.value.data.completed(null);
    }
    const fileCount = fileList.length;
    // console.log(`fileCount:${fileCount}`, { fileList });
    if (fileCount === 0) {
      return activeItem.value.data.completed(null);
    }
    // 拡張子チェック
    if (extRegExpList.length !== 0) {
      let hasFileNameError = false;
      const errorFileName: string[] = [];
      Array.from(fileList).forEach((file) => {
        let fileNameOk = false;
        extRegExpList.forEach((reg) => {
          // console.log(`test`, file.name, reg, reg.test(file.name));
          if (reg.test(file.name)) {
            fileNameOk = true;
          }
        });
        if (!fileNameOk) {
          hasFileNameError = true;
          errorFileName.push(file.name);
        }
      });
      if (hasFileNameError) {
        Toast.Error(
          `認められていない拡張子のファイルが選択されました。\nファイル名 : ${errorFileName.join(',')}`,
          '画像選択',
          2500
        );
        return activeItem.value.data.completed(null);
      }
    }
    return activeItem.value.data.completed(fileList);
  } catch (error) {
    Toast.Error('エラーが発生しました。\n' + String(error), '画像選択', 2500);
    state.pending = false;
    return activeItem.value.data.error(String(error));
  }
};

onUnmounted(() => {
  checkCleanupEvent();
});
</script>
<template>
  <ClientOnly>
    <input
      v-if="activeItem !== null"
      ref="elmFileSelect"
      type="file"
      class="file-elm-hidden"
      :accept="activeItem.data.option.fileAcceptList.join(',')"
      :multiple="activeItem.data.option.multiple"
      @change="(e) => fileChange(e)"
    />
  </ClientOnly>
</template>
<style lang="scss" scoped>
.file-elm-hidden {
  position: fixed;
  inset: -100% 0 0 0;
  opacity: 0;
  pointer-events: none;
}
</style>
