<template>
  <div class="modal-overlay" @click="closeModal">
    <div
      class="modal-content"
      :class="{
        'mdl-gold': $i18n.locale === 'fr',
        'mdl-green': $i18n.locale !== 'fr',
      }"
      @click.stop
    >
      <button
        class="close-button btn"
        :class="[$i18n.locale === 'fr' ? 'btn-gold' : 'btn-green']"
        @click="closeModal"
      >
        𝗫
      </button>
      <h2 v-html="t('message.last_step')"></h2>
      <p v-html="t('message.install_macos')"></p>
      <p v-html="t('message.instructions')"></p>
      <textarea readonly id="install-command" v-auto-size>{{
        commandWithBrew
      }}</textarea>
      <div class="buttons">
        <button
          type="button"
          class="btn"
          :class="[$i18n.locale === 'fr' ? 'btn-gold' : 'btn-green']"
          @click="copyWithBrew"
        >
          {{ t("message.copy") }}
        </button>
        <button
          type="button"
          class="btn"
          :class="[$i18n.locale === 'fr' ? 'btn-green' : 'btn-gold']"
          @click="copyWithoutBrew"
        >
          {{ t("message.already_brew") }}
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { store } from "../store";
import { useI18n } from "vue-i18n";
import autoSize from "../directives/autoSize";

export default defineComponent({
  name: "Modal",
  emits: ["close"],
  directives: {
    autoSize,
  },
  setup(_, { emit }) {
    const closeModal = () => {
      emit("close");
    };

    const { t } = useI18n();

    const installBrew =
      'command -v brew &> /dev/null && brew update || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && ';

    const tapApps = store.tapApps;
    const caskApps = store.apps.filter((app) => app.startsWith("--cask"));
    const nonCaskApps = store.apps.filter((app) => !app.startsWith("--cask"));

    const caskAppsCleaned = caskApps.map((app) => app.replace("--cask ", ""));

    const tapCommand =
      tapApps.length > 0 ? `brew tap ${tapApps.join(" && brew tap")}` : "";
    const caskCommand =
      caskAppsCleaned.length > 0
        ? `brew install --cask ${caskAppsCleaned.join(" ")}`
        : "";
    const nonCaskCommand =
      nonCaskApps.length > 0 ? `brew install ${nonCaskApps.join(" ")}` : "";

    const commandWithBrew =
      installBrew +
      [tapCommand, caskCommand, nonCaskCommand]
        .filter((part) => part !== "")
        .join(" && ");

    const commandWithoutBrew = [tapCommand, caskCommand, nonCaskCommand]
      .filter((part) => part !== "")
      .join(" && ");

    const copyWithBrew = () => {
      navigator.clipboard.writeText(commandWithBrew.trimEnd());
    };

    const copyWithoutBrew = () => {
      navigator.clipboard.writeText(commandWithoutBrew.trimEnd());
    };

    return {
      store,
      closeModal,
      installBrew,
      copyWithBrew,
      copyWithoutBrew,
      commandWithBrew,
      commandWithoutBrew,
      t,
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
  user-select: none;
  z-index: 1000;
}
.modal-content {
  background-color: var(--background-color);
  border: 2px solid #50b280;
  padding: 1em 2em 3em 2em;
  border-radius: 8px;
  position: relative;
  width: 50%;
  height: fit-content;
  margin-top: 9rem;
  box-shadow: 0px 0px 10px 0px rgba(255, 255, 255, 0.5);
  &.mdl-gold {
    border: 2px solid #b28350;
  }
  &.mdl-green {
    border: 2px solid #50b280;
  }
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  &.btn-green:hover {
    top: 12px;
    background-color: rgba(161, 229, 161, 0.8);
  }
  &.btn-gold:hover {
    top: 12px;
    background-color: rgba(229, 200, 160, 0.6);
  }
}

textarea {
  width: 100%;
  /* height: auto; */
  margin-bottom: 1em;
  padding: 12px 21px;
  font-size: 14px;
  background-color: #f0f0f0;
  font-family: verdana, "microsoft yahei";
  letter-spacing: 0.05em;
  line-height: 20px;
  border: 1px solid #c7c7c7;
  border-radius: 4px;
  box-sizing: border-box;
  resize: none;
  user-select: none;
}

.buttons {
  display: flex;
  gap: 1em;
}
</style>
