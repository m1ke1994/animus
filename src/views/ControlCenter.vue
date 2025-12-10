<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import ControlCenterCard from "../components/ControlCenterCard.vue";
import NeuronView from "../components/NeuronView.vue";

const items = ["Аналитика", "Пайплайны", "Память", "Симуляции", "Политики", "Сенсоры"];

const cards = {
  Аналитика: {
    title: "Аналитика",
    description:
      "Бэклог outbox и DLQ в реальном времени. Следим за лагом, SLA и ретраями, чтобы цепочки ADL оставались устойчивыми.",
    metrics: [
      { label: "Готовые события", value: "0" },
      { label: "Плановые", value: "0" },
      { label: "SLO", value: "OK" },
      { label: "DLQ backlog", value: "—" },
      { label: "Ops SLO", value: "—" },
    ],
    actions: ["OUTBOX", "DLQ"],
  },
  Пайплайны: {
    title: "Пайплайны",
    description: "Ingest, normalize, label. Проверяем задержки и стабильность, подсвечиваем узкие места и ретраи.",
    metrics: [
      { label: "Активные пайплайны", value: "—" },
      { label: "Скорость приёма", value: "—" },
    ],
    actions: ["Профиль", "Запуски"],
  },
  Память: {
    title: "Память",
    description: "Coverage сигналов и remediation. Следим за полнотой данных и точками восстановления.",
    metrics: [
      { label: "Доступность", value: "—" },
      { label: "min_count", value: "—" },
    ],
    actions: ["Просмотр", "История"],
  },
  Симуляции: {
    title: "Симуляции",
    description: "Стенды what-if и sandbox. Запускаем сценарии и проверяем устойчивость изменений.",
    metrics: [
      { label: "Активные симуляции", value: "0" },
      { label: "Очередь сценариев", value: "0" },
    ],
    actions: ["Новый запуск"],
  },
  Политики: {
    title: "Политики",
    description: "Политики SLO/PII/License и стабильность ретраев. Контролируем соответствие и оповещения.",
    metrics: [
      { label: "Lag", value: "—" },
      { label: "Нарушения", value: "0" },
      { label: "Ops", value: "0" },
      { label: "Ops SLO", value: "—" },
    ],
    actions: ["Настройка", "OUTBOX"],
  },
  Сенсоры: {
    title: "Сенсоры",
    description: "Состояние MinIO, Postgres и прочих хранилищ. Отслеживаем health-checks и реакцию на сбои.",
    metrics: [
      { label: "Outbox lag", value: "<1s" },
      { label: "Ошибки", value: "—" },
      { label: "In-flight ops", value: "0" },
    ],
    actions: ["SMOKE TEST", "OBSERVABILITY", "OUTBOX"],
  },
};

const activeItem = ref(items[0]);
const activeCard = computed(() => cards[activeItem.value]);
const hoveredIndex = ref<number | null>(null);
const panelAnimKey = ref(0);
const rightColRef = ref<HTMLElement | null>(null);
const cardRef = ref<HTMLElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);
const lines = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
const beadSteps = [0.25, 0.5, 0.75];

const registerItemRef = (el: HTMLElement | null, idx: number) => {
  itemRefs.value[idx] = el;
};

const handleSelect = (value: string, idx: number) => {
  activeItem.value = value;
  hoveredIndex.value = idx;
  panelAnimKey.value += 1;
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
  <div class="control_center flex h-full justify-between items-center">
    <div class="relative z-0 w-[40%] h-[100%] flex items-center justify-center overflow-visible">
      <Transition name="panel-slide" mode="out-in">
        <div
          :key="panelAnimKey"
          class="w-full rounded-3xl border border-white/5 bg-[#050E16]/80 px-8 py-6 shadow-xl backdrop-blur"
        >
          <h2 class="mb-4 text-3xl font-extrabold tracking-wide text-white">
            {{ activeCard.title }}
          </h2>

          <p class="mb-6 text-sm leading-relaxed text-[#6F8A9C]">
            {{ activeCard.description }}
          </p>

          <div class="mb-6 space-y-1">
            <div v-for="metric in activeCard.metrics" :key="metric.label" class="flex justify-between text-xs">
              <span class="text-[#6F8A9C]">{{ metric.label }}</span>
              <span class="text-white/90">{{ metric.value }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              v-for="action in activeCard.actions"
              :key="action"
              class="rounded-full border border-[#29506A] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#9EC4E3] transition hover:bg-[#193144]"
            >
              {{ action }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div
      ref="rightColRef"
      class="relative z-20 w-[40%] h-full flex flex-col items-center justify-start gap-8"
    >
      <div class="pointer-events-none absolute inset-0">
        <svg v-if="lines.length" class="h-full w-full" fill="none">
          <line
            v-for="(line, idx) in lines"
            :key="`line-${idx}`"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            stroke-linecap="round"
            :stroke="hoveredIndex === idx ? '#9ad7f4' : 'rgba(109,152,177,0.45)'"
            :stroke-width="hoveredIndex === idx ? 3 : 1.5"
            class="transition-all duration-200"
          />
          <template v-for="(line, idx) in lines" :key="`beads-${idx}`">
            <circle
              v-for="step in beadSteps"
              :key="`bead-${idx}-${step}`"
              :cx="line.x1 + (line.x2 - line.x1) * step"
              :cy="line.y1 + (line.y2 - line.y1) * step"
              :r="hoveredIndex === idx ? 5 : 3.5"
              :fill="hoveredIndex === idx ? '#b9e6ff' : 'rgba(154,215,244,0.65)'"
              class="transition-all duration-200 drop-shadow-sm"
            />
          </template>
        </svg>
      </div>

      <div ref="cardRef" class="w-full max-w-[280px] flex justify-center">
        <ControlCenterCard />
      </div>

      <div class="flex flex-col items-start w-full max-w-[280px] gap-4">
        <div
          v-for="(value, idx) in items"
          :key="value"
          class="group grid cursor-pointer w-full grid-cols-[70px,auto] items-center gap-4"
          @mouseenter="handleSelect(value, idx)"
          @click="handleSelect(value, idx)"
        >
          <div
            :ref="(el) => registerItemRef(el as HTMLElement | null, idx)"
            class="flex h-[70px] w-[70px] items-center justify-center transform transition-transform duration-200 group-hover:scale-110"
          >
            <NeuronView />
          </div>

          <p
            class="transform origin-left text-lg font-bold leading-tight text-[#23313b] transition-all duration-200 group-hover:scale-110 group-hover:text-[#284355]"
          >
            {{ value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 350ms ease, opacity 350ms ease, filter 350ms ease;
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(-60px);
  filter: blur(6px);
}
.panel-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}
.panel-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(60px);
  filter: blur(6px);
}
</style>
