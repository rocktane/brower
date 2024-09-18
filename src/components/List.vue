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
          v-for="(record, index) in getRecordsByCategory(category)"
          :key="index"
          class="btn"
          :class="[
            'btn',
            $i18n.locale === 'fr' ? 'btn-gold' : 'btn-green',
            { checked: record.checked },
          ]"
        >
          <input
            type="checkbox"
            v-model="record.checked"
            @change="updateCount"
          />
          <Bubble :description="getDescription(record)" v-if="showBubble" />
          <img
            :src="record.logo"
            :alt="record.name + ' logo'"
            :height="48"
            :ratio="1 / 1"
          />
          <span
            class="name"
            @mouseover="toggleBubble"
            @mouseleave="toggleBubble"
            >{{ record.name }}</span
          >
          <img
            v-if="record.special !== ''"
            :src="`src/assets/icons/${record.special}.svg`"
            :alt="record.special"
            :class="record.special"
            :height="16"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { store } from "../store";
import Bubble from "./Bubble.vue";
import { useI18n } from "vue-i18n";
import PocketBase from "pocketbase";

interface Item {
  name: string;
  code: string;
  brew: string;
  tap?: string;
  logo: string;
  category: string;
  url: string;
  description_fr: string;
  description_en: string;
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

  methods: {
    getDescription(record: Item): string {
      const locale = this.$i18n.locale as string;
      const key = `description_${locale}` as keyof Item;

      const description = record[key];
      if (typeof description === "string") {
        return description;
      }
      return "";
    },
  },

  setup() {
    const items = ref<Item[]>([]);
    const records = ref<Item[]>([]);
    const showBubble = ref(false);
    const pb = new PocketBase("http://localhost:8090");

    onMounted(async () => {
      try {
        const response = await pb.collection("apps").getFullList();
        records.value = response.map((record: any) => ({
          name: record.name,
          code: record.code,
          brew: record.brew,
          tap: record.tap,
          logo: record.logo,
          category: record.category,
          url: record.url,
          description_fr: record.description_fr,
          description_en: record.description_en,
          checked: false,
          special: record.special,
        }));
      } catch (error) {
        console.error("Failed to fetch records:", error);
      }

      updateCount();
    });

    const toggleBubble = () => {
      showBubble.value = !showBubble.value;
    };

    const updateCount = () => {
      const checked = records.value.filter((record) => record.checked);
      store.checkedCount = checked.length;
      store.tapApps = checked.filter((app) => app.tap).map((app) => app.tap);
      store.apps = checked.map((app) => app.brew);
    };

    const getRecordsByCategory = (category: string) => {
      return records.value.filter((record) => record.category === category);
    };

    const { t } = useI18n();

    return {
      items,
      orderedCategories,
      updateCount,
      toggleBubble,
      showBubble,
      t,
      records,
      getRecordsByCategory,
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
