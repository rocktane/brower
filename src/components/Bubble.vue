<template>
  <div
    class="bubble"
    v-show="isVisible"
    :style="{ left: bubbleLeft + 'px', top: bubbleTop + 'px' }"
  >
    {{ props.description }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  description: string;
}>();

const bubbleLeft = ref(0);
const bubbleTop = ref(0);
const isVisible = ref(false);

const updateBubblePosition = (event: MouseEvent) => {
  isVisible.value = true;

  requestAnimationFrame(() => {
    const windowWidth = window.innerWidth;
    const mouseX = event.clientX;

    if (mouseX + 300 > windowWidth) {
      bubbleLeft.value = mouseX - 230;
    } else {
      bubbleLeft.value = mouseX;
    }

    bubbleTop.value = event.clientY + 20;
  });
};

onMounted(() => {
  window.addEventListener("mousemove", updateBubblePosition);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", updateBubblePosition);
});
</script>

<style scoped>
.bubble {
  position: fixed;
  display: none;
  width: 180px;
  text-wrap: balance;
  height: fit-content;
  background-color: #266946;
  border: #266946 solid 1px;
  color: white;
  padding: 1rem;
  border-radius: 0.25rem;
  z-index: 1000;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
</style>
