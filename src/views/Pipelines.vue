<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

type ReleaseItem = {
  id: string
  version: string
  dataset_id: string
  ontology_version: string
  run_id: string
  created_at: string
  status: "published" | "failed" | "pending"
}

const isAutoRefresh = ref(true)
const lastSync = ref("только что")
const fetchFailed = ref(false)

const form = ref({
  run_id: "run-acde-8891",
  version: "2025.04.1",
  dataset_id: "users-prod",
  ontology_version: "v2",
  idempotency_key: "release-2025-q2",

  artifacts_json: JSON.stringify(
    {
      dataset: "users-prod",
      rows: 1243912,
      checksum: "sha256:ab91f2c9b0f6d1...",
      storage: "s3://datasets/users-prod/2025.04.1",
      artifacts: ["dataset.parquet", "schema.json", "stats.json"],
    },
    null,
    2
  ),
  reports_json: JSON.stringify(
    {
      quality: "OK",
      missing_ratio: 0.0012,
      schema_drift: false,
      validation_time_sec: 42,
      checks: { nulls: "pass", ranges: "pass", uniques: "warn" },
    },
    null,
    2
  ),
  contracts_json: JSON.stringify(
    {
      consumers: ["analytics", "billing", "ml"],
      backward_compatible: true,
      breaking_changes: [],
    },
    null,
    2
  ),
  manifest_lock_json: JSON.stringify(
    {
      manifest: "release.manifest.json",
      lock_version: 3,
      hash: "sha256:19aa0f...",
    },
    null,
    2
  ),
  signatures_json: JSON.stringify(
    {
      signed_by: "CI",
      algo: "ed25519",
      signature: "b64:Zk1Wc2JH...",
      signed_at: "2025-04-19T12:03:11Z",
    },
    null,
    2
  ),
})

const releases = ref<ReleaseItem[]>([
  {
    id: "rel_9fa1",
    version: "2025.04.0",
    dataset_id: "default",
    ontology_version: "v1",
    run_id: "run-acde-7781",
    created_at: "2025-04-19 12:03",
    status: "failed",
  },
  {
    id: "rel_83bc",
    version: "2025.03.4",
    dataset_id: "users-prod",
    ontology_version: "v2",
    run_id: "run-acde-6429",
    created_at: "2025-04-14 18:41",
    status: "published",
  },
  {
    id: "rel_71aa",
    version: "2025.03.3",
    dataset_id: "billing-core",
    ontology_version: "v2",
    run_id: "run-acde-5192",
    created_at: "2025-04-09 09:10",
    status: "published",
  },
  {
    id: "rel_55de",
    version: "2025.03.2",
    dataset_id: "events-raw",
    ontology_version: "v1",
    run_id: "run-acde-4401",
    created_at: "2025-03-28 22:55",
    status: "published",
  },
  {
    id: "rel_41ef",
    version: "2025.02.9",
    dataset_id: "ml-features",
    ontology_version: "v3",
    run_id: "run-acde-3880",
    created_at: "2025-03-17 11:34",
    status: "failed",
  },
])

const total = computed(() => (fetchFailed.value ? 0 : releases.value.length))

const statusPill = (s: ReleaseItem["status"]) => {
  if (s === "published") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
  if (s === "pending") return "bg-amber-400/15 text-amber-700 border-amber-400/25"
  return "bg-rose-500/15 text-rose-700 border-rose-500/25"
}
const statusLabel = (s: ReleaseItem["status"]) => {
  if (s === "published") return "PUBLISHED"
  if (s === "pending") return "PENDING"
  return "FAILED"
}

function publishRelease() {
  fetchFailed.value = false

  const newRelease: ReleaseItem = {
    id: `rel_${Math.random().toString(16).slice(2, 6)}`,
    version: form.value.version,
    dataset_id: form.value.dataset_id,
    ontology_version: form.value.ontology_version,
    run_id: form.value.run_id,
    created_at: new Date().toLocaleString(),
    status: "pending",
  }

  releases.value.unshift(newRelease)
  lastSync.value = "только что"

  setTimeout(() => {
    newRelease.status = Math.random() > 0.12 ? "published" : "failed"
  }, 900)
}

onMounted(() => {
  setInterval(() => {
    if (!isAutoRefresh.value) return
    lastSync.value = "несколько секунд назад"
  }, 8000)
})

