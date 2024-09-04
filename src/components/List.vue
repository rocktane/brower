<template>
  <div>
    <h2>Installer toutes ces apps en une commande</h2>
    <ul>
      <li
        v-for="(item, index) in items"
        :key="index"
        :class="{ checked: item.checked }"
      >
        <label>
          <input type="checkbox" v-model="item.checked" @change="updateCount" />
          <img :src="item.logo" :alt="item.name" :width="48" :ratio="1" />
          {{ item.name }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { store } from "../store";
import dbData from "../db.json";

interface Item {
  name: string;
  brew: string;
  logo: string;
  checked: boolean;
}

export default defineComponent({
  name: "CheckList",
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

    watch(items, updateCount, { deep: true });

    return { items, updateCount };
  },
});
</script>

<style scoped>
ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  li {
    display: flex;
    border: grey solid 1px;
    border-radius: 1rem;
    padding: 0.5rem;
  }
  li:hover {
    background-color: rgba(240, 240, 240, 0.5);
  }
  li.checked {
    background-color: rgba(161, 229, 161, 0.5);
    border: rgb(107, 206, 107) 1px solid;
  }
  li.checked:hover {
    background-color: rgba(161, 229, 161, 1);
    border: rgb(85, 170, 85) 1px solid;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  input {
    display: none;
  }
}
</style>
