<template>
  <div class="content">
    <h2>Installer toutes ces applications en une fois</h2>
    <div v-for="category in orderedCategories" :key="category" class="category">
      <h3>{{ category }}</h3>
      <div class="cards">
        <label
          v-for="(item, index) in groupedItems[category]"
          :key="index"
          :class="item.checked ? 'btn3d checked' : 'btn3d'"
        >
          <input type="checkbox" v-model="item.checked" @change="updateCount" />
          <Bubble :description="item.description" />
          <img
            :src="item.logo"
            :alt="item.name + ' logo'"
            :width="48"
            :ratio="1"
          />
          <span>{{ item.name }}</span>
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

    const updateCount = () => {
      const checked = items.value.filter((item) => item.checked);
      store.checkedCount = checked.length;
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

    return { items, groupedItems, orderedCategories, updateCount };
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
    background-color: white;
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
  /* margin-bottom: 5em; */
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
      max-height: 48px;
      -webkit-user-drag: none;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
    & span {
      justify-self: center;
    }
    &.checked {
      background-color: rgba(161, 229, 161, 0.5);
      top: 2px;
      box-shadow: 0 0 0 2px #50b280 inset,
        0 0 0 1px rgb(80, 178, 128, 0.15) inset,
        0 1px 3px 1px rgb(80, 178, 128, 0.1);
      /* border: rgb(107, 206, 107) 1px solid; */
    }
    &.checked:hover {
      background-color: rgba(161, 229, 161, 0.8);
      /* border: rgb(85, 170, 85) 1px solid; */
    }
  }
  input {
    display: none;
  }
}
</style>
