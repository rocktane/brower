import { reactive } from "vue";

interface Store {
  checkedCount: number;
  apps: string[];
}

export const store = reactive<Store>({
  checkedCount: 0,
  apps: [],
});
