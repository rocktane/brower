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
      <a href="/" class="title">
        <div id="logo" class="btn btn-green">:~</div>
        <h1>yTools</h1>
      </a>
      <button
        class="btn btn-green"
        id="install-button"
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
  backdrop-filter: blur(10px);
  background-color: rgba(254, 255, 245, 0.1);
}

.elements {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin: 0 auto;
}

.title {
  display: flex;
  align-items: center;
  gap: 1em;
}

#logo {
  font-size: x-large;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: serif;
  box-sizing: content-box;
  margin-top: 9px;
  color: black;
  box-shadow: 0 0 0 1px #000000 inset, 0 0 0 2px rgba(200, 255, 204, 0.1) inset,
    0 8px 0 0 #000000, 0 8px 8px 1px rgba(0, 0, 0, 0.2);
  background-color: rgba(63, 63, 63, 0.1);
}

#install-button {
  background-color: #eaf3e6;
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
  cursor: not-allowed;
}
</style>
