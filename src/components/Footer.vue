<template>
  <footer :class="[$i18n.locale === 'fr' ? 'ftr-gold' : 'ftr-green']">
    <p>
      {{ t("message.footer.idea.before") }}
      <a id="macapps" href="https://macapps.link">macapps.link</a>
      {{ t("message.footer.idea.after") }}
      <br />
      {{ t("message.footer.homebrew.before") }}
      <a id="homebrew" href="https://github.com/Homebrew/brew">homebrew</a>
      {{ t("message.footer.homebrew.after") }}
      <br />
      {{ t("message.footer.suggestion") }}
      <a id="twitter" href="https://twitter.com/rcktne">@rcktne</a>
    </p>
    <p>
      {{ t("message.footer.thanks.before") }}
      <br />
      {{ t("message.footer.made") }}
      <a id="portfolio" href="https://www.yohangouiran.com/">Yohan</a>.
      {{ t("message.footer.also_check") }}
      <a id="linkedin" href="https://www.linkedin.com/in/yohan-g/">{{
        t("message.footer.thanks.here")
      }}</a>
      {{ t("message.footer.thanks.and") }}
      <a id="github" href="https://github.com/rocktane">{{
        t("message.footer.thanks.there")
      }}</a
      >.
    </p>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
footer {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "system-ui", serif;
  font-size: 1em;
  color: white;
  margin-top: 150px;
  &.ftr-green {
    background-color: #50b280;
  }
  &.ftr-gold {
    background-color: #b28350;
  }
  & p {
    width: 90%;
  }
}

a {
  color: white;
  text-decoration-line: underline;
  text-decoration-style: dashed;
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
  &:hover {
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
  }
  &#github {
    cursor: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='48' height='48' viewBox='0 -3.1 2490.3 2493' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='1245.2' cy='1268.854' fill='%23fff' rx='1217.6' ry='1221.046' style=''/%3E%3Cpath d='m1245.2 1.6c-687.6 0-1245.2 557.4-1245.2 1245.1 0 550.2 356.8 1016.9 851.5 1181.5 62.2 11.5 85.1-27 85.1-59.9 0-29.7-1.2-127.8-1.7-231.8-346.4 75.3-419.5-146.9-419.5-146.9-56.6-143.9-138.3-182.2-138.3-182.2-113-77.3 8.5-75.7 8.5-75.7 125 8.8 190.9 128.3 190.9 128.3 111.1 190.4 291.3 135.3 362.3 103.5 11.2-80.5 43.4-135.4 79.1-166.5-276.6-31.5-567.3-138.3-567.3-615.4 0-135.9 48.6-247 128.3-334.2-12.9-31.3-55.5-157.9 12.1-329.4 0 0 104.6-33.5 342.5 127.6 99.3-27.6 205.8-41.4 311.7-41.9 105.8.5 212.4 14.3 311.9 41.9 237.7-161.1 342.1-127.6 342.1-127.6 67.8 171.5 25.1 298.2 12.2 329.5 79.8 87.2 128.1 198.3 128.1 334.2 0 478.2-291.3 583.6-568.6 614.4 44.7 38.6 84.5 114.4 84.5 230.6 0 166.6-1.4 300.7-1.4 341.7 0 33.1 22.4 72 85.5 59.7 494.5-164.8 850.8-631.4 850.8-1181.4 0-687.7-557.5-1245.1-1245.1-1245.1' style=''/%3E%3C/svg%3E")
        24 24,
      pointer;
  }
  &#linkedin {
    cursor: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='24' cy='24' r='23' fill='%23fff'/%3E%3Cpath d='M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0zm-6.9 36.3h-5.4V18.6h5.4v17.7zM14.4 16.2c-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1-1.4 3.1-3.1 3.1zm22.5 20.1h-5.4v-8.6c0-2-.7-3.4-2.5-3.4-1.4 0-2.2.9-2.6 1.8-.1.3-.2.8-.2 1.2v9h-5.4V18.6h5.4v2.4c.7-1.1 2-2.7 4.8-2.7 3.5 0 6.1 2.3 6.1 7.2v10.8z' fill='%230077b5'/%3E%3C/svg%3E")
        24 24,
      pointer;
  }
  &#perso {
    cursor: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='48' height='48' viewBox='0 -3.1 2490.3 2493' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='1245.2' cy='1243.4' fill='%23fff' rx='1217.6' ry='1246.5'/%3E%3Cpath d='m1245.2 1.6c-687.6 0-1245.2 557.4-1245.2 1245.1 0 550.2 356.8 1016.9 851.5 1181.5 62.2 11.5 85.1-27 85.1-59.9 0-29.7-1.2-127.8-1.7-231.8-346.4 75.3-419.5-146.9-419.5-146.9-56.6-143.9-138.3-182.2-138.3-182.2-113-77.3 8.5-75.7 8.5-75.7 125 8.8 190.9 128.3 190.9 128.3 111.1 190.4 291.3 135.3 362.3 103.5 11.2-80.5 43.4-135.4 79.1-166.5-276.6-31.5-567.3-138.3-567.3-615.4 0-135.9 48.6-247 128.3-334.2-12.9-31.3-55.5-157.9 12.1-329.4 0 0 104.6-33.5 342.5 127.6 99.3-27.6 205.8-41.4 311.7-41.9 105.8.5 212.4 14.3 311.9 41.9 237.7-161.1 342.1-127.6 342.1-127.6 67.8 171.5 25.1 298.2 12.2 329.5 79.8 87.2 128.1 198.3 128.1 334.2 0 478.2-291.3 583.6-568.6 614.4 44.7 38.6 84.5 114.4 84.5 230.6 0 166.6-1.4 300.7-1.4 341.7 0 33.1 22.4 72 85.5 59.7 494.5-164.8 850.8-631.4 850.8-1181.4 0-687.7-557.5-1245.1-1245.1-1245.1' style=''/%3E%3C/svg%3E")
        24 24,
      pointer;
  }
}
</style>
