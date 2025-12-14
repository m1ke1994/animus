<script setup lang="ts">
import { computed, ref } from "vue"

type Scenario = {
  id: string
  name: string
  goal: string
  owner: string
  status: "running" | "scheduled" | "paused"
  impact: "low" | "medium" | "high"
  next_run: string
}

type Run = {
  id: string
  title: string
  tone: "ok" | "warn" | "fail"
  meta: string
}

const isAutoRefresh = ref(true)
const dryRun = ref(true)
const lastSync = ref("только что")

const scenarios = ref<Scenario[]>([
  {
    id: "sc_1",
    name: "Chaos drill / api-gateway",
    goal: "Имитировать 20% отказа upstream",
    owner: "platform",
    status: "running",
    impact: "medium",
    next_run: "идёт сейчас",
  },
  {
    id: "sc_2",
    name: "Traffic spike / billing",
    goal: "x3 нагрузка + задержки очередей",
    owner: "billing",
    status: "scheduled",
    impact: "high",
    next_run: "14:30 · сегодня",
  },
  {
    id: "sc_3",
    name: "Data corruption / ml-features",
    goal: "0.5% bad rows + дрифт схемы",
    owner: "ml",
    status: "paused",
    impact: "medium",
    next_run: "пауза",
  },
  {
    id: "sc_4",
    name: "Cold start / sensors",
    goal: "Рестарт сенсоров по регионам",
    owner: "edge",
    status: "scheduled",
    impact: "low",
    next_run: "16:00 · сегодня",
  },
])

const recentRuns = ref<Run[]>([
  { id: "r1", tone: "ok", title: "Chaos drill завершён", meta: "12:02 · SLA 99.92%" },
  { id: "r2", tone: "warn", title: "Spike: DLQ вырос на 12", meta: "11:48 · billing" },
  { id: "r3", tone: "fail", title: "FAILED TO FETCH метрики памяти", meta: "11:32 · retry 15s" },
  { id: "r4", tone: "ok", title: "Cold start прогнан на eu-north", meta: "10:58 · sensors" },
])

const launchForm = ref({
  scenario: "Chaos drill / api-gateway",
  traffic: 120,
  duration: 15,
  chaos: "latency + packet loss",
  notify: true,
})

const metrics = computed(() => {
  const running = scenarios.value.filter(s => s.status === "running").length
  const scheduled = scenarios.value.filter(s => s.status === "scheduled").length
  const paused = scenarios.value.filter(s => s.status === "paused").length
  const highImpact = scenarios.value.filter(s => s.impact === "high").length
  return { running, scheduled, paused, highImpact }
})

const statusPill = (s: Scenario["status"]) => {
  if (s === "running") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
  if (s === "scheduled") return "bg-amber-400/15 text-amber-700 border-amber-400/25"
  return "bg-slate-500/15 text-slate-700 border-slate-500/25"
}
const statusLabel = (s: Scenario["status"]) => {
  if (s === "running") return "RUNNING"
  if (s === "scheduled") return "SCHEDULED"
  return "PAUSED"
}

const toneDot = (t: Run["tone"]) => {
  if (t === "ok") return "bg-emerald-500 shadow-emerald-200"
  if (t === "warn") return "bg-amber-400 shadow-amber-200"
  return "bg-rose-500 shadow-rose-200"
}
</script>

