<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

type ContractRule = {
  id: string
  name: string
  dataset: string
  required_cells: number
  min_coverage: number
  current_coverage: number
  owners: string[]
  updated_at: string
  status: "ok" | "warn" | "fail"
}

type CoverageEvent = {
  id: string
  tone: "ok" | "warn" | "fail"
  title: string
  meta: string
}

const range = ref<"1h" | "24h" | "7d">("24h")
const isAutoRefresh = ref(true)
const lastSync = ref("только что")

// имитация API-ошибки (для проверки дизайна)
const fetchFailed = ref(false)

// имитационные данные
const contracts = ref<ContractRule[]>([
  {
    id: "ctr_9fa1",
    name: "coverage.users.profile",
    dataset: "users-prod",
    required_cells: 18,
    min_coverage: 97,
    current_coverage: 96.1,
    owners: ["analytics", "ml"],
    updated_at: "2025-04-19 12:03",
    status: "warn",
  },
  {
    id: "ctr_83bc",
    name: "coverage.billing.core",
    dataset: "billing-core",
    required_cells: 24,
    min_coverage: 98,
    current_coverage: 98.4,
    owners: ["billing"],
    updated_at: "2025-04-19 11:42",
    status: "ok",
  },
  {
    id: "ctr_71aa",
    name: "coverage.events.raw",
    dataset: "events-raw",
    required_cells: 12,
    min_coverage: 95,
    current_coverage: 92.8,
    owners: ["analytics"],
    updated_at: "2025-04-19 10:18",
    status: "fail",
  },
  {
    id: "ctr_55de",
    name: "coverage.ml.features",
    dataset: "ml-features",
    required_cells: 16,
    min_coverage: 90,
    current_coverage: 90.7,
    owners: ["ml"],
    updated_at: "2025-04-19 09:10",
    status: "ok",
  },
  {
    id: "ctr_41ef",
    name: "coverage.release.publish",
    dataset: "default",
    required_cells: 8,
    min_coverage: 99,
    current_coverage: 97.9,
    owners: ["platform"],
    updated_at: "2025-04-18 22:55",
    status: "warn",
  },
])

const events = ref<CoverageEvent[]>([
  {
    id: "ev1",
    tone: "ok",
    title: "Пересчёт покрытий завершён успешно",
    meta: "12:03 · users-prod",
  },
  {
    id: "ev2",
    tone: "warn",
    title: "WARN: coverage.users.profile близко к min",
    meta: "11:47 · delta -0.9%",
  },
  {
    id: "ev3",
    tone: "fail",
    title: "FAILED TO FETCH при загрузке политики",
    meta: "11:32 · retry через 15 секунд",
  },
])

const filteredContracts = computed(() => (fetchFailed.value ? [] : contracts.value))
const contractsPreview = computed(() => filteredContracts.value.slice(0, 4)) // ✅ чтобы всё влезало без скрола

const totals = computed(() => {
  if (fetchFailed.value) {
    return {
      total: 0,
      requiredCells: 0,
      avgCoverage: "—",
      blocking: 0,
    }
  }
  const total = filteredContracts.value.length
  const requiredCells = filteredContracts.value.reduce((s, x) => s + x.required_cells, 0)
  const avg =
    total === 0
      ? "—"
      : (filteredContracts.value.reduce((s, x) => s + x.current_coverage, 0) / total).toFixed(2) + "%"
  const blocking = filteredContracts.value.filter(x => x.current_coverage < x.min_coverage).length
  return { total, requiredCells, avgCoverage: avg, blocking }
})

const statusPill = (s: ContractRule["status"]) => {
  if (s === "ok") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
  if (s === "warn") return "bg-amber-400/15 text-amber-700 border-amber-400/25"
  return "bg-rose-500/15 text-rose-700 border-rose-500/25"
}
const statusLabel = (s: ContractRule["status"]) => {
  if (s === "ok") return "OK"
  if (s === "warn") return "WARN"
  return "FAIL"
}

const coverageTone = (c: ContractRule) => {
  if (c.current_coverage < c.min_coverage) return "text-rose-600"
  if (c.current_coverage < c.min_coverage + 1) return "text-amber-600"
  return "text-emerald-600"
}

const dotTone = (t: CoverageEvent["tone"]) => {
  if (t === "ok") return "bg-emerald-500 shadow-emerald-200"
  if (t === "warn") return "bg-amber-400 shadow-amber-200"
  return "bg-rose-500 shadow-rose-200"
}

onMounted(() => {
  setInterval(() => {
    if (!isAutoRefresh.value) return
    lastSync.value = "несколько секунд назад"
  }, 8000)
})
</script>

