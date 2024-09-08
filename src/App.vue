<script setup lang="ts">
import { ref, watch } from "vue";
import { store } from "./store";
import List from "./components/List.vue";
import Modal from "./components/Modal.vue";
import Bubble from "./components/Bubble.vue";
import Footer from "./components/Footer.vue";
import { useI18n } from "vue-i18n";

const showModal = ref(false);

const { t, locale } = useI18n();
const changeLanguage = (lang: string) => {
  locale.value = lang;
  document.getElementById("fr")?.classList.remove("active");
  document.getElementById("en")?.classList.remove("active");
  document.getElementById(lang)?.classList.add("active");
};

const showBubble = ref(false);
const message = ref(t("message.at_least_one_app"));
watch(locale, () => {
  message.value = t("message.at_least_one_app");
});

const singularPlural = ref("application");

watch(
  () => store.checkedCount,
  (newCount) => {
    singularPlural.value = newCount <= 1 ? "application" : "applications";
  }
);

const handleMouseOver = () => {
  if (store.checkedCount === 0) {
    showBubble.value = true;
  }
};

const handleMouseLeave = () => {
  showBubble.value = false;
};
</script>

<template>
  <div class="navbar">
    <div class="elements">
      <a href="/" class="title">
        <div id="logo" class="btn btn-green">:~</div>
        <h1>yTools</h1>
      </a>
      <div class="buttons">
        <button id="fr" class="btn btn-green" @click="changeLanguage('fr')">
          🇫🇷 FR
        </button>
        <button
          id="en"
          class="btn btn-gold active"
          @click="changeLanguage('en')"
        >
          🇺🇸 EN
        </button>
        <button
          class="btn btn-green"
          id="install-button"
          :disabled="store.checkedCount === 0"
          @click="showModal = true"
          @mouseover="handleMouseOver"
          @mouseleave="handleMouseLeave"
        >
          Installer {{ store.checkedCount }} {{ singularPlural }}
        </button>
      </div>
      <Bubble :description="message" v-if="showBubble" />
    </div>
  </div>
  <Modal v-if="showModal" @close="showModal = false" />
  <List />
  <Footer />
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
  & .bubble {
    display: block;
  }
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
    -8px 8px 0 0 #000000, -1px 1px 0 0px #000000, -2px 2px 0 0px #000000,
    -3px 3px 0 0px #000000, -4px 4px 0 0px #000000, -5px 5px 0 0px #000000,
    -6px 6px 0 0px #000000, -7px 7px 0 0px #000000;
  background-color: rgba(63, 63, 63, 0.1);
  &:hover {
    top: -4px;
    transform: translateX(-2px);
    box-shadow: 0 0 0 1px #000000 inset,
      0 0 0 2px rgba(200, 255, 204, 0.1) inset, -1px 1px 0 0px #000000,
      -2px 2px 0 0px #000000, -3px 3px 0 0px #000000, -4px 4px 0 0px #000000,
      -5px 5px 0 0px #000000, -6px 6px 0 0px #000000;
    background-color: rgba(0, 0, 0, 0.2);
  }
  &:active {
    top: 0px;
    transform: translate(-8px, 2px);
    box-shadow: 0 0 0 1px #000000 inset, 0 0 0 1px rgb(80, 178, 128, 0.15) inset,
      0 1px 3px 1px rgb(80, 178, 128, 0.1);
    background-color: rgba(0, 0, 0, 0.4);
  }
}

#install-button {
  background-color: #eaf3e6;
  &:hover {
    background-color: #b3eab1;
  }
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
  cursor: not-allowed;
  &:active {
    top: -5px;
    transform: translateY(2px);
    box-shadow: 0 0 0 1px #50b280 inset,
      0 0 0 2px rgba(200, 255, 204, 0.1) inset, 0 5px 0 0 #50b280,
      0 5px 5px 1px rgba(0, 0, 0, 0.2);
  }
}

.buttons {
  display: flex;
  gap: 1em;
  & #en {
    background-color: #f2f0e2;
    &.active {
      background-color: rgb(229 200 160 / 50%);
    }
  }
  & #fr {
    background-color: #eaf3e6;
    &.active {
      background-color: rgb(161 229 161 / 60%);
    }
  }
}
</style>
