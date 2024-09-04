<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">X</button>
      <h2>Dernière étape</h2>
      <h3>Instructions d'intallation</h3>
      <p>Sur macOS <kbd>⌘</kbd> + <kbd>Space</kbd> puis tapez :</p>
      <pre>{{ store.apps.join(" ") }}</pre>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { store } from "../store";

export default defineComponent({
  name: "Modal",
  emits: ["close"],
  setup(_, { emit }) {
    const closeModal = () => {
      emit("close");
    };

    return {
      store,
      closeModal,
    };
  },
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
</style>
