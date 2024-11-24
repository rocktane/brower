<template>
  <div class="content">
    <div class="instructions">
      <h2>{{ t("message.subtitle") }}</h2>
      <div class="legend">
        <div class="legend-item">
          <img src="../assets/icons/star.svg" alt="star" :height="16" />
          <span>{{ t("message.legend.star") }}</span>
        </div>
        <div class="legend-item">
          <img src="../assets/icons/new.svg" alt="new" :height="16" />
          <span>{{ t("message.legend.new") }}</span>
        </div>
        <div class="legend-item">
          <img src="../assets/icons/heart.svg" alt="heart" :height="16" />
          <span>{{ t("message.legend.heart") }}</span>
        </div>
      </div>
    </div>
    <div v-for="category in orderedCategories" :key="category" class="category">
      <h3>{{ $t(`message.categories.${category}`).toLowerCase() }}</h3>
      <div class="cards">
        <label
          v-for="(item, index) in groupedItems[category]"
          :key="index"
          class="btn"
          :class="[
            'btn',
            $i18n.locale === 'fr' ? 'btn-gold' : 'btn-green',
            { checked: item.checked },
          ]"
        >
          <input type="checkbox" v-model="item.checked" @change="updateCount" />
          <Bubble
            :description="t(`message.descriptions.${item.code}`)"
            v-if="showBubble"
          />
          <img
            :src="item.logo"
            :alt="item.name + ' logo'"
            :height="48"
            :ratio="1 / 1"
          />
          <span
            class="name"
            @mouseover="toggleBubble"
            @mouseleave="toggleBubble"
            >{{ item.name }}</span
          >
          <img
            v-if="item.special !== ''"
            :src="getIconUrl(item.special)"
            :alt="item.special"
            :class="item.special"
            :height="16"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { store } from "../store";
import Bubble from "./Bubble.vue";
import { useI18n } from "vue-i18n";
import dbData from "../db.json";

interface Item {
  name: string;
  code: string;
  brew: string;
  tap?: string;
  logo: string;
  category: string;
  url: string;
  description: string;
  checked: boolean;
  special: string;
}

const orderedCategories = [
  "internet",
  "messaging",
  "productivity",
  "tools",
  "multimedia",
  "developer",
  "security",
];

export default defineComponent({
  name: "CheckList",
  components: {
    Bubble,
    useI18n,
  },

  setup() {
    const items = ref<Item[]>([]);
    const showBubble = ref(false);

    onMounted(() => {
      items.value = dbData.map((item) => ({ ...item, checked: false }));
      updateCount();
    });

    const toggleBubble = (): void => {
      showBubble.value = !showBubble.value;
    };

    const updateCount = (): void => {
      const checked = items.value.filter((item) => item.checked);
      store.checkedCount = checked.length;
      store.tapApps = checked.filter((app) => app.tap).map((app) => app.tap);
      store.apps = checked.map((app) => app.brew);
    };

    const groupedItems = computed(() => {
      return items.value.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, Item[]>);
    });

    watch(items, updateCount, { deep: true });

    const { t } = useI18n();

    const getIconUrl = (name: string): string => {
      return new URL(`../assets/icons/${name}.svg`, import.meta.url).href;
    };

    return {
      items,
      orderedCategories,
      updateCount,
      toggleBubble,
      showBubble,
      t,
      groupedItems,
      getIconUrl,
    };
  },
});
</script>

<style scoped>
.content {
  width: 90%;
  margin: 0 auto;
}

.category {
  border: 1px solid rgb(200, 200, 200);
  border-radius: 15px;
  position: relative;
  padding: 14px;
  margin-bottom: 3em;
  & h3 {
    position: absolute;
    top: -40px;
    background-color: var(--background-color);
    left: 30px;
    padding: 5px;
    color: rgb(112, 112, 112);
  }
}

.cards {
  display: flex;
  box-sizing: border-box;
  flex-flow: row wrap;
  gap: 1.04521rem;
  width: 100%;
  margin-top: 6px;
  .card {
    display: flex;
    border: grey solid 1px;
    border-radius: 1rem;
    padding: 0.5rem;
  }
  .card:hover {
    background-color: rgba(240, 240, 240, 0.5);
  }
  label {
    display: grid;
    align-items: center;
    gap: 0.5rem;
    width: 170px;
    padding: 1em;
    user-select: none;
    & img {
      justify-self: center;
      max-height: inherit;
      -webkit-user-drag: none;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
    & span {
      justify-self: center;
    }
    &:hover .bubble {
      display: block;
    }
    &:hover .name:after {
      opacity: 1;
    }
    &.btn-green.checked {
      background-color: rgba(161, 229, 161, 0.5);
      top: 2px;
      box-shadow: 0 0 0 1px #50b280 inset,
        0 0 0 2px rgba(200, 255, 204, 0.1) inset, 0 1px 0 0 #50b280,
        0 1px 1px 1px rgba(0, 0, 0, 0.2);
    }
    &.btn-green.checked:hover {
      background-color: rgba(161, 229, 161, 0.8);
    }
    &.btn-green.checked:active {
      background-color: rgba(161, 229, 161, 1);
      box-shadow: 0 0 0 1px #50b280 inset,
        0 0 0 1px rgb(80, 178, 128, 0.15) inset,
        0 1px 3px 1px rgb(80, 178, 128, 0.1);
    }
    &.btn-gold.checked {
      top: 2px;
      box-shadow: 0 0 0 1px #b28350 inset,
        0 0 0 1px rgb(80, 178, 128, 0.15) inset,
        0 1px 3px 1px rgb(80, 178, 128, 0.1);
      background-color: rgb(229, 200, 160, 1);
    }
    &.btn-gold.checked:hover {
      background-color: rgba(229, 200, 160, 0.8);
    }
    &.btn-gold.checked:active {
      background-color: rgba(229, 200, 160, 1);
      box-shadow: 0 0 0 1px #b28350 inset,
        0 0 0 1px rgba(200, 255, 204, 0.1) inset,
        0 1px 3px 1px rgba(0, 0, 0, 0.2);
    }
    .star,
    .new,
    .heart {
      position: absolute;
      right: 0;
      top: 0;
      padding: 8px;
      /* opacity: 0.6; */
    }
  }
  .name {
    position: relative;
  }
  .name:after {
    opacity: 0;
    content: "";
    width: 100%;
    border-bottom: 1px dashed #333;
    position: absolute;
    bottom: 0;
    left: 0;
    transition: opacity 300ms ease;
  }
  input {
    display: none;
  }
}

.instructions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-top: 2em;
  margin-bottom: 3em;
  & h2 {
    margin-right: 4em;
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 1em;
    border: 1px dashed rgb(200, 200, 200);
    border-radius: 0.5em;
    padding: 0.5em 1em;
    & img {
      margin-right: 0.5em;
    }
    & .legend-item {
      display: flex;
      align-items: center;
      color: rgb(101, 101, 101);
    }
  }
}
</style>
