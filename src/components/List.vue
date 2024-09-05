<template>
  <div class="content">
    <h2>Installer toutes ces applications en une fois</h2>
    <div v-for="category in orderedCategories" :key="category" class="category">
      <h3>{{ category }}</h3>
      <div class="cards">
        <label
          v-for="(item, index) in groupedItems[category]"
          :key="index"
          :class="{ btn3d: true, checked: item.checked }"
        >
          <input type="checkbox" v-model="item.checked" @change="updateCount" />
          <Bubble :description="item.description" v-if="showBubble" />
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
            v-if="item.star"
            src="https://www.svgrepo.com/show/13695/star.svg"
            alt="star"
            class="star"
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
import dbData from "../sorted-db.json";
import Bubble from "./Bubble.vue";

interface Item {
  name: string;
  brew: string;
  tap?: string;
  logo: string;
  category: string;
  url: string;
  description: string;
  checked: boolean;
  star: boolean;
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
  },
  setup() {
    const items = ref<Item[]>([]);

    onMounted(() => {
      items.value = dbData.map((item) => ({ ...item, checked: false }));
      updateCount();
    });

    const showBubble = ref(false);

    const toggleBubble = () => {
      showBubble.value = !showBubble.value;
    };

    const updateCount = () => {
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

    return {
      items,
      groupedItems,
      orderedCategories,
      updateCount,
      toggleBubble,
      showBubble,
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
  gap: 1.354492rem;
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
    &.checked {
      background-color: rgba(161, 229, 161, 0.5);
      top: 2px;
      box-shadow: 0 0 0 1px #50b280 inset,
        0 0 0 2px rgba(200, 255, 204, 0.1) inset, 0 1px 0 0 #50b280,
        0 1px 1px 1px rgba(0, 0, 0, 0.2);
    }
    &.checked:hover {
      background-color: rgba(161, 229, 161, 0.8);
    }
    .star {
      position: absolute;
      right: 0;
      top: 0;
      padding: 8px;
      opacity: 0.6;
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
</style>
