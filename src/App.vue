<script setup lang="ts">
import { ref } from "vue";
import { store } from "./store";
import List from "./components/List.vue";
import Modal from "./components/Modal.vue";

const showModal = ref(false);
</script>

<template>
  <div class="navbar">
    <h1>yTools</h1>
    <button :disabled="store.checkedCount === 0" @click="showModal = true">
      Installer {{ store.checkedCount }} applications
    </button>
    <Modal v-if="showModal" @close="showModal = false"> </Modal>
  </div>
  <List />
</template>

<style scoped></style>
