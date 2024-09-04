<template>
  <div class="test">
    {{ props.test }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  test: string;
}>();
</script>

<style scoped>
.test {
  display: inline-block;
  border: red solid 1px;
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
