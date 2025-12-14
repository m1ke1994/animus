<script setup lang="ts">
import { computed, ref } from "vue"

type Sensor = {
  id: string
  name: string
  type: string
  region: string
  status: "online" | "warn" | "offline"
  latency_ms: number
  signal: number
  updated_at: string
}

type Calibration = {
  id: string
  sensor: string
  slot: string
  owner: string
  status: "scheduled" | "done" | "skip"
}

type Pulse = {
  id: string
  tone: "ok" | "warn" | "fail"
  text: string
  meta: string
}

const maintenanceMode = ref(false)
const isAutoRefresh = ref(true)
const lastPing = ref("только что")

const sensors = ref<Sensor[]>([
  {
    id: "s1",
    name: "gateway-north",
    type: "gateway",
    region: "eu-north",
    status: "online",
    latency_ms: 18,
    signal: 0.99,
    updated_at: "12:03",
  },
  {
    id: "s2",
    name: "sensor-lab-01",
    type: "telemetry",
    region: "eu-central",
    status: "warn",
    latency_ms: 42,
    signal: 0.93,
    updated_at: "11:59",
  },
  {
    id: "s3",
    name: "edge-paris",
    type: "edge",
    region: "eu-west",
    status: "online",
    latency_ms: 26,
    signal: 0.97,
    updated_at: "11:51",
  },
  {
    id: "s4",
    name: "edge-sandbox",
    type: "edge",
    region: "lab",
    status: "offline",
    latency_ms: 0,
    signal: 0,
    updated_at: "11:30",
  },
  {
    id: "s5",
    name: "sensor-ml-stream",
    type: "stream",
    region: "us-east",
    status: "online",
    latency_ms: 31,
    signal: 0.95,
    updated_at: "11:24",
  },
])

const calibrations = ref<Calibration[]>([
  { id: "c1", sensor: "gateway-north", slot: "12:30 · сегодня", owner: "platform", status: "scheduled" },
  { id: "c2", sensor: "sensor-lab-01", slot: "14:00 · сегодня", owner: "telemetry", status: "scheduled" },
  { id: "c3", sensor: "edge-paris", slot: "16:15 · сегодня", owner: "edge", status: "done" },
  { id: "c4", sensor: "edge-sandbox", slot: "10:00 · завтра", owner: "lab", status: "skip" },
])

const pulses = ref<Pulse[]>([
  { id: "p1", tone: "ok", text: "Пакет heartbeats принят от eu-north", meta: "12:04" },
  { id: "p2", tone: "warn", text: "Повышенная латентность sensor-lab-01", meta: "11:58 · 42 ms" },
  { id: "p3", tone: "fail", text: "FAILED TO FETCH состояние edge-sandbox", meta: "11:32 · retry 15s" },
  { id: "p4", tone: "ok", text: "Фоновые логи отправлены в object storage", meta: "11:18" },
])

const metrics = computed(() => {
  const online = sensors.value.filter(s => s.status === "online").length
  const warn = sensors.value.filter(s => s.status === "warn").length
  const offline = sensors.value.filter(s => s.status === "offline").length
  const avgLatency =
    sensors.value.filter(s => s.latency_ms > 0).reduce((s, x) => s + x.latency_ms, 0) /
    Math.max(1, sensors.value.filter(s => s.latency_ms > 0).length)
  return { online, warn, offline, avgLatency: avgLatency.toFixed(1) }
})

const statusPill = (s: Sensor["status"]) => {
  if (s === "online") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
  if (s === "warn") return "bg-amber-400/15 text-amber-700 border-amber-400/25"
  return "bg-rose-500/15 text-rose-700 border-rose-500/25"
}
const statusLabel = (s: Sensor["status"]) => {
  if (s === "online") return "ONLINE"
  if (s === "warn") return "WARN"
  return "OFFLINE"
}