type JsonTab = "artifacts" | "reports" | "contracts" | "manifest" | "signatures"
const jsonTab = ref<JsonTab>("artifacts")
const jsonTabs: { key: JsonTab; label: string }[] = [
  { key: "artifacts", label: "ARTIFACTS_JSON" },
  { key: "reports", label: "REPORTS_JSON" },
  { key: "contracts", label: "CONTRACTS_JSON" },
  { key: "manifest", label: "MANIFEST_LOCK_JSON" },
  { key: "signatures", label: "SIGNATURES_JSON" },
]

const jsonModel = computed({
  get() {
    if (jsonTab.value === "artifacts") return form.value.artifacts_json
    if (jsonTab.value === "reports") return form.value.reports_json
    if (jsonTab.value === "contracts") return form.value.contracts_json
    if (jsonTab.value === "manifest") return form.value.manifest_lock_json
    return form.value.signatures_json
  },
  set(v: string) {
    if (jsonTab.value === "artifacts") form.value.artifacts_json = v
    else if (jsonTab.value === "reports") form.value.reports_json = v
    else if (jsonTab.value === "contracts") form.value.contracts_json = v
    else if (jsonTab.value === "manifest") form.value.manifest_lock_json = v
    else form.value.signatures_json = v
  },
})

/** ✅ Full view (не скролл страницы, а режим просмотра деталей) */
const jsonFullOpen = ref(false)
</script>

