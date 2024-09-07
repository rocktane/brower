<template>
  <footer>
    <p>Made with ❤️ by <a href="https://github.com/rocktane">rocktane</a></p>
    <p>{{ t("message.hello") }}</p>

    <button @click="changeLanguage('fr')">Français</button>
    <button @click="changeLanguage('en')">English</button>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { locale } = useI18n();

const changeLanguage = (lang: string) => {
  locale.value = lang;
};
</script>

<style scoped>
footer {
  width: 100%;
  height: 200px;
  background-color: #266946;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "anybody", serif;
  font-size: 1em;
  color: white;
  margin-top: 150px;
}

a {
  color: white;
}
</style>
