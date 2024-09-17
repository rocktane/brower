import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import i18n from "./i18n";
// import PocketBase from "pocketbase";

// const pb = new PocketBase(process.env.VUE_APP_POCKETBASE_URL);

const app = createApp(App);

app.config.globalProperties.$pocketbaseUrl =
  import.meta.env.VITE_POCKETBASE_URL;

app.use(i18n);

app.mount("#app");
