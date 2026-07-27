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

      <!-- Ces avertissements ne concernent que l'installation complète :
           la version simplifiée n'installe ni brew ni les Xcode CLT. -->
      <div class="warnings" v-if="!simplified">
        <p class="warning" v-html="t('message.warnings.interactive')"></p>
        <p class="warning" v-html="t('message.warnings.gatekeeper')"></p>
      </div>

      <textarea
        readonly
        id="install-command"
        v-auto-size
        :value="currentCommand"
      ></textarea>
      <div class="buttons">
        <button
          type="button"
          class="btn"
          :class="[$i18n.locale === 'fr' ? 'btn-gold' : 'btn-green']"
          @click="copyCommand"
        >
          {{ t("message.copy") }}
        </button>
        <button
          type="button"
          class="btn"
          :class="[$i18n.locale === 'fr' ? 'btn-green' : 'btn-gold']"
          @click="simplified = !simplified"
        >
          {{ simplified ? t("message.full_command") : t("message.already_brew") }}
        </button>
      </div>

      <transition name="toast">
        <p class="toast" v-if="copied" role="status" aria-live="polite">
          {{ t("message.copied") }}
        </p>
      </transition>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
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

    // Build the Brewfile fed to `brew bundle` on stdin.
    // Declaring taps/formulae/casks lets brew resolve everything in a single
    // invocation, skip what is already installed, keep going when one entry
    // fails, and print a recap of the failures at the end.
    const buildBrewfile = () => {
      const casks = store.apps
        .filter((app) => app.startsWith("--cask"))
        .map((app) => app.replace("--cask ", ""));
      const formulae = store.apps.filter((app) => !app.startsWith("--cask"));
      const taps = store.tapApps.filter((tap): tap is string => Boolean(tap));

      return [
        ...taps.map((tap) => `tap "${tap}"`),
        ...formulae.map((app) => `brew "${app}"`),
        ...casks.map((app) => `cask "${app}"`),
      ].join("\n");
    };

    // Heredoc is quoted ('BREWFILE') so no shell expansion happens inside the
    // app list, and --file=- reads it from stdin instead of writing a temp
    // file on the user's machine.
    const bundleCommand = [
      "brew bundle --file=- <<'BREWFILE'",
      buildBrewfile(),
      "BREWFILE",
    ].join("\n");

    // Pre-checks (Failles 8 & 9 - Solution B)
    const preChecks = [
      // macOS version check (Faille 9)
      '[[ $(sw_vers -productVersion | cut -d. -f1) -ge 11 ]] || { echo "❌ macOS 11.0+ required"; exit 1; }',
      // Disk space check - at least 10GB (Faille 8)
      '[[ $(df -g / | awk \'NR==2{print $4}\') -ge 10 ]] || { echo "❌ Insufficient disk space (<10 GB)"; exit 1; }',
    ].join("\n");

    // Xcode CLT installation (Faille 2 - Solution B)
    // `< /dev/tty` so the prompt still works when the script is piped to bash.
    const xcodeCheck = [
      "xcode-select -p &>/dev/null || {",
      '  echo "📦 Installing Xcode Command Line Tools..."',
      "  xcode-select --install",
      '  read -r -p "⏳ Press Enter once the CLT installation completes... " < /dev/tty',
      "}",
    ].join("\n");

    // Homebrew installation (Faille 1 - Solution A)
    const installBrew = [
      "command -v brew &>/dev/null || \\",
      '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    ].join("\n");

    // `brew shellenv` is the official way to locate brew and fix the PATH,
    // on both Apple Silicon (/opt/homebrew) and Intel (/usr/local).
    const brewPathSetup = [
      'eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"',
      "export HOMEBREW_NO_ENV_HINTS=1",
    ].join("\n");

    const commandWithBrew = [
      "#!/bin/bash",
      preChecks,
      xcodeCheck,
      installBrew,
      brewPathSetup,
      bundleCommand,
    ].join("\n\n");

    // Command without brew (for users who already have it)
    const commandWithoutBrew = bundleCommand;

    // Toggled by the "I already have brew!" button: swaps what the textarea
    // shows (and what gets copied) instead of copying a hidden variant.
    const simplified = ref(false);
    const currentCommand = computed(() =>
      (simplified.value ? commandWithoutBrew : commandWithBrew).trimEnd()
    );

    const copied = ref(false);
    let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

    const copyCommand = async () => {
      await navigator.clipboard.writeText(currentCommand.value);
      copied.value = true;
      clearTimeout(copiedTimeout);
      copiedTimeout = setTimeout(() => (copied.value = false), 2000);
    };

    onUnmounted(() => clearTimeout(copiedTimeout));

    return {
      store,
      closeModal,
      copyCommand,
      copied,
      simplified,
      currentCommand,
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
  /* The generated script is multi-line: cap the growth from v-auto-size and
     scroll past it, so a long selection cannot push the buttons off-screen. */
  max-height: 40vh;
  overflow-y: auto;
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

.toast {
  position: absolute;
  bottom: 1em;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.5em 1.25em;
  border-radius: 4px;
  font-size: 0.9em;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.85);
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
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
