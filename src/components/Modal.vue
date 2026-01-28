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

      <div class="warnings">
        <p class="warning" v-html="t('message.warnings.interactive')"></p>
        <p class="warning" v-html="t('message.warnings.gatekeeper')"></p>
      </div>

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
import { defineComponent, onMounted, onUnmounted } from "vue";
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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape);
    });

    const { t } = useI18n();

    // Helper to build commands with error handling (Faille 4 - Solution A)
    const buildAppCommands = (brewPath: string) => {
      const tapApps = store.tapApps;
      const caskApps = store.apps.filter((app) => app.startsWith("--cask"));
      const nonCaskApps = store.apps.filter((app) => !app.startsWith("--cask"));
      const caskAppsCleaned = caskApps.map((app) => app.replace("--cask ", ""));

      const commands: string[] = [];

      // Tap commands with error handling
      tapApps.forEach((tap) => {
        commands.push(`${brewPath} tap ${tap} || echo "⚠️ Failed: tap ${tap}"`);
      });

      // Cask commands with error handling (each app separately)
      caskAppsCleaned.forEach((app) => {
        commands.push(`${brewPath} install --cask ${app} || echo "⚠️ Failed: ${app}"`);
      });

      // Formula commands with error handling (each app separately)
      nonCaskApps.forEach((app) => {
        commands.push(`${brewPath} install ${app} || echo "⚠️ Failed: ${app}"`);
      });

      return commands.join("; ");
    };

    // Pre-checks (Failles 8 & 9 - Solution B)
    const preChecks =
      // macOS version check (Faille 9)
      '[[ $(sw_vers -productVersion | cut -d. -f1) -ge 11 ]] || { echo "❌ macOS 11.0+ required"; exit 1; } && ' +
      // Disk space check - at least 10GB (Faille 8)
      '[ $(df -g / | tail -1 | awk \'{print $4}\') -ge 10 ] || { echo "❌ Insufficient disk space (<10 GB)"; exit 1; }';

    // Xcode CLT installation (Faille 2 - Solution B)
    const xcodeCheck =
      'xcode-select -p &>/dev/null || { echo "📦 Installing Xcode Command Line Tools..."; xcode-select --install; echo "⏳ Press Enter after CLT installation completes..."; read; }';

    // Homebrew installation with absolute path (Faille 1 - Solution A)
    const installBrew =
      'if command -v brew &>/dev/null; then brew update; ' +
      'else /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; fi';

    // Determine brew path (Faille 1 - Solution A: absolute paths)
    const brewPathSetup =
      'BREW_PATH="$([[ -x /opt/homebrew/bin/brew ]] && echo /opt/homebrew/bin/brew || echo /usr/local/bin/brew)"';

    // Build the full command with brew installation
    const appCommands = buildAppCommands('$BREW_PATH');

    const commandWithBrew = [
      preChecks,
      xcodeCheck,
      installBrew,
      brewPathSetup,
      appCommands
    ].join(' && ');

    // Command without brew (for users who already have it)
    const commandWithoutBrewApps = buildAppCommands('brew');
    const commandWithoutBrew = commandWithoutBrewApps;

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

.warnings {
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 4px;
  padding: 0.75em 1em;
  margin-bottom: 1em;
  font-size: 0.9em;
}

.warning {
  margin: 0.5em 0;
  line-height: 1.4;
}

.warning:first-child {
  margin-top: 0;
}

.warning:last-child {
  margin-bottom: 0;
}
</style>
