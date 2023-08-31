<script setup lang="ts">
/* ----------------------------------------------------------------------------
  nuxt-app-components
  nac/ui/block-loading
---------------------------------------------------------------------------- */
type Props = {
  isShow: boolean;
};
const props = defineProps<Props>();
</script>
<template>
  <div class="block-loading" :class="{ isShow: props.isShow }">
    <div class="loading-container">
      <div class="loading-item">
        <div class="loading-ball"></div>
        <div class="loading-ball"></div>
        <div class="loading-ball"></div>
      </div>
      <div class="loading-text">Loading</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.block-loading {
  position: absolute;
  inset: 0 0 0 0;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  // z-index: 1;
  overflow: hidden;
  background-color: rgba(21, 62, 128, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 300ms;
  cursor: default;

  &.isShow {
    pointer-events: auto;
    opacity: 1;
  }
}
.loading-container {
  width: 50%;
  max-width: 200px;
  max-height: min(90%, 160px);

  &::before {
    content: '';
    display: block;
    padding-top: 56.25%;
    padding-top: 40%;
  }
}
.loading-item {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 20px;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  height: calc(100% - 20px);
}
.loading-ball {
  height: 100%;
  width: 40px;
  max-width: 60px;
  // border: solid 1px gray;

  &::before,
  &::after {
    left: 10px;
    position: absolute;
    content: '';
    display: block;
    border-radius: 50%;
    background-color: red;
  }

  &::before {
    z-index: 1;
    top: 0px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: rgb(255, 255, 255);
    animation: BoxLoadingBallLight 0.5s alternate infinite ease;
  }

  &::after {
    z-index: 0;
    bottom: 0px;
    width: 16px;
    height: 4px;
    border-radius: 50%;
    background-color: rgb(123, 123, 123);
    animation: BoxLoadingBallShadow 0.5s alternate infinite ease;
  }
  &:nth-child(2)::before,
  &:nth-child(2)::after {
    animation-delay: 0.2s;
  }

  &:nth-child(3)::before,
  &:nth-child(3)::after {
    animation-delay: 0.3s;
  }
}

.loading-text {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

<style lang="scss">
@keyframes BoxLoadingBallLight {
  0% {
    top: calc(100% - 4px);
    height: 5px;
    border-radius: 50% 50% 25% 25%;
    transform: scaleX(1.4);
  }

  40% {
    height: 16px;
    border-radius: 50%;
    transform: scaleX(1);
  }

  100% {
    top: 0%;
  }
}

@keyframes BoxLoadingBallShadow {
  0% {
    transform: scaleX(1.5);
  }

  40% {
    transform: scaleX(1);
    opacity: 0.7;
  }

  100% {
    transform: scaleX(0.2);
    opacity: 0.4;
  }
}
</style>
