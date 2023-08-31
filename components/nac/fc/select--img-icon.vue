<script setup lang="ts">
type Props = {
  imgUrl?: string | null;
  imageObjectFit?: 'contain' | 'cover';
  imageBorder?: string;
};

const props = withDefaults(defineProps<Props>(), {
  imgUrl: null,
  imageObjectFit: 'contain',
  imageBorder: 'border-gray',
});
</script>
<template>
  <div class="item-img d-flex-cc border border-gray me-1" :class="props.imageBorder" style="height: 20px; width: 40px">
    <img
      v-if="props.imgUrl"
      :src="props.imgUrl"
      alt=""
      :style="{ 'object-fit': props.imageObjectFit }"
      style="width: 100%; height: 100%"
    />
    <div v-else class="text-center lh-1" style="transform: scale(0.5)">
      <div>NO</div>
      <div>IMG</div>
    </div>
  </div>
</template>
