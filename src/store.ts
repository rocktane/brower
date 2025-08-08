import { reactive } from "vue";

interface Store {
  checkedCount: number;
  apps: string[];
  tapApps: (string | undefined)[];
  toggleItem: (brew: string, tap?: string) => void;
  isItemChecked: (brew: string) => boolean;
}

export const store = reactive<Store>({
  checkedCount: 0,
  apps: [],
  tapApps: [],
  
  toggleItem(brew: string, tap?: string) {
    const index = this.apps.indexOf(brew);
    const tapIndex = tap ? this.tapApps.indexOf(tap) : -1;
    
    if (index > -1) {
      // Remove item
      this.apps.splice(index, 1);
      if (tap && tapIndex > -1) {
        this.tapApps.splice(tapIndex, 1);
      }
      this.checkedCount--;
    } else {
      // Add item
      this.apps.push(brew);
      if (tap) {
        this.tapApps.push(tap);
      }
      this.checkedCount++;
    }
  },
  
  isItemChecked(brew: string) {
    return this.apps.includes(brew);
  }
});
