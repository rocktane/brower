<template>
  <div class="bubble-container">
    <span class="info-icon" @mouseover="toggleBubble" @mouseleave="toggleBubble"
      >ℹ️</span
    >
    <!-- <span class="bubble">{{ props.description }}</span> -->
    <div v-if="showBubble" class="bubble">
      {{ props.description }}
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
  /* font-weight: bold;
  background-color: #e0e0e0;
  border-radius: 50%;
  padding: 0.2rem 0.4rem;
  font-size: 1rem; */
  /* user-select: none; */
}

.bubble {
  position: absolute;
  bottom: 50px;
  width: 180px;
  text-wrap: balance;
  height: fit-content;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e3e3e3;
  border: #cccccc solid 1px;
  color: #5a5a5a;
  padding: 1rem;
  border-radius: 0.25rem;
  z-index: 1000;
  margin-top: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}
</style>
