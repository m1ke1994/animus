<!-- ControlCenter.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import ControlCenterCard from "../components/ControlCenterCard.vue";
import NeuronView from "../components/NeuronView.vue";

// если картинка лежит в public/screen/analytics.jpeg
const analyticsPreviewImg = `${import.meta.env.BASE_URL}screen/analytics.jpeg`;

const items = ["Аналитика", "Пайплайны", "Память", "Симуляции", "Политики", "Сенсоры"];
const routePaths = ["/analytics", "/pipelines", "/memory", "/simulations", "/policies", "/sensors"];
const router = useRouter();

const activeItem = ref(items[0]);
const displayItem = ref("");
const activeIndex = computed(() => items.indexOf(activeItem.value));

const hoveredIndex = ref<number | null>(null);
const panelRaised = ref(false);
const fogOpened = ref(false);

const highlightedIndex = computed(() =>
  hoveredIndex.value !== null ? hoveredIndex.value : activeIndex.value
);

const hoverTimer = ref<number | null>(null);

const rightColRef = ref<HTMLElement | null>(null);
const cardRef = ref<HTMLElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);
const lines = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
const beadSteps = [0.25, 0.5, 0.75];


// наведен ли сейчас пункт "Аналитика"
const isAnalyticsHovered = computed(
  () => hoveredIndex.value !== null && items[hoveredIndex.value] === "Аналитика"
);

// превью аналитики работает ТОЛЬКО от hover
const showAnalyticsPreview = computed(() => isAnalyticsHovered.value);

const registerItemRef = (el: HTMLElement | null, idx: number) => {
  itemRefs.value[idx] = el;
};

// если превью показывается — очищаем туман; как только нет превью — возвращаем туман
watch(showAnalyticsPreview, (val) => {
  fogOpened.value = val;
});

const handleHover = (value: string, idx: number) => {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }

  hoveredIndex.value = idx;
  panelRaised.value = false;
  fogOpened.value = false;

  hoverTimer.value = window.setTimeout(() => {
    displayItem.value = value === "Аналитика" ? value : "";
    hoverTimer.value = null;
    nextTick(updateLines);
  }, 300);
};

const handleSelect = (value: string, idx: number) => {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }

  activeItem.value = value;
  hoveredIndex.value = null;
  displayItem.value = value === "Аналитика" ? value : "";
  panelRaised.value = true; // поднимаем панель
  // туман кликом не трогаем

  const targetPath = routePaths[idx];
  if (targetPath) {
    void router.push(targetPath);
  }
  nextTick(updateLines);
};

const handleLeave = () => {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }

  hoveredIndex.value = null;
  displayItem.value = activeItem.value === "Аналитика" ? activeItem.value : "";

  // как только курсор ушёл — туман всегда возвращаем
  fogOpened.value = false;

  nextTick(updateLines);
};

const updateLines = () => {
  const colEl = rightColRef.value;
  const cardEl = cardRef.value;
  if (!colEl || !cardEl) return;

  const colRect = colEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const cardCenter = {
    x: cardRect.left + cardRect.width / 2 - colRect.left,
    y: cardRect.top + cardRect.height / 2 - colRect.top,
  };

  lines.value = itemRefs.value.map((el) => {
    if (!el) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x1: cardCenter.x,
      y1: cardCenter.y,
      x2: rect.left + rect.width / 2 - colRect.left,
      y2: rect.top + rect.height / 2 - colRect.top,
    };
  });
};

onMounted(() => {
  nextTick(updateLines);
  window.addEventListener("resize", updateLines);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateLines);
});
</script>

