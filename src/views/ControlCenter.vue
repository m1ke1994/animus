<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import ControlCenterCard from "../components/ControlCenterCard.vue";
import NeuronView from "../components/NeuronView.vue";

const items = ["Аналитика", "Пайплайны", "Память", "Симуляции", "Политики", "Сенсоры"];
const routePaths = ["/analytics", "/pipelines", "/memory", "/simulations", "/policies", "/sensors"];
const router = useRouter();

const cards = {
  Аналитика: {
    title: "Аналитика",
    description: "Обзор дашбордов, метрик и ключевых показателей системы.",
    metrics: [
      { label: "Активных отчётов", value: "12" },
      { label: "Обновления", value: "real-time" },
      { label: "SLO", value: "OK" },
    ],
    actions: ["Открыть", "Экспорт"],
  },
  Пайплайны: {
    title: "Пайплайны",
    description: "Загрузка, нормализация и оркестрация потоков данных.",
    metrics: [
      { label: "Запущено", value: "5" },
      { label: "Ошибок", value: "0" },
    ],
    actions: ["Запустить", "Конфигурация"],
  },
  Память: {
    title: "Память",
    description: "Хранилища, кеши и объём доступных ресурсов.",
    metrics: [
      { label: "Занято", value: "62%" },
      { label: "Свободно", value: "38%" },
    ],
    actions: ["Детали", "Очистить"],
  },
  Симуляции: {
    title: "Симуляции",
    description: "What-if сценарии и тестовые прогонки в песочнице.",
    metrics: [
      { label: "Запусков сегодня", value: "3" },
      { label: "Успешность", value: "100%" },
    ],
    actions: ["Запустить", "История"],
  },
  Политики: {
    title: "Политики",
    description: "Правила доступа, качества данных и комплаенса.",
    metrics: [
      { label: "Активных правил", value: "18" },
      { label: "Нарушений", value: "0" },
    ],
    actions: ["Просмотреть", "Редактировать"],
  },
  Сенсоры: {
    title: "Сенсоры",
    description: "Мониторинг сервисов, датчиков и алертинга.",
    metrics: [
      { label: "Онлайн", value: "24" },
      { label: "Аварий", value: "0" },
    ],
    actions: ["Дашборд", "Логи"],
  },
};
const activeItem = ref(items[0]); // текущее выбранное значение (клик)
const displayItem = ref(items[0]); // показываемое значение (ховер/клик)
const displayCard = computed(() => cards[displayItem.value]);
const activeIndex = computed(() => items.indexOf(activeItem.value));

const hoveredIndex = ref<number | null>(null);
const panelRaised = ref(false); // поднимаем панель при клике
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

const registerItemRef = (el: HTMLElement | null, idx: number) => {
  itemRefs.value[idx] = el;
};

const handleHover = (value: string, idx: number) => {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }
  hoveredIndex.value = idx;
  panelRaised.value = false;
  fogOpened.value = false;
  // небольшая задержка перед показом карточки
  hoverTimer.value = window.setTimeout(() => {
    displayItem.value = value;
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
  displayItem.value = value;
  panelRaised.value = true; // поднимаем панель
  fogOpened.value = true; // убираем туман
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
  displayItem.value = activeItem.value;
  fogOpened.value = panelRaised.value;
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
      class="relative z-0 w-[40%] h-[100%] flex items-center justify-center overflow-visible transition-all duration-500"
      :class="{ 'panel-raise': panelRaised }">
      <div class="fog-layer pointer-events-none" :class="{ 'fog-clear': fogOpened }"></div>
      <div
        class="panel-surface w-full rounded-3xl border border-white/5 bg-[#050E16]/80 px-8 py-6 shadow-xl backdrop-blur">
        <h2 class="mb-4 text-3xl font-extrabold tracking-wide text-white">
          {{ displayCard.title }}
        </h2>

        <p class="mb-6 text-sm leading-relaxed text-[#6F8A9C]">
          {{ displayCard.description }}
        </p>

        <div class="mb-6 space-y-1">
          <div v-for="metric in displayCard.metrics" :key="metric.label" class="flex justify-between text-xs">
            <span class="text-[#6F8A9C]">{{ metric.label }}</span>
            <span class="text-white/90">{{ metric.value }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button v-for="action in displayCard.actions" :key="action"
            class="rounded-full border border-[#29506A] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#9EC4E3] transition hover:bg-[#193144]">
            {{ action }}
          </button>
        </div>
      </div>
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
  background: radial-gradient(circle at 30% 30%, rgba(14, 26, 38, 0.4), rgba(5, 14, 22, 0.7));
  backdrop-filter: blur(8px);
  opacity: 1;
  transition: opacity 500ms ease, backdrop-filter 500ms ease;
}

.fog-clear {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.control_center {
  position: relative;
  z-index: 30;
}

.panel-surface {
  position: relative;
  overflow: hidden;
  background: rgba(15, 24, 36, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  box-shadow:
    0 16px 46px rgba(6, 12, 22, 0.55),
    inset 0 0 24px rgba(148, 204, 240, 0.18);
  transition:
    transform 450ms cubic-bezier(0.19, 1, 0.22, 1),
    box-shadow 450ms ease,
    border-color 450ms ease,
    background-color 450ms ease;
}

.panel-surface::after {
  content: "";
  position: absolute;
  inset: -20% -10%;
  background: radial-gradient(circle at 30% 30%, rgba(140, 207, 255, 0.18), transparent 45%),
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
  background: linear-gradient(115deg, rgba(180, 240, 255, 0.25), rgba(100, 180, 230, 0) 40%);
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

.panel-raise .panel-surface {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 18px 46px rgba(5, 12, 20, 0.68),
    inset 0 0 28px rgba(148, 204, 240, 0.26);
  border-color: rgba(124, 180, 220, 0.5);
  background: rgba(10, 18, 30, 0.52);
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






