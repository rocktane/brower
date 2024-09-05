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
    <div class="elements">
      <a href="/"><h1>yTools</h1></a>
      <button
        class="btn3d"
        :disabled="store.checkedCount === 0"
        @click="showModal = true"
      >
        Installer {{ store.checkedCount }} {{ ref(singularPlural) }}
      </button>
    </div>
  </div>
  <Modal v-if="showModal" @close="showModal = false" />
  <List />
</template>

<style scoped>
.navbar {
  position: sticky;
  border-bottom: 1px solid black;
  top: 0;
  left: 0;
  padding: 0.5em 0em;
  width: 100%;
  z-index: 999;
  background-color: inherit;
}

.elements {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin: 0 auto;
}

h1 {
  font-family: "Bungee Shade", display;
  margin: 0;
  color: black;
  text-align: center;
  display: inline-block;
}

button:disabled {
  opacity: 0.7;
  pointer-events: none;
}
</style>
