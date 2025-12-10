<script setup>
import { ref, computed } from "vue";
import ControlCenterCard from "../components/ControlCenterCard.vue";
import NeuronView from "../components/NeuronView.vue";

const items = [
  "Аналитика",
  "Пайплайны",
  "Память",
  "Симуляции",
  "Политики",
  "Сенсоры",
];

// данные для левой карточки
const cards = {
  Аналитика: {
    title: "АНАЛИТИКА",
    description:
      "Бэклог outbox и DLQ в реальном времени. Следим за лагом, SLA и ретраями, чтобы пайплайны ADL оставались устойчивыми.",
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
    title: "ПАЙПЛАЙНЫ",
    description:
      "Оркестрация ingest → normalize → label. Отслеживаем свежие релизы и операции, чтобы быстро реагировать на регрессии.",
    metrics: [
      { label: "Последний релиз", value: "—" },
      { label: "Сборка", value: "Нет релизов" },
    ],
    actions: ["КАТАЛОГ РЕЛИЗОВ"],
  },
  Память: {
    title: "ПАМЯТЬ",
    description:
      "Управление coverage-контрактами и прогоном авто-remediation. Обеспечиваем баланс классов и языков в датасетах.",
    metrics: [
      { label: "Контракт", value: "—" },
      { label: "min_count", value: "—" },
    ],
    actions: ["КОНТРАКТЫ", "РЕЛИЗЫ"],
  },
  Симуляции: {
    title: "СИМУЛЯЦИИ",
    description:
      "Песочница для тестирования правил и what-if сценариев. Используйте sandbox режим перед продакшеном.",
    metrics: [
      { label: "Активных правил", value: "0" },
      { label: "Всего правил", value: "0" },
    ],
    actions: ["ЖУРНАЛ ПРАВИЛ"],
  },
  Политики: {
    title: "ПОЛИТИКИ",
    description:
      "Применение SLO/PII/License политик и аудит изменений. Здесь живут решения по выпуску и блокировке релизов.",
    metrics: [
      { label: "Lag", value: "SLO в норме" },
      { label: "Релизов в каталоге", value: "0" },
      { label: "Ops ошибки", value: "0" },
      { label: "Ops SLO", value: "—" },
    ],
    actions: ["ПАНЕЛЬ SLO", "OUTBOX МОНИТОРИНГ"],
  },
  Сенсоры: {
    title: "СЕНСОРЫ",
    description:
      "Телеметрия MinIO, Postgres и воркеров. Следим за готовностью источников и health-checks всей платформы.",
    metrics: [
      { label: "Outbox lag", value: "<1s" },
      { label: "Обновлено", value: "—" },
      { label: "In-flight ops", value: "0" },
    ],
    actions: ["SMOKE TEST", "OBSERVABILITY", "OUTBOX"],
  },
};

const activeItem = ref(items[0]);
const activeCard = computed(() => cards[activeItem.value]);
</script>

<template>
  <div class="control_center flex h-full justify-between items-center">
    <!-- ЛЕВАЯ КОЛОНКА: динамическая карточка -->
    <div class="w-[40%] h-[100%] flex items-center justify-center">
      <div
        class="w-full rounded-3xl border border-white/5 bg-[#050E16]/80 px-8 py-6 shadow-xl backdrop-blur"
      >
        <h2 class="mb-4 text-3xl font-extrabold tracking-wide text-white">
          {{ activeCard.title }}
        </h2>

        <p class="mb-6 text-sm leading-relaxed text-[#6F8A9C]">
          {{ activeCard.description }}
        </p>

        <div class="mb-6 space-y-1">
          <div
            v-for="metric in activeCard.metrics"
            :key="metric.label"
            class="flex justify-between text-xs"
          >
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
    </div>

    <!-- ПРАВАЯ КОЛОНКА: ControlCenterCard + список нейронов -->
   <!-- ПРАВАЯ КОЛОНКА: ControlCenterCard + список нейронов -->
<div
  class="w-[40%] h-full flex flex-col items-center justify-center gap-8"
>
  <!-- ControlCenterCard сверху по центру -->
  <div class="flex justify-center">
    <ControlCenterCard />
  </div>

  <!-- меню с нейронами строго под ним и по центру -->
  <div class="flex flex-col items-center w-full gap-4">
    <div
      v-for="value in items"
      :key="value"
      class="group flex cursor-pointer items-center gap-4"
      @mouseenter="activeItem = value"
    >
      <div
        class="w-[70px] transform transition-transform duration-200 group-hover:scale-110"
      >
        <NeuronView />
      </div>

      <p
        class="transform origin-left text-lg font-bold text-[#23313b] transition-all duration-200 group-hover:scale-110 group-hover:text-[#284355]"
      >
        {{ value }}
      </p>
    </div>
  </div>
</div>

  </div>
</template>

<style scoped>
</style>
