<script setup lang="ts">
import { computed, ref } from "vue"

type Policy = {
  id: string
  name: string
  scope: string
  owners: string[]
  status: "enforced" | "draft" | "blocked"
  controls: string
  updated_at: string
}

type ReviewItem = {
  id: string
  kind: "approve" | "change" | "alert"
  title: string
  meta: string
}

const isGlobalFreeze = ref(false)
const isAutoRefresh = ref(true)
const lastAudit = ref("только что")

const policies = ref<Policy[]>([
  {
    id: "pol_1",
    name: "Release gating",
    scope: "production",
    owners: ["platform"],
    status: "enforced",
    controls: "coverage >= 97%, DLQ == 0",
    updated_at: "2025-04-19 12:03",
  },
  {
    id: "pol_2",
    name: "Sensitive data",
    scope: "ml-features",
    owners: ["ml", "security"],
    status: "blocked",
    controls: "k-anon 20, no raw pii",
    updated_at: "2025-04-19 10:18",
  },
  {
    id: "pol_3",
    name: "Schema drift",
    scope: "users-prod",
    owners: ["analytics"],
    status: "enforced",
    controls: "diff <= 0, only additive fields",
    updated_at: "2025-04-19 09:44",
  },
  {
    id: "pol_4",
    name: "AI outputs",
    scope: "llm-pipelines",
    owners: ["ai"],
    status: "draft",
    controls: "toxicity < 0.01, prompt logs on",
    updated_at: "2025-04-18 22:55",
  },
  {
    id: "pol_5",
    name: "Access window",
    scope: "billing-core",
    owners: ["billing"],
    status: "enforced",
    controls: "09:00-22:00 only",
    updated_at: "2025-04-18 18:12",
  },
])

const reviewQueue = ref<ReviewItem[]>([
  {
    id: "rev_1",
    kind: "approve",
    title: "Одобрить override на billing-core",
    meta: "owner: billing · до 2025-04-25",
  },
  {
    id: "rev_2",
    kind: "change",
    title: "Изменить лимит DLQ для events-raw",
    meta: "предлагается 30 → 50",
  },
  {
    id: "rev_3",
    kind: "alert",
    title: "FAILED TO FETCH политики llm-pipelines",
    meta: "попробовать обновить позже",
  },
])

const auditLog = ref([
  { id: "a1", tone: "ok", text: "policy.release применена", meta: "12:04 · platform" },
  { id: "a2", tone: "warn", text: "override для billing-core активирован", meta: "11:51 · billing" },
  { id: "a3", tone: "fail", text: "FAILED TO FETCH registry snapshot", meta: "11:32 · retry 15s" },
  { id: "a4", tone: "ok", text: "schema drift policy обновлена", meta: "10:18 · analytics" },
])

const metrics = computed(() => {
  const enforced = policies.value.filter(p => p.status === "enforced").length
  const drafts = policies.value.filter(p => p.status === "draft").length
  const blocked = policies.value.filter(p => p.status === "blocked").length
  const owners = new Set(policies.value.flatMap(p => p.owners)).size
  return { enforced, drafts, blocked, owners }
})

const policyPill = (s: Policy["status"]) => {
  if (s === "enforced") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
  if (s === "draft") return "bg-amber-400/15 text-amber-700 border-amber-400/25"
  return "bg-rose-500/15 text-rose-700 border-rose-500/25"
}
const policyLabel = (s: Policy["status"]) => {
  if (s === "enforced") return "ENFORCED"
  if (s === "draft") return "DRAFT"
  return "BLOCKED"
}

const chipTone = (k: ReviewItem["kind"]) => {
  if (k === "approve") return "bg-emerald-500 shadow-emerald-200"
  if (k === "change") return "bg-amber-400 shadow-amber-200"
  return "bg-rose-500 shadow-rose-200"
}
</script>

