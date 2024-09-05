import { reactive } from "vue";

interface Store {
  checkedCount: number;
  apps: string[];
  tapApps: (string | undefined)[];
}

export const store = reactive<Store>({
  checkedCount: 0,
  apps: [],
  tapApps: [],
});
