<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">X</button>
      <h2>Dernière étape</h2>
      <h3>Instructions d'intallation</h3>
      <p>
        Dans le terminal macOS → <kbd>⌘</kbd> + <kbd>Espace</kbd> puis tapez
        <code>terminal</code> et <kbd>⮐</kbd>
      </p>
      <p>
        Copiez puis collez le code suivant dans le terminal et appuyez sur
        <kbd>⮐</kbd> pour que la magie opère
      </p>
      <textarea readonly id="install-command">{{ command }}</textarea>
      <button type="button" class="btn3d" @click="copy">
        Copier la commande
      </button>
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

    const installBrew =
      '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';

    const caskApps = store.apps.filter((app) => app.startsWith("--cask"));
    const nonCaskApps = store.apps.filter((app) => !app.startsWith("--cask"));

    const caskAppsCleaned = caskApps.map((app) => app.replace("--cask ", ""));

    const caskCommand =
      caskAppsCleaned.length > 0 ? `--cask ${caskAppsCleaned.join(" ")}` : "";
    const nonCaskCommand =
      nonCaskApps.length > 0 ? `${nonCaskApps.join(" ")}` : "";

    const command = [installBrew, caskCommand, nonCaskCommand]
      .filter((part) => part !== "")
      .join(" && brew install ");

    const copy = () => {
      const textarea = document.getElementById(
        "install-command"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length); // For mobile devices
        navigator.clipboard.writeText(textarea.value.trimEnd());
      }
    };

    return {
      store,
      closeModal,
      installBrew,
      copy,
      command,
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
  /* align-items: center; */
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  width: 90%;
  height: fit-content;
  margin-top: 9rem;
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

p:has(kbd) {
  display: flex;
  align-items: center;
  justify-content: start;
}

kbd,
code {
  background-color: #eee;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
  color: #333;
  display: inline-block;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 11px;
  line-height: 1.4;
  margin: 0 0.5em;
  padding: 0.1em 0.6em;
  text-shadow: 0 1px 0 #fff;
  white-space: nowrap;
}

code {
  background-color: #f0f0f0;
  /* border: 1px solid #eee;
  border-radius: 4px; */
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
  color: #333;
  display: inline-block;
  font-family: Courier, monospace;
  font-size: 13px;
  line-height: 20px;
  margin: 0 0.5em;
  padding: 0.1em 0.6em;
  white-space: nowrap;
}

textarea {
  width: 100%;
  height: auto;
  margin-top: 10px;
  padding: 12px 21px;
  font-size: 14px;
  /* color: #666; */
  background-color: #f0f0f0;
  font-family: verdana, "microsoft yahei";
  letter-spacing: 0.05em;
  line-height: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  box-sizing: border-box;
  /* overflow-y: hidden; */
  resize: none;
  user-select: none;
}

.btn3d {
  position: relative;
  top: -6px;
  border: 0;
  color: #666666;
  /* box-shadow: 0 0 0 1px #ebebeb inset, 0 0 0 2px rgba(255, 255, 255, 0.1) inset,
    0 8px 0 0 #bebebe, 0 8px 8px 1px rgba(0, 0, 0, 0.2); ORIGINAL */
  box-shadow: 0 0 0 1px #50b280 inset, 0 0 0 2px rgba(200, 255, 204, 0.1) inset,
    0 8px 0 0 #50b280, 0 8px 8px 1px rgba(0, 0, 0, 0.2);
  background-color: #f9f9f9;
  transition: all 40ms linear;
  margin-top: 10px;
  color: #50b280;
  margin-bottom: 10px;
  margin-left: 2px;
  margin-right: 2px;
}

.btn3d:active:focus,
.btn3d:focus:hover,
.btn3d:focus {
  -moz-outline-style: none;
  outline-style: none;
  outline: medium none;
}

.btn3d:active,
.btn3d.active {
  top: 2px;
  color: #50b280;
  /* box-shadow: 0 0 0 1px #ebebeb inset, 0 0 0 1px rgba(255, 255, 255, 0.15) inset,
    0 1px 3px 1px rgba(0, 0, 0, 0.1); ORIGINAL */
  box-shadow: 0 0 0 1px #50b280 inset, 0 0 0 1px rgb(80, 178, 128, 0.15) inset,
    0 1px 3px 1px rgb(80, 178, 128, 0.1);
  background-color: #f9f9f9;
}
</style>