<template>
  <div class="control_center flex h-full justify-between items-center relative z-30">
    <div
      class="relative z-20 w-[40%] h-[100%] min-h-[360px] flex items-center justify-center overflow-visible transition-all duration-500"
      :class="{ 'panel-raise': panelRaised }">
      <!-- превью аналитики только при hover + анимация выезда слева -->
      <Transition name="analytics-slide">
        <div v-if="showAnalyticsPreview" class="analytics-preview z-20">
          <img :src="analyticsPreviewImg" alt="Предпросмотр аналитики" class="preview-image" />
        </div>
      </Transition>

      <div class="fog-layer pointer-events-none z-10" :class="{ 'fog-clear': fogOpened }"></div>
    </div>

    <div ref="rightColRef" class="relative z-20 w-[40%] h-full flex flex-col items-center justify-start gap-8">
      <div class="pointer-events-none absolute inset-0">
        <svg v-if="lines.length" class="h-full w-full" fill="none">
          <line v-for="(line, idx) in lines" :key="`line-${idx}`" :x1="line.x1" :y1="line.y1" :x2="line.x2"
            :y2="line.y2" stroke-linecap="round"
            :stroke="highlightedIndex === idx ? '#9ad7f4' : 'rgba(109,152,177,0.45)'"
            :stroke-width="highlightedIndex === idx ? 3 : 1.5" class="transition-all duration-200" />
          <template v-for="(line, idx) in lines" :key="`beads-${idx}`">
            <circle v-for="step in beadSteps" :key="`bead-${idx}-${step}`" :cx="line.x1 + (line.x2 - line.x1) * step"
              :cy="line.y1 + (line.y2 - line.y1) * step" :r="highlightedIndex === idx ? 5 : 3.5"
              :fill="highlightedIndex === idx ? '#b9e6ff' : 'rgba(154,215,244,0.65)'"
              class="transition-all duration-200 drop-shadow-sm" />
          </template>
        </svg>
      </div>

      <div ref="cardRef" class="w-full max-w-[280px] flex justify-center">
        <ControlCenterCard />
      </div>

      <div class="flex flex-col items-start w-full max-w-[280px] gap-4">
        <div v-for="(value, idx) in items" :key="value"
          class="group grid cursor-pointer w-full grid-cols-[70px,auto] items-center gap-4"
          @mouseenter="handleHover(value, idx)" @mouseleave="handleLeave" @click="handleSelect(value, idx)">
          <div :ref="(el) => registerItemRef(el as HTMLElement | null, idx)"
            class="flex h-[70px] w-[70px] items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
            <NeuronView :highlight="highlightedIndex === idx" />
          </div>

          <p
            class="transform origin-left text-lg font-bold leading-tight text-[#23313b] transition-all duration-200 group-hover:scale-110 group-hover:text-[#284355]">
            {{ value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-raise {
  z-index: 30;
  filter: drop-shadow(0 14px 32px rgba(10, 20, 30, 0.6));
}

.fog-layer {
  position: absolute;
  inset: 0;
  opacity: 1;
  transition: opacity 500ms ease, backdrop-filter 500ms ease;
}

.fog-clear {
  opacity: 0;
}

.control_center {
  position: relative;
  z-index: 30;
}

.analytics-preview {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
}

/* Анимация выезда изображения слева */
.analytics-slide-enter-from,
.analytics-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.analytics-slide-enter-to,
.analytics-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.analytics-slide-enter-active,
.analytics-slide-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.preview-image {
  max-width: 200%;
  max-height: 200%;
  object-fit: contain;
  border-radius: 12px;
  opacity: 0.25;
  border-radius: 40px;
}

.panel-surface::after {
  content: "";
  position: absolute;
  inset: -20% -10%;
  background:
    radial-gradient(circle at 30% 30%, rgba(140, 207, 255, 0.18), transparent 45%),
    radial-gradient(circle at 70% 10%, rgba(70, 140, 200, 0.2), transparent 50%),
    linear-gradient(120deg, rgba(138, 199, 236, 0.08), rgba(34, 65, 98, 0));
  opacity: 0;
  transform: translateY(10%);
  transition: opacity 500ms ease, transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.panel-surface::before {
  content: "";
  position: absolute;
  inset: -30% -30%;
  background: linear-gradient(115deg,
      rgba(180, 240, 255, 0.25),
      rgba(100, 180, 230, 0) 40%);
  opacity: 0;
  transform: translateX(-30%) skewX(-10deg);
  filter: blur(18px);
  transition: opacity 600ms ease, transform 900ms cubic-bezier(0.2, 0.9, 0.2, 1.05);
  pointer-events: none;
}

.panel-raise .panel-surface::after {
  opacity: 1;
  transform: translateY(0);
}

.panel-raise .panel-surface::before {
  opacity: 1;
  transform: translateX(20%) skewX(0deg);
  animation: sweep 1300ms cubic-bezier(0.2, 0.9, 0.2, 1.05) forwards;
}

@keyframes sweep {
  0% {
    opacity: 0.9;
    transform: translateX(-40%) skewX(-12deg);
  }

  50% {
    opacity: 0.5;
    transform: translateX(10%) skewX(-4deg);
  }

  100% {
    opacity: 0;
    transform: translateX(60%) skewX(0deg);
  }
}
</style>