<template>
  <div
    class="relative h-[96vh] w-full text-slate-900 bg-white/30 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/25 shadow-lg shadow-white/10">
    <!-- ✅ КЛЮЧ: страница не скроллится вообще -->
    <div class="mx-auto h-full max-w-none px-4 md:px-6 xl:px-8 py-3 flex flex-col gap-3 overflow-hidden">
      <!-- HEADER (сжато) -->
      <div class="shrink-0">
        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Главная · <span class="text-slate-500 font-medium">Пайплайны</span>
        </div>

        <div class="mt-2 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
              Пайплайны и релизы
            </h1>
            <p class="mt-1 text-xs md:text-sm text-slate-500 max-w-2xl">
              run → publish · артефакты/отчёты · подписи · история релизов
            </p>
            <p class="mt-0.5 text-[11px] text-slate-400">
              Последняя синхронизация: <span class="font-medium text-slate-500">{{ lastSync }}</span>
            </p>
          </div>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
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
              class="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition"
              @click="fetchFailed = !fetchFailed">
              <span class="i-tabler-refresh-cw" />
              Обновить
            </button>
          </div>
        </div>

        <div class="mt-2 rounded-2xl bg-white/25 border border-white/40 px-3 py-2 flex items-center gap-3">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            всего: <span class="text-slate-600 font-semibold">{{ total }}</span>
          </div>
          <div class="h-3 w-px bg-white/50" />
          <div v-if="fetchFailed" class="text-[11px] uppercase tracking-[0.2em] text-rose-500">
            ошибка: FAILED TO FETCH
          </div>
          <div v-else class="text-[11px] uppercase tracking-[0.2em] text-emerald-600">статус: OK</div>
        </div>
      </div>

      <!-- ✅ MAIN (влезает без скрола) -->
      <div class="flex-1 min-h-0 grid gap-3 grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] overflow-hidden">
        <!-- LEFT -->
        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <header class="flex items-start justify-between gap-3 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Публикация релиза</h2>
              <p class="mt-1 text-xs text-slate-500">
                Компактный режим без скролла. Полный JSON — через Full view.
              </p>
            </div>

            <button
              class="shrink-0 inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition"
              @click="publishRelease">
              Опубликовать
            </button>
          </header>

          <!-- inputs compact -->
          <div class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
            <div class="flex flex-col gap-1.5 min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">RUN_ID *</div>
              <input v-model="form.run_id"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-4 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <div class="flex flex-col gap-1.5 min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">VERSION *</div>
              <input v-model="form.version"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-4 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <div class="flex flex-col gap-1.5 min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">DATASET</div>
              <input v-model="form.dataset_id"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-4 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <div class="flex flex-col gap-1.5 min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">ONTOLOGY</div>
              <input v-model="form.ontology_version"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-4 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>
          </div>

          <div class="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] shrink-0">
            <div class="flex flex-col gap-1.5 min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">IDEMPOTENCY_KEY</div>
              <input v-model="form.idempotency_key"
                class="h-10 w-full rounded-2xl bg-white/25 border border-white/40 px-4 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <div class="rounded-2xl bg-white/15 border border-white/30 px-4 py-2 text-xs text-slate-500">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">подсказка</div>
              <p class="mt-0.5 leading-snug">
                Идемпотентность защищает от повторной публикации релиза.
              </p>
            </div>
          </div>

          <!-- JSON compact block (no internal scroll, no page scroll) -->
          <div class="flex-1 min-h-0 rounded-3xl bg-white/20 border border-white/35 p-3 overflow-hidden">
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400 mr-1">json</div>

              <button v-for="t in jsonTabs" :key="t.key"
                class="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition" :class="jsonTab === t.key
                    ? 'bg-white/35 border-white/50 text-slate-700 shadow-sm'
                    : 'bg-white/15 border-white/30 text-slate-500 hover:bg-white/25'
                  " @click="jsonTab = t.key">
                {{ t.label }}
              </button>

              <div class="ml-auto flex items-center gap-2">
                <button
                  class="rounded-full border border-white/40 bg-white/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:bg-white/35 transition"
                  @click="jsonFullOpen = true">
                  Full view
                </button>
              </div>
            </div>

            <!-- ✅ ПРЕВЬЮ: без скролла, влезает всегда -->
            <div class="mt-2 h-full min-h-0 overflow-hidden rounded-2xl border border-white/40 bg-white/15 p-3">
              <pre
                class="h-full whitespace-pre-wrap break-words text-[11px] leading-[1.25] text-slate-700 overflow-hidden">
{{ jsonModel }}
              </pre>
            </div>
          </div>

          <p v-if="fetchFailed" class="text-xs text-rose-500 shrink-0">
            Ошибка: FAILED TO FETCH. Проверь API/baseURL, CORS и доступность бэка.
          </p>
        </section>

        <!-- RIGHT -->
        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <div class="flex items-center justify-between gap-3 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Список релизов</h2>
              <p class="mt-1 text-xs text-slate-500">Без таблицы, чтобы всё влезало.</p>
            </div>

            <select
              class="shrink-0 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-sky-200">
              <option>Последние</option>
              <option>Только published</option>
              <option>Только failed</option>
            </select>
          </div>

          <!-- ✅ list cards (влезает) -->
          <div class="flex-1 min-h-0 grid gap-2 content-start overflow-hidden">
            <div v-for="r in releases.slice(0, 5)" :key="r.id"
              class="rounded-2xl border border-white/35 bg-white/15 p-3 hover:bg-white/25 transition">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 leading-tight">{{ r.version }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    {{ r.dataset_id }} · {{ r.run_id }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1">{{ r.created_at }}</div>
                </div>

                <span
                  class="shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                  :class="statusPill(r.status)">
                  {{ statusLabel(r.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white/20 border border-white/35 p-3 shrink-0">
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">каталог релизов</div>
            <p class="mt-1 text-xs text-slate-500">
              Переходы к артефактам/отчётам добавим после API.
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- ✅ FULL VIEW OVERLAY (детали без скрола страницы) -->
    <div v-if="jsonFullOpen" class="absolute inset-0 z-50 bg-white/35 backdrop-blur-xl">
      <div class="h-full w-full p-4 md:p-6 xl:p-8">
        <div class="h-full rounded-3xl border border-white/35 bg-white/30 shadow-lg overflow-hidden flex flex-col">
          <div class="p-4 flex items-center justify-between gap-3 border-b border-white/25">
            <div class="min-w-0">
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">full json</div>
              <div class="text-sm font-semibold text-slate-800 truncate">
                {{jsonTabs.find(x => x.key === jsonTab)?.label}}
              </div>
            </div>

            <button
              class="rounded-full bg-slate-900/80 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-900 transition"
              @click="jsonFullOpen = false">
              Закрыть
            </button>
          </div>

          <!-- тут можно скроллить внутри просмотра (страница при этом НЕ скроллится) -->
          <div class="flex-1 min-h-0 overflow-auto p-4">
            <pre class="whitespace-pre-wrap break-words text-[12px] leading-[1.35] text-slate-800">
{{ jsonModel }}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