<template>
  <div
    class="relative h-[96vh] w-full text-slate-900 bg-white/30 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/25 shadow-lg shadow-white/10">
    <div class="mx-auto h-full max-w-7xl px-4 py-3 flex flex-col gap-3 overflow-hidden">
      <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">
        Главная · <span class="text-slate-500 font-medium">Политики</span>
      </div>

      <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Политики доступа и выпуска
          </h1>
          <p class="mt-1 text-sm text-slate-500 max-w-2xl">
            Правила gating, защита данных и контроль изменений для продакшена.
          </p>
          <p class="mt-0.5 text-xs text-slate-400">
            Последний аудит: <span class="font-medium text-slate-500">{{ lastAudit }}</span>
          </p>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <label
            class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-3 py-1.5 text-xs text-slate-600 shadow-sm cursor-pointer">
            <span>Глобальный freeze</span>
            <span class="relative inline-flex h-5 w-9 items-center rounded-full transition"
              :class="isGlobalFreeze ? 'bg-rose-500/80' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 rounded-full bg-white shadow transform transition"
                :class="isGlobalFreeze ? 'translate-x-4' : 'translate-x-1'" />
            </span>
            <input type="checkbox" class="hidden" v-model="isGlobalFreeze" />
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
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Enforced</div>
          <div class="mt-1.5 text-2xl font-semibold text-emerald-600">{{ metrics.enforced }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Активные правила</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Draft</div>
          <div class="mt-1.5 text-2xl font-semibold text-amber-600">{{ metrics.drafts }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Готовятся к rollout</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Blocked</div>
          <div class="mt-1.5 text-2xl font-semibold text-rose-500">{{ metrics.blocked }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Нужен разбор</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Команд</div>
          <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ metrics.owners }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Владеют политиками</p>
        </div>
      </div>

      <div class="flex-1 min-h-0 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] overflow-hidden">
        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <header class="flex items-center justify-between gap-3 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Реестр политик</h2>
              <p class="mt-1 text-xs text-slate-500 max-w-md">
                Краткий список без скролла. Детали уводим в модалки позже.
              </p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">registry</span>
          </header>

          <div class="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/40 bg-white/15">
            <table class="w-full table-fixed text-left text-sm">
              <thead class="bg-white/20 border-b border-white/30">
                <tr class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <th class="px-4 py-3 w-[32%]">Политика</th>
                  <th class="px-4 py-3 w-[24%]">Scope</th>
                  <th class="px-4 py-3 w-[28%]">Контроль</th>
                  <th class="px-4 py-3 w-[16%]">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in policies" :key="p.id" class="border-b border-white/20 hover:bg-white/10 transition">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-slate-800 truncate">{{ p.name }}</div>
                    <div class="text-xs text-slate-400 truncate">{{ p.updated_at }}</div>
                  </td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ p.scope }}</td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ p.controls }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                      :class="policyPill(p.status)">
                      {{ policyLabel(p.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="grid gap-2.5 sm:grid-cols-3 shrink-0">
            <button
              class="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition">
              Создать политику
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              Экспорт YAML
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              История изменений
            </button>
          </div>
        </section>

        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Очередь ревью</h2>
              <p class="text-xs text-slate-500 mt-1">Запросы на approvals, overrides и алерты.</p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">review</span>
          </div>

          <div class="flex-1 min-h-0 grid gap-2 content-start overflow-hidden">
            <div v-for="item in reviewQueue" :key="item.id"
              class="rounded-2xl border border-white/35 bg-white/15 p-3 flex items-start gap-2.5">
              <div class="mt-1 h-2 w-2 rounded-full shadow-sm" :class="chipTone(item.kind)" />
              <div class="min-w-0">
                <div class="font-semibold text-slate-800">{{ item.title }}</div>
                <div class="text-xs text-slate-500 truncate">{{ item.meta }}</div>
              </div>
              <div class="ml-auto flex gap-1">
                <button class="rounded-full bg-white/30 border border-white/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-600 hover:bg-white/40 transition">
                  Смягчить
                </button>
                <button class="rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition">
                  Принять
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white/20 border border-white/35 p-3">
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">freeze</div>
            <p class="mt-1 text-xs text-slate-500">
              Freeze блокирует публикации, но ручные override разрешены владельцами.
            </p>
          </div>
        </section>
      </div>

      <section
        class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-2 shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">Аудит последних изменений</h2>
          <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">audit log</span>
        </div>

        <div class="grid gap-2 sm:grid-cols-4">
          <div v-for="a in auditLog" :key="a.id"
            class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
            <div class="mt-1 h-2 w-2 rounded-full shadow-sm" :class="chipTone(a.tone as ReviewItem['kind'])" />
            <div class="min-w-0">
              <div class="font-medium text-slate-800 truncate">{{ a.text }}</div>
              <div class="text-slate-400 truncate">{{ a.meta }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
