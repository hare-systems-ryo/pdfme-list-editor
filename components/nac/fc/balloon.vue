<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/fc/balloon.ts
---------------------------------------------------------------------------- */

// [ vueuse ]
import { useWindowSize } from '@vueuse/core';
// ----------------------------------------------------------------------------
// [ Props ]
type Props = {
  isShow?: boolean;
  baloonText?: string;
  withHover?: boolean;
  color?: string;
};
const props = withDefaults(defineProps<Props>(), {
  baloonText: 'Click!',
  withHover: false,
  color: undefined,
});
// [ reactive ]
const { width } = useWindowSize();
const balloonBaseElm = ref<HTMLElement | null>(null);
const balloonBodyElm = ref<HTMLElement | null>(null);
const shiftX = ref<number>(0);
const textLen = computed(() => {
  return props.baloonText.length;
});

watch(
  () => [props.isShow, textLen.value],
  () => {
    checkPos();
  }
);
const checkPos = async () => {
  // console.log('props.isShowBaloon', props.isShowBaloon);
  shiftX.value = 0;
  if (!props.isShow) return;
  if (balloonBaseElm.value === null) return;
  if (balloonBodyElm.value === null) return;
  await nextTick();
  const baseRect = balloonBaseElm.value.getBoundingClientRect();
  const bodyRect = balloonBodyElm.value.getBoundingClientRect();
  const baseRectCenterLeft = baseRect.x + baseRect.width / 2;
  const bodyRectHarfWidth = bodyRect.width / 2;
  const adjust = 14;
  // 左端がはみ出している場合
  if (baseRectCenterLeft < bodyRectHarfWidth + adjust) {
    const slideRight = bodyRectHarfWidth - baseRectCenterLeft + adjust;
    shiftX.value = Math.floor(slideRight);
    return;
  }
  // 右端がはみ出している場合
  const slideLeft = width.value - (baseRectCenterLeft + bodyRectHarfWidth + adjust);
  if (slideLeft < 0) {
    shiftX.value = Math.floor(slideLeft);
  }

  //
};

const balloonBodyClass = computed(() => {
  if (props.color === undefined) return ['bg-accent1', 'border-accent1'];
  return [`bg-${props.color}`, `border-${props.color}`];
});

const balloonArrowClass = computed(() => {
  if (props.color === undefined) return ['text-accent1'];
  return [`text-${props.color}`];
});

const balloonBodyStyley = computed(() => {
  if (shiftX.value === 0) return {};
  const ret = { transform: `translateX(calc(${shiftX.value}px))` };
  return ret;
});

onMounted(() => {
  checkPos();
});

//  ---------------------------------------------------------------------------------
</script>
<template>
  <div class="nac-btn-ballon">
    <slot></slot>
    <div ref="balloonBaseElm" class="nac-btn-ballon-base" :class="{ show: props.isShow, withHover: props.withHover }">
      <div
        ref="balloonBodyElm"
        class="btn-balloon border"
        :class="[balloonBodyClass, { show: props.isShow }]"
        :style="balloonBodyStyley"
      >
        {{ props.baloonText }}
        <div class="anime-flash-light"></div>
      </div>
      <span class="arrow" :class="balloonArrowClass"><i class="fa-solid fa-caret-down"></i></span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.nac-btn-ballon:hover {
  .nac-btn-ballon-base.withHover.show {
    display: flex;
    z-index: 1;
  }
}

.nac-btn-ballon-base {
  position: absolute;
  inset: 0 0 auto 0;
  transform: translateY(calc(-100% - 14px));
  display: none;
  justify-content: center;

  &:not(.withHover).show {
    display: flex;
    z-index: 1;
  }

  filter: drop-shadow(1px 0px 1px rgb(255, 255, 255)) drop-shadow(1px 1px 1px rgb(255, 255, 255))
    drop-shadow(0px 1px 1px rgb(255, 255, 255)) drop-shadow(-1px 0px 1px rgb(255, 255, 255))
    drop-shadow(-1px -1px 1px rgb(255, 255, 255)) drop-shadow(0px -1px 1px rgb(255, 255, 255));

  .btn-balloon {
    flex: 0 0 auto;
    width: auto;
    border-radius: 4px;
    border: solid 2px transparent;
    padding: 2px 4px;
    white-space: pre-line;
    max-width: calc(100vw - 40px);
    word-wrap: break-word;
    overflow: hidden;
    color: rgb(255, 255, 255);
  }
  .arrow {
    content: '\f0d7';
    display: block;
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    text-align: center;
    position: absolute;
    bottom: 0px;
    left: calc(50% - 0.5em);
    width: 1em;
    height: 14px;
    // color: #ff5e00;
    font-size: 1.6em;
  }
}
.anime-flash-light {
  background-color: rgba(255, 255, 255, 0.63);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: white;
  z-index: 1;
  animation-name: v-fc-button-balloon-flash-light;
  animation-fill-mode: both;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-delay: 0.5s;
  animation-direction: normal;
}
</style>

<style lang="scss">
@keyframes v-fc-button-balloon-flash-light {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  20% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}
</style>
