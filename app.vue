<script setup lang="ts">
import { Sleep } from '@/components/nac/nac-main';
// ---------------------------------------------------
useHead({
  htmlAttrs: { lang: () => 'ja', prefix: 'og: http://ogp.me/ns#' },
  meta: [
    { 'http-equiv': 'refresh', content: '' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0,maximum-scale=1.0' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'theme-color', content: '#FFF' },
    { hid: 'robots', name: 'robots', content: 'noindex' },
  ],
  noscript: [{ children: 'JavaScript is required' }],
  bodyAttrs: { class: () => 'lang-ja' },
});
// ---------------------------------------------------
const storeApp = useStoreApp();
const { public: config } = useRuntimeConfig();
const isHide = ref(false);
watch(
  () => storeApp.state.isReady,
  async (isReady) => {
    if (isReady) {
      // 全体のローディングを停止する
      await Sleep(100);
      isHide.value = true;
    }
  }
);
const fixed = computed(() => ({ height: storeApp.windowFixedH }));
onMounted(async () => {
  await Sleep(0);
  storeApp.init();
  console.log(`${config.app.packageName} [${config.app.version}]`);
});
</script>
<template>
  <div class="">
    <NuxtPage />
    <NacUiDialog />
    <Teleport to="body">
      <div v-if="!isHide" class="base-cover" :class="{ isReady: storeApp.state.isReady }" :style="fixed">
        <span class="loader"></span>
      </div>
      <NacUiWindowLoader />
      <NacUiToast />
      <NacUiFileSelect />
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.base-cover {
  position: fixed;
  inset: 0;
  background-color: rgb(0, 0, 0);
  z-index: 9999;
  transition: opacity 400ms;
  will-change: opacity;
  pointer-events: all;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  &.isReady {
    opacity: 0;
    pointer-events: none;
  }
}

.loader {
  max-width: 300px;
  width: calc(100% - 20px);
  height: 5px;
  display: inline-block;
  position: relative;
  background: rgba(66, 57, 130, 0.598);
  overflow: hidden;
  &::after {
    content: '';
    width: 40%;
    height: 20px;
    background: #fff;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    animation: base-loader 800ms linear infinite;
  }
}
</style>
