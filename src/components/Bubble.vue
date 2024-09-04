<template>
  <div class="bubble-container">
    <span class="info-icon" @click="toggleBubble">i</span>
    <div v-if="showBubble" class="bubble">
      {{ props }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";

const props = defineProps<{
  description: string;
}>();

const showBubble = ref(false);

const toggleBubble = () => {
  showBubble.value = !showBubble.value;
};
</script>

<style scoped>
.bubble-container {
  position: relative;
  display: inline-block;
}

.info-icon {
  cursor: pointer;
  font-weight: bold;
  background-color: #e0e0e0;
  border-radius: 50%;
  padding: 0.2rem 0.4rem;
  font-size: 1rem;
  user-select: none;
}

.bubble {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  z-index: 10;
  margin-top: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}
</style>