<template>
  <div
    class="relative h-[96vh] w-full text-slate-900 bg-white/30 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/25 shadow-lg shadow-white/10">
    <div class="mx-auto h-full max-w-7xl px-4 py-3 flex flex-col gap-3 overflow-hidden">
      <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">
        Главная · <span class="text-slate-500 font-medium">Симуляции</span>
      </div>

      <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Симуляции и отказы
          </h1>
          <p class="mt-1 text-sm text-slate-500 max-w-2xl">
            Chaos drills, спайки трафика и проверки деградаций без реального инцидента.
          </p>
          <p class="mt-0.5 text-xs text-slate-400">
            Последняя синхронизация: <span class="font-medium text-slate-500">{{ lastSync }}</span>
          </p>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <label
            class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-3 py-1.5 text-xs text-slate-600 shadow-sm cursor-pointer">
            <span>Dry-run</span>
            <span class="relative inline-flex h-5 w-9 items-center rounded-full transition"
              :class="dryRun ? 'bg-emerald-500/80' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 rounded-full bg-white shadow transform transition"
                :class="dryRun ? 'translate-x-4' : 'translate-x-1'" />
            </span>
            <input type="checkbox" class="hidden" v-model="dryRun" />
          </label>

          <label
            class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-3 py-1.5 text-xs text-slate-600 shadow-sm cursor-pointer">
            <span>Авто</span>
            <span class="relative inline-flex h-5 w-9 items-center rounded-full transition"
              :class="isAutoRefresh ? 'bg-emerald-500/80' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 rounded-full bg-white shadow transform transition"
                :class="isAutoRefresh ? 'translate-x-4' : 'translate-x-1'" />
            </span>
            <input type="checkbox" class="hidden" v-model="isAutoRefresh" />
          </label>

          <button
            class="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition">
            <span class="i-tabler-refresh-cw" />
            Обновить
          </button>
        </div>
      </div>

      <div class="grid gap-2.5 md:grid-cols-4 shrink-0">
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Running</div>
          <div class="mt-1.5 text-2xl font-semibold text-emerald-600">{{ metrics.running }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Идут прямо сейчас</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Scheduled</div>
          <div class="mt-1.5 text-2xl font-semibold text-amber-600">{{ metrics.scheduled }}</div>
          <p class="mt-0.5 text-xs text-slate-400">В очереди</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Paused</div>
          <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ metrics.paused }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Можно возобновить</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">High impact</div>
          <div class="mt-1.5 text-2xl font-semibold text-rose-500">{{ metrics.highImpact }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Требуют чётких guardrails</p>
        </div>
      </div>

      <div class="flex-1 min-h-0 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] overflow-hidden">
        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <header class="flex items-center justify-between gap-3 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Сценарии</h2>
              <p class="mt-1 text-xs text-slate-500 max-w-md">
                Табличный список без внутреннего скролла: статус, impact и следующее окно.
              </p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">playbooks</span>
          </header>

          <div class="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/40 bg-white/15">
            <table class="w-full table-fixed text-left text-sm">
              <thead class="bg-white/20 border-b border-white/30">
                <tr class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <th class="px-4 py-3 w-[30%]">Сценарий</th>
                  <th class="px-4 py-3 w-[26%]">Цель</th>
                  <th class="px-4 py-3 w-[18%]">Impact</th>
                  <th class="px-4 py-3 w-[14%]">Next</th>
                  <th class="px-4 py-3 w-[12%]">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in scenarios" :key="s.id" class="border-b border-white/20 hover:bg-white/10 transition">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-slate-800 truncate">{{ s.name }}</div>
                    <div class="text-xs text-slate-400 truncate">owner: {{ s.owner }}</div>
                  </td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ s.goal }}</td>
                  <td class="px-4 py-3 text-slate-700">
                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                      :class="s.impact === 'high'
                          ? 'bg-rose-500/15 text-rose-700 border-rose-500/25'
                          : s.impact === 'medium'
                            ? 'bg-amber-400/15 text-amber-700 border-amber-400/25'
                            : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'">
                      {{ s.impact }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ s.next_run }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                      :class="statusPill(s.status)">
                      {{ statusLabel(s.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="grid gap-2.5 sm:grid-cols-3 shrink-0">
            <button
              class="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition">
              Новый сценарий
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              Запланировать окно
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              Экспорт runbook
            </button>
          </div>
        </section>

        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Запуск</h2>
              <p class="text-xs text-slate-500 mt-1">Быстрый старт с ограничением dry-run.</p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">launch</span>
          </div>

          <div class="rounded-2xl bg-white/15 border border-white/30 p-3 flex flex-col gap-2.5">
            <div class="flex flex-col gap-1.5">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">Scenario</div>
              <select v-model="launchForm.scenario"
                class="h-10 rounded-2xl bg-white/25 border border-white/40 px-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200">
                <option v-for="s in scenarios" :key="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">Traffic %</div>
                <input type="number" v-model="launchForm.traffic"
                  class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">Длительность (мин)</div>
                <input type="number" v-model="launchForm.duration"
                  class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">Chaos</div>
              <input v-model="launchForm.chaos"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <label class="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" v-model="launchForm.notify" class="h-4 w-4 rounded border-slate-300" />
              Уведомить владельцев
            </label>

            <div class="flex gap-2">
              <button
                class="flex-1 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition">
                Запустить
              </button>
              <button
                class="flex-1 rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
                Сохранить как пресет
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-white/20 border border-white/35 p-3">
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">guardrails</div>
            <p class="mt-1 text-xs text-slate-500">
              Dry-run исключает реальную деградацию, но проверяет оркестрацию и мониторинг.
            </p>
          </div>
        </section>
      </div>

      <section
        class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-2 shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">Последние прогоны</h2>
          <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">live log</span>
        </div>

        <div class="grid gap-2 sm:grid-cols-4">
          <div v-for="r in recentRuns" :key="r.id"
            class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
            <div class="mt-1 h-2 w-2 rounded-full shadow-sm" :class="toneDot(r.tone)" />
            <div class="min-w-0">
              <div class="font-medium text-slate-800 truncate">{{ r.title }}</div>
              <div class="text-slate-400 truncate">{{ r.meta }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
