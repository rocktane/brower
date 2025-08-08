<template>
  <div
    class="bubble"
    :class="$i18n.locale === 'fr' ? 'bubble-gold' : 'bubble-green'"
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
let isTracking = false;

const updateBubblePosition = (event: MouseEvent) => {
  if (!isTracking) return;
  
  requestAnimationFrame(() => {
    const windowWidth = window.innerWidth;
    const mouseX = event.clientX;

    if (mouseX + 300 > windowWidth) {
      bubbleLeft.value = mouseX - 240;
    } else {
      bubbleLeft.value = mouseX + 10;
    }

    bubbleTop.value = event.clientY + 20;
  });
};

// Start tracking when component is mounted (bubble is shown)
onMounted(() => {
  isTracking = true;
  window.addEventListener("mousemove", updateBubblePosition);
  
  // Set initial position based on current mouse position
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2
  });
  updateBubblePosition(mouseEvent);
});

// Stop tracking when component is unmounted (bubble is hidden)
onUnmounted(() => {
  isTracking = false;
  window.removeEventListener("mousemove", updateBubblePosition);
});
</script>

<style scoped>
.bubble {
  position: fixed;
  width: 200px;
  text-wrap: balance;
  height: fit-content;
  color: white;
  padding: 1rem;
  border-radius: 0.25rem;
  z-index: 1000;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  pointer-events: none;
  &.bubble-green {
    background-color: #266946;
  }
  &.bubble-gold {
    background-color: #6f5a28;
  }
}
</style>