<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { store } from '../store';
import { useI18n } from 'vue-i18n';
import type { Item } from '../services/dataService';

const props = defineProps<{
  items: Item[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { locale } = useI18n();
const searchQuery = ref('');
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement>();
const itemRefs = ref<HTMLElement[]>([]);

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items;
  }

  const query = searchQuery.value.toLowerCase();
  return props.items.filter(item => {
    const name = item.name.toLowerCase();
    const description = locale.value === 'fr'
      ? item.descriptionFR.toLowerCase()
      : item.descriptionEN.toLowerCase();
    const category = item.category.toLowerCase();

    return name.includes(query) ||
           description.includes(query) ||
           category.includes(query);
  });
});

watch(searchQuery, () => {
  selectedIndex.value = 0;
});

// Remove the automatic scrolling on selection change
// We'll handle scrolling manually in the keyboard navigation

const toggleItem = (item: Item) => {
  const index = store.apps.indexOf(item.brew);
  const tapIndex = store.tapApps.indexOf(item.tap);

  if (index > -1) {
    store.apps.splice(index, 1);
    if (item.tap && tapIndex > -1) {
      store.tapApps.splice(tapIndex, 1);
    }
    store.checkedCount--;
  } else {
    store.apps.push(item.brew);
    if (item.tap) {
      store.tapApps.push(item.tap);
    }
    store.checkedCount++;
  }

  // Keep focus on search input to maintain keyboard navigation
  nextTick(() => {
    searchInput.value?.focus();
  });
};

const isChecked = (item: Item) => {
  return store.apps.includes(item.brew);
};

const scrollToItem = async (index: number) => {
  // Wait for DOM update after selection change
  await nextTick();

  const container = document.querySelector('.search-results');
  const selectedElement = itemRefs.value[index];

  if (container && selectedElement) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = selectedElement.getBoundingClientRect();

    // Check if element is below the visible area
    if (elementRect.bottom > containerRect.bottom) {
      // Scroll down, keeping one item visible above for context
      const scrollAmount = elementRect.bottom - containerRect.bottom + elementRect.height;
      container.scrollTop += scrollAmount;
    }
    // Check if element is above the visible area
    else if (elementRect.top < containerRect.top) {
      // Scroll up, keeping one item visible below for context
      const scrollAmount = containerRect.top - elementRect.top + elementRect.height;
      container.scrollTop -= scrollAmount;
    }
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      emit('close');
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < filteredItems.value.length - 1) {
        selectedIndex.value++;
        scrollToItem(selectedIndex.value);
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
        scrollToItem(selectedIndex.value);
      }
      break;
    case ' ':
      event.preventDefault();
      if (filteredItems.value[selectedIndex.value]) {
        toggleItem(filteredItems.value[selectedIndex.value]);
      }
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredItems.value[selectedIndex.value]) {
        toggleItem(filteredItems.value[selectedIndex.value]);
      }
      break;
  }
};

const handleGlobalKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
  }
};

onMounted(() => {
  searchInput.value?.focus();
  document.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown);
});

const setItemRef = (el: any, index: number) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};
</script>