<template>
  <div
    class="relative h-[96vh] w-full text-slate-900 bg-white/30 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/25 shadow-lg shadow-white/10">
    <!-- ✅ ГЛАВНОЕ: никаких наездов -> только flex-col + min-h-0 -->
    <div class="mx-auto h-full max-w-7xl px-4 py-3 flex flex-col gap-3 overflow-hidden">
      <!-- Хлебные крошки -->
      <div class="text-xs uppercase tracking-[0.2em] text-slate-400 shrink-0">
        Главная · <span class="text-slate-500 font-medium">Контракты</span>
      </div>

      <!-- Заголовок + контролы -->
      <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between shrink-0">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Coverage контракты
          </h1>
          <p class="mt-1 text-sm text-slate-500 max-w-2xl">
            Минимальные проценты, обязательные ячейки и правила блокировки релиза.
          </p>
          <p class="mt-0.5 text-xs text-slate-400">
            Обновление каждые 15 секунд · Последняя синхронизация:
            <span class="font-medium text-slate-500">{{ lastSync }}</span>
          </p>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-1.5 py-1 shadow-sm">
            <button class="px-3 py-1.5 text-xs rounded-full transition hover:bg-slate-100"
              :class="range === '1h' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'" @click="range = '1h'">
              1 час
            </button>
            <button class="px-3 py-1.5 text-xs rounded-full transition hover:bg-slate-100"
              :class="range === '24h' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'" @click="range = '24h'">
              24 часа
            </button>
            <button class="px-3 py-1.5 text-xs rounded-full transition hover:bg-slate-100"
              :class="range === '7d' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'" @click="range = '7d'">
              7 дней
            </button>
          </div>

          <div class="flex items-center justify-end gap-2">
            <label
              class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-3 py-1.5 text-xs text-slate-600 shadow-sm cursor-pointer">
              <span>Автообновление</span>
              <span class="relative inline-flex h-5 w-9 items-center rounded-full transition"
                :class="isAutoRefresh ? 'bg-emerald-500/80' : 'bg-slate-200'">
                <span class="inline-block h-4 w-4 rounded-full bg-white shadow transform transition"
                  :class="isAutoRefresh ? 'translate-x-4' : 'translate-x-1'" />
              </span>
              <input type="checkbox" class="hidden" v-model="isAutoRefresh" />
            </label>

            <button
              class="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition"
              @click="fetchFailed = !fetchFailed" title="Имитация: OK / FAILED TO FETCH">
              <span class="i-tabler-refresh-cw" />
              Обновить
            </button>
          </div>
        </div>
      </div>

      <!-- ✅ ОСНОВНОЙ КОНТЕНТ: занимает остаток, без скрола и без наездов -->
      <div class="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
        <!-- Метрики -->
        <div class="grid gap-2.5 md:grid-cols-4 shrink-0">
          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Всего контрактов</div>
            <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ totals.total }}</div>
            <p class="mt-0.5 text-xs text-slate-400">В реестре coverage-правил</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Обязательные ячейки</div>
            <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ totals.requiredCells }}</div>
            <p class="mt-0.5 text-xs text-slate-400">Суммарно required_cells</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Среднее покрытие</div>
            <div class="mt-1.5 text-2xl font-semibold text-emerald-600">{{ totals.avgCoverage }}</div>
            <p class="mt-0.5 text-xs text-slate-400">Среднее по датасетам</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Блокирует релиз</div>
            <div class="mt-1.5 text-2xl font-semibold" :class="totals.blocking ? 'text-rose-500' : 'text-amber-500'">
              {{ totals.blocking }}
            </div>
            <p class="mt-0.5 text-xs text-slate-400">Где current &lt; min</p>
          </div>
        </div>

        <!-- 2 панели: Реестр + Политика -->
        <div class="grid gap-3 xl:grid-cols-2 flex-1 min-h-0 overflow-hidden">
          <!-- Реестр -->
          <section
            class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
            <header class="flex items-center justify-between gap-3 shrink-0">
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-slate-900">Реестр контрактов</h2>
                <p class="mt-1 text-xs text-slate-500 max-w-sm">
                  Preview (4 строки), чтобы всё помещалось без скрола.
                </p>
              </div>

              <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">registry</span>
            </header>

            <div class="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/40 bg-white/15">
              <div v-if="fetchFailed" class="h-full flex flex-col items-center justify-center gap-2 p-6">
                <div class="text-sm font-semibold text-slate-700">Не удалось загрузить контракты.</div>
                <div class="text-xs text-slate-500">FAILED TO FETCH</div>
              </div>

              <div v-else class="h-full overflow-hidden">
                <!-- ✅ table-fixed + truncate = ничего не раздвигает и не наезжает -->
                <table class="w-full table-fixed text-left text-sm">
                  <thead class="bg-white/20 border-b border-white/30">
                    <tr class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      <th class="px-4 py-3 w-[38%]">Контракт</th>
                      <th class="px-4 py-3 w-[18%]">Dataset</th>
                      <th class="px-4 py-3 w-[22%]">Coverage</th>
                      <th class="px-4 py-3 w-[12%]">Req</th>
                      <th class="px-4 py-3 w-[10%]">Статус</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="c in contractsPreview" :key="c.id"
                      class="border-b border-white/20 hover:bg-white/10 transition">
                      <td class="px-4 py-3">
                        <div class="font-semibold text-slate-800 truncate">{{ c.name }}</div>
                        <div class="text-xs text-slate-400 truncate">{{ c.updated_at }}</div>
                      </td>

                      <td class="px-4 py-3 text-slate-700 truncate">{{ c.dataset }}</td>

                      <td class="px-4 py-3">
                        <div class="font-semibold truncate" :class="coverageTone(c)">
                          {{ c.current_coverage.toFixed(1) }}%
                          <span class="text-slate-400 font-normal">/ {{ c.min_coverage }}%</span>
                        </div>
                        <div class="text-xs text-slate-400 truncate">
                          delta: {{ (c.current_coverage - c.min_coverage).toFixed(1) }}%
                        </div>
                      </td>

                      <td class="px-4 py-3 text-slate-700">
                        <span class="font-semibold text-slate-800">{{ c.required_cells }}</span>
                      </td>

                      <td class="px-4 py-3">
                        <span
                          class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]"
                          :class="statusPill(c.status)">
                          {{ statusLabel(c.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="px-4 py-2 text-xs text-slate-400">
                  Показано: {{ contractsPreview.length }} из {{ filteredContracts.length }}
                </div>
              </div>
            </div>

            <p v-if="fetchFailed" class="text-xs text-rose-500 shrink-0">
              Ошибка загрузки: FAILED TO FETCH. Проверь API/baseURL, CORS и доступность бэка.
            </p>
          </section>

          <!-- Политика -->
          <section
            class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
            <header class="flex items-center justify-between gap-3 shrink-0">
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-slate-900">Политика выпуска</h2>
                <p class="mt-1 text-xs text-slate-500 max-w-sm">
                  Правила gating и краткие overrides.
                </p>
              </div>
              <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">policy</span>
            </header>

            <div class="grid gap-2.5 sm:grid-cols-3 shrink-0">
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Режим</div>
                <div class="mt-1 text-xl font-semibold text-slate-900 truncate">BLOCK</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Условие</div>
                <div class="mt-1 text-xl font-semibold text-slate-900 truncate">current &lt; min</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Overrides</div>
                <div class="mt-1 text-xl font-semibold text-slate-900 truncate">2</div>
              </div>
            </div>

            <div
              class="flex-1 min-h-0 overflow-hidden rounded-2xl border border-dashed border-white/50 bg-white/10 backdrop-blur p-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold text-slate-900">Overrides</div>
                <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">manual</span>
              </div>

              <div class="mt-3 grid gap-2">
                <div class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
                  <div class="mt-1 h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />
                  <div class="min-w-0">
                    <div class="font-medium text-slate-800 truncate">
                      billing-core · разрешить WARN до 2025-04-25
                    </div>
                    <div class="text-slate-400 truncate">owner: billing · reason: rollout window</div>
                  </div>
                </div>

                <div class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
                  <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                  <div class="min-w-0">
                    <div class="font-medium text-slate-800 truncate">
                      ml-features · non-blocking (optional contract)
                    </div>
                    <div class="text-slate-400 truncate">owner: ml · rule: non-blocking</div>
                  </div>
                </div>

                <p v-if="fetchFailed" class="mt-1 text-xs text-rose-500">
                  Ошибка политики: FAILED TO FETCH. Проверьте соединение и попробуйте позже.
                </p>
              </div>
            </div>

            <div class="grid gap-2.5 sm:grid-cols-3 shrink-0">
              <button
                class="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition">
                Добавить override
              </button>
              <button
                class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
                Экспорт правил
              </button>
              <button
                class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
                История
              </button>
            </div>
          </section>
        </div>

        <!-- События (фиксированная высота, чтобы точно влезало) -->
        <section
          class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-2 shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-900">Последние события coverage</h2>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Live log</span>
          </div>

          <div class="grid gap-2 sm:grid-cols-3">
            <div v-for="e in events" :key="e.id"
              class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3 min-w-0">
              <div class="mt-1 h-2 w-2 rounded-full shadow-sm" :class="dotTone(e.tone)" />
              <div class="min-w-0">
                <div class="font-medium text-slate-800 truncate">{{ e.title }}</div>
                <div class="text-slate-400 truncate">{{ e.meta }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
