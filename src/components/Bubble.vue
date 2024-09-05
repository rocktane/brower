<template>
  <div class="bubble">
    {{ props.description }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  description: string;
}>();
</script>

<style scoped>
.bubble {
  position: absolute;
  display: none;
  bottom: 120px;
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