<template>
  <div class="search-modal-overlay" @click.self="$emit('close')" @keydown="handleKeyDown" tabindex="-1">
    <div class="search-modal">
      <div class="search-header">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="locale === 'fr' ? 'Rechercher une application...' : 'Search for an application...'"
          class="search-input"
        />
        <button @click="$emit('close')" class="close-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="search-results">
        <div v-if="filteredItems.length === 0" class="no-results">
          {{ locale === 'fr' ? 'Aucun résultat trouvé' : 'No results found' }}
        </div>

        <div
          v-for="(item, index) in filteredItems"
          :key="item.code"
          :ref="(el) => setItemRef(el, index)"
          class="search-item"
          :class="{
            'selected': index === selectedIndex,
            'checked': isChecked(item)
          }"
          @click="toggleItem(item)"
          @mouseenter="selectedIndex = index"
        >
          <div class="check-area">
            <svg v-if="isChecked(item)" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="item-icon">
            <img v-if="item.logo" :src="item.logo" :alt="item.name" />
            <div v-else class="icon-placeholder">{{ item.name[0] }}</div>
          </div>

          <div class="item-content">
            <div class="item-header">
              <div class="item-name">{{ item.name }}</div>
              <div class="category-chip">{{ item.category }}</div>
            </div>
            <div class="item-description">
              {{ locale === 'fr' ? item.descriptionFR : item.descriptionEN }}
            </div>
          </div>

          <div class="item-shortcuts" v-if="index === selectedIndex">
            <span class="shortcut">Space</span>
          </div>
        </div>
      </div>

      <div class="search-footer">
        <div class="footer-hints">
          <span class="hint">
            <kbd>↑↓</kbd> {{ locale === 'fr' ? 'naviguer' : 'navigate' }}
          </span>
          <span class="hint">
            <kbd>Space</kbd> {{ locale === 'fr' ? 'sélectionner' : 'select' }}
          </span>
          <span class="hint">
            <kbd>Esc</kbd> {{ locale === 'fr' ? 'fermer' : 'close' }}
          </span>
        </div>
        <div class="selected-count">
          {{ store.checkedCount }} {{ locale === 'fr' ? 'sélectionné(s)' : 'selected' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  background: var(--background-color);
  border: 2px solid v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(255, 255, 255, 0.5);
  width: 90%;
  max-width: 700px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
  background: linear-gradient(to bottom, var(--background-color), #f9faf0);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  border: 1px solid #c7c7c7;
  border-radius: 4px;
  background: white;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  box-shadow: 0 0 0 3px v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.2)' : 'rgba(80, 178, 128, 0.2)'");
  border-color: v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
}

.close-button {
  margin-left: 1rem;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #c7c7c7;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  scroll-behavior: smooth;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin: 0.25rem 0;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.search-item:hover {
  background: v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.05)' : 'rgba(80, 178, 128, 0.05)'");
}

.search-item.selected {
  background: v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.1)' : 'rgba(80, 178, 128, 0.1)'");
  border-color: v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
}

.search-item.checked {
  background: v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.15)' : 'rgba(80, 178, 128, 0.15)'");
}

.check-area {
  width: 20px;
  min-width: 20px;
  height: 20px;
  margin-right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
}

.item-icon {
  width: 52px;
  height: 48px;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: visible;
  padding: 4px;
}

.item-icon img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.icon-placeholder {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.item-name {
  font-weight: 600;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-chip {
  padding: 0.1rem 0.2rem;
  background: v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.1)' : 'rgba(80, 178, 128, 0.1)'");
  border: 1px solid v-bind("locale === 'fr' ? 'rgba(178, 131, 80, 0.3)' : 'rgba(80, 178, 128, 0.3)'");
  border-radius: 4px;
  color: v-bind("locale === 'fr' ? '#8b6540' : '#408b60'");
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.item-description {
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-shortcuts {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.shortcut {
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.shortcut-text {
  color: #666;
  font-size: 0.85rem;
}

.search-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 2px solid v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
  background: linear-gradient(to top, var(--background-color), #f9faf0);
}

.footer-hints {
  display: flex;
  gap: 1rem;
}

.hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.9rem;
}

.hint kbd {
  padding: 0.2rem 0.4rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.selected-count {
  font-weight: 600;
  color: v-bind("locale === 'fr' ? '#b28350' : '#50b280'");
}

@media (max-width: 600px) {
  .search-modal {
    max-width: 95%;
    max-height: 80vh;
  }

  .item-icon {
    width: 36px;
    height: 36px;
  }

  .item-shortcuts {
    display: none;
  }

  .footer-hints {
    display: none;
  }
}
</style>
