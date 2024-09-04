<template>
  <div>
    <h2>Installer toutes ces apps en une commande</h2>
    <div class="cards">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="item.checked ? 'button btn3d checked' : 'button btn3d'"
      >
        <Bubble :description="item.description" />
        <Test :test="testValue" />
        <HelloWorld msg="Hello Vue 3.2" />
        <label>
          <input type="checkbox" v-model="item.checked" @change="updateCount" />
          <img
            :src="item.logo"
            :alt="item.name + ' logo'"
            :width="48"
            :ratio="1"
          />
          {{ item.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { store } from "../store";
import dbData from "../db.json";
import Bubble from "./Bubble.vue";
import Test from "./Test.vue";
import HelloWorld from "./HelloWorld.vue";

interface Item {
  name: string;
  brew: string;
  logo: string;
  description: string;
  checked: boolean;
}

export default defineComponent({
  name: "CheckList",
  setup() {
    const items = ref<Item[]>([]);
    const testValue = ref("testtesttest");

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

    return { items, updateCount, testValue };
  },
});
</script>

<style scoped>
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  .card {
    display: flex;
    border: grey solid 1px;
    border-radius: 1rem;
    padding: 0.5rem;
  }
  .card:hover {
    background-color: rgba(240, 240, 240, 0.5);
  }
  .card.checked {
    background-color: rgba(161, 229, 161, 0.5);
    border: rgb(107, 206, 107) 1px solid;
  }
  .card.checked:hover {
    background-color: rgba(161, 229, 161, 1);
    border: rgb(85, 170, 85) 1px solid;
  }
  label {
    display: grid;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  input {
    display: none;
  }
}

.btn3d {
  position: relative;
  top: -6px;
  border: 0;
  color: #666666;
  /* box-shadow: 0 0 0 1px #ebebeb inset, 0 0 0 2px rgba(255, 255, 255, 0.1) inset,
    0 8px 0 0 #bebebe, 0 8px 8px 1px rgba(0, 0, 0, 0.2); ORIGINAL */
  box-shadow: 0 0 0 1px #50b280 inset, 0 0 0 2px rgba(200, 255, 204, 0.1) inset,
    0 8px 0 0 #50b280, 0 8px 8px 1px rgba(0, 0, 0, 0.2);
  background-color: #f9f9f9;
  transition: all 40ms linear;
  margin-top: 10px;
  color: #50b280;
  margin-bottom: 10px;
  margin-left: 2px;
  margin-right: 2px;
}

.btn3d:active:focus,
.btn3d:focus:hover,
.btn3d:focus {
  -moz-outline-style: none;
  outline-style: none;
  outline: medium none;
}

.btn3d:active,
.btn3d.active {
  top: 2px;
  color: #50b280;
  /* box-shadow: 0 0 0 1px #ebebeb inset, 0 0 0 1px rgba(255, 255, 255, 0.15) inset,
    0 1px 3px 1px rgba(0, 0, 0, 0.1); ORIGINAL */
  box-shadow: 0 0 0 1px #50b280 inset, 0 0 0 1px rgb(80, 178, 128, 0.15) inset,
    0 1px 3px 1px rgb(80, 178, 128, 0.1);
  background-color: #f9f9f9;
}
</style>