const pulseTone = (t: Pulse["tone"]) => {
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
        Главная · <span class="text-slate-500 font-medium">Сенсоры</span>
      </div>

      <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Панель сенсоров
          </h1>
          <p class="mt-1 text-sm text-slate-500 max-w-2xl">
            Heartbeats, латентность, сигнал и расписание калибровок.
          </p>
          <p class="mt-0.5 text-xs text-slate-400">
            Последний ping: <span class="font-medium text-slate-500">{{ lastPing }}</span>
          </p>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <label
            class="inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur border border-white/40 px-3 py-1.5 text-xs text-slate-600 shadow-sm cursor-pointer">
            <span>Обслуживание</span>
            <span class="relative inline-flex h-5 w-9 items-center rounded-full transition"
              :class="maintenanceMode ? 'bg-amber-500/80' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 rounded-full bg-white shadow transform transition"
                :class="maintenanceMode ? 'translate-x-4' : 'translate-x-1'" />
            </span>
            <input type="checkbox" class="hidden" v-model="maintenanceMode" />
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
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Online</div>
          <div class="mt-1.5 text-2xl font-semibold text-emerald-600">{{ metrics.online }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Сенсоры в сети</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Warn</div>
          <div class="mt-1.5 text-2xl font-semibold text-amber-600">{{ metrics.warn }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Нужен мониторинг</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Offline</div>
          <div class="mt-1.5 text-2xl font-semibold text-rose-500">{{ metrics.offline }}</div>
          <p class="mt-0.5 text-xs text-slate-400">Нет связи</p>
        </div>
        <div
          class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
          <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Средняя латентность</div>
          <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ metrics.avgLatency }} ms</div>
          <p class="mt-0.5 text-xs text-slate-400">По активным</p>
        </div>
      </div>

      <div class="flex-1 min-h-0 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] overflow-hidden">
        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <header class="flex items-center justify-between gap-3 shrink-0">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Радар сенсоров</h2>
              <p class="mt-1 text-xs text-slate-500 max-w-md">
                Состояние, сигнал и латентность. Без внутреннего скролла.
              </p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">heartbeat</span>
          </header>

          <div class="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/40 bg-white/15">
            <table class="w-full table-fixed text-left text-sm">
              <thead class="bg-white/20 border-b border-white/30">
                <tr class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <th class="px-4 py-3 w-[26%]">Сенсор</th>
                  <th class="px-4 py-3 w-[18%]">Тип</th>
                  <th class="px-4 py-3 w-[18%]">Регион</th>
                  <th class="px-4 py-3 w-[20%]">Сигнал</th>
                  <th class="px-4 py-3 w-[18%]">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sensors" :key="s.id" class="border-b border-white/20 hover:bg-white/10 transition">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-slate-800 truncate">{{ s.name }}</div>
                    <div class="text-xs text-slate-400 truncate">updated {{ s.updated_at }}</div>
                  </td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ s.type }}</td>
                  <td class="px-4 py-3 text-slate-700 truncate">{{ s.region }}</td>
                  <td class="px-4 py-3 text-slate-700">
                    <div class="font-semibold text-slate-800">{{ (s.signal * 100).toFixed(1) }}%</div>
                    <div class="text-xs text-slate-400">{{ s.latency_ms }} ms</div>
                  </td>
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
              Добавить сенсор
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              Экспорт статуса
            </button>
            <button
              class="rounded-full bg-white/30 border border-white/40 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/40 active:scale-[0.98] transition">
              Настроить оповещения
            </button>
          </div>
        </section>

        <section
          class="min-w-0 rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 overflow-hidden">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Калибровки</h2>
              <p class="text-xs text-slate-500 mt-1">Окна техобслуживания и ответственные.</p>
            </div>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">schedule</span>
          </div>

          <div class="flex-1 min-h-0 grid gap-2 content-start overflow-hidden">
            <div v-for="c in calibrations" :key="c.id"
              class="rounded-2xl border border-white/35 bg-white/15 p-3 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-semibold text-slate-800">{{ c.sensor }}</div>
                <div class="text-xs text-slate-500">{{ c.slot }}</div>
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400 mt-1">owner: {{ c.owner }}</div>
              </div>
              <span
                class="shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                :class="c.status === 'done'
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25'
                    : c.status === 'scheduled'
                      ? 'bg-amber-400/15 text-amber-700 border-amber-400/25'
                      : 'bg-slate-500/15 text-slate-700 border-slate-500/25'">
                {{ c.status }}
              </span>
            </div>
          </div>

          <div class="rounded-2xl bg-white/20 border border-white/35 p-3">
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">maintenance</div>
            <p class="mt-1 text-xs text-slate-500">
              Maintenance включает автоматическую паузу алертов, но heartbeat сохраняется.
            </p>
          </div>
        </section>
      </div>

      <section
        class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-2 shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">Пульсы системы</h2>
          <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">live log</span>
        </div>

        <div class="grid gap-2 sm:grid-cols-4">
          <div v-for="p in pulses" :key="p.id"
            class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
            <div class="mt-1 h-2 w-2 rounded-full shadow-sm" :class="pulseTone(p.tone)" />
            <div class="min-w-0">
              <div class="font-medium text-slate-800 truncate">{{ p.text }}</div>
              <div class="text-slate-400 truncate">{{ p.meta }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
