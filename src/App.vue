<script setup lang="ts">
import { ref, watch } from "vue";
import { store } from "./store";
import List from "./components/List.vue";
import Modal from "./components/Modal.vue";

const showModal = ref(false);
const singularPlural = ref("application");

watch(
  () => store.checkedCount,
  (newCount) => {
    singularPlural.value = newCount <= 1 ? "application" : "applications";
  }
);
</script>

<template>
  <div class="navbar">
    <h1>yTools</h1>
    <button :disabled="store.checkedCount === 0" @click="showModal = true">
      Installer {{ store.checkedCount }} {{ ref(singularPlural) }}
    </button>
    <Modal v-if="showModal" @close="showModal = false"> </Modal>
  </div>
  <List />
</template>

<style scoped></style>
