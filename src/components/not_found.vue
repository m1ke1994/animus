<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"

type Phase = "clock" | "rewind" | "lock404"

const router = useRouter()

// стартовое время 04:05
const startMinutes = 4 * 60 + 5

// сколько "нормально" идут часы до сбоя
const runMs = 5200
// сколько длится быстрый "откат" к 404
const rewindMs = 1400

const phase = ref<Phase>("clock")
const nowMin = ref(startMinutes)
const nowSec = ref(0)
const tickJitter = ref(0) // микро-дрожь для "живости" свечения

let t0 = 0
let raf = 0
let interval: number | null = null

const pad2 = (n: number) => String(n).padStart(2, "0")

const clockText = computed(() => {
  const mm = Math.floor(nowMin.value % 60)
  const hh = Math.floor(nowMin.value / 60)
  return `${pad2(hh)}:${pad2(nowSec.value)}`
})

const displayText = computed(() => {
  if (phase.value === "lock404") return "404"
  if (phase.value === "rewind") {
    // во время rewind — показываем "404" чаще, будто система пытается восстановиться
    const pulse = Math.sin((performance.now() - t0) / 60)
    return pulse > 0.35 ? "404" : clockText.value
  }
  return clockText.value
})

const subtitle = computed(() => {
  if (phase.value === "lock404") return "Маршрут не найден. Вернись в Control Center."
  if (phase.value === "rewind") return "Синхронизация… откат состояния…"
  return "Секундомер маршрута… что-то пошло не так."
})

function startClock() {
  phase.value = "clock"
  nowMin.value = startMinutes
  nowSec.value = 0

  if (interval) window.clearInterval(interval)
  interval = window.setInterval(() => {
    if (phase.value !== "clock") return
    nowSec.value++
    if (nowSec.value >= 60) {
      nowSec.value = 0
      nowMin.value++
    }
    // чуть-чуть "живого" мерцания
    tickJitter.value = (Math.random() - 0.5) * 1.2
  }, 1000)
}

function goRewind() {
  phase.value = "rewind"
  const start = performance.now()
  const initialMin = nowMin.value
  const initialSec = nowSec.value
  t0 = start

  const totalInitial = initialMin * 60 + initialSec
  const target = 0 // "00:00" условная точка, после которой фиксируем 404

  const loop = (t: number) => {
    const p = Math.min(1, (t - start) / rewindMs)
    // easing: быстро в начале, мягче к концу
    const ease = 1 - Math.pow(1 - p, 3)

    const cur = Math.round(totalInitial - (totalInitial - target) * ease)
    nowMin.value = Math.floor(cur / 60)
    nowSec.value = cur % 60

    // усиление дрожи свечения во время отката
    tickJitter.value = (Math.random() - 0.5) * (2.5 + 3.5 * p)

    if (p < 1) {
      raf = requestAnimationFrame(loop)
    } else {
      phase.value = "lock404"
      // в lock404 делаем мерцание мягче
      tickJitter.value = (Math.random() - 0.5) * 0.6
    }
  }

  raf = requestAnimationFrame(loop)
}

function bootSequence() {
  startClock()
  const start = performance.now()
  t0 = start

  const loop = (t: number) => {
    const dt = t - start
    if (phase.value === "clock" && dt >= runMs) {
      goRewind()
      return
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
}

function goHome() {
  router.push("/")
}

function retry() {
  cancelAnimationFrame(raf)
  if (interval) window.clearInterval(interval)
  interval = null
  bootSequence()
}

onMounted(() => bootSequence())
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (interval) window.clearInterval(interval)
})
</script>

<template>
  <div class="min-h-screen w-full relative overflow-hidden bg-slate-50">
    <!-- мягкий туман/свет -->
    <div class="absolute inset-0">
      <div class="fog fog-a" />
      <div class="fog fog-b" />
      <div class="fog fog-c" />
    </div>

    <!-- стеклянная подложка -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="scanlines" />
      <div class="vignette" />
    </div>

    <div class="relative z-10 min-h-screen w-full flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-[900px]">
        <div
          class="glass rounded-3xl border border-sky-200/40 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden">
          <div class="px-7 sm:px-10 py-10 sm:py-12">
            <div class="flex flex-col gap-8">
              <!-- заголовок -->
              <div class="flex items-start justify-between gap-6">
                <div class="space-y-2">
                  <div class="text-xs tracking-[0.28em] uppercase text-slate-500/90">
                    system / routing
                  </div>
                  <div class="text-slate-800 font-semibold text-2xl sm:text-3xl">
                    Маршрут не найден
                  </div>
                </div>

                <div class="hidden sm:flex items-center gap-2">
                  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border"
                    :class="phase === 'lock404'
                      ? 'bg-rose-50/60 border-rose-200/70 text-rose-700'
                      : phase === 'rewind'
                        ? 'bg-amber-50/60 border-amber-200/70 text-amber-700'
                        : 'bg-emerald-50/60 border-emerald-200/70 text-emerald-700'">
                    <span class="h-2 w-2 rounded-full" :class="phase === 'lock404'
                      ? 'bg-rose-500'
                      : phase === 'rewind'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'" />
                    {{ phase === 'lock404' ? 'ERROR' : phase === 'rewind' ? 'ROLLBACK' : 'OK' }}
                  </span>
                </div>
              </div>

              <!-- цифровой дисплей -->
              <div class="display-wrap">
                <div class="display" :class="{
                  'is-rewind': phase === 'rewind',
                  'is-lock': phase === 'lock404'
                }" :style="{ '--j': tickJitter }">
                  <div class="display-glow" />
                  <div class="display-inner">
                    <div class="digits">
                      {{ displayText }}
                    </div>
                    <div class="hint">
                      {{ subtitle }}
                    </div>
                  </div>
                </div>

                <!-- маленькие индикаторы -->
                <div class="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-sky-400/80 shadow-[0_0_14px_rgba(56,189,248,0.7)]" />
                    <span>Clock Sync</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-slate-400/70" />
                    <span>Route Resolver</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full"
                      :class="phase === 'lock404' ? 'bg-rose-500/90 shadow-[0_0_14px_rgba(244,63,94,0.55)]' : 'bg-emerald-500/70 shadow-[0_0_14px_rgba(16,185,129,0.45)]'" />
                    <span>State</span>
                  </div>
                </div>
              </div>

              <!-- кнопки -->
              <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                <button class="w-full sm:w-auto rounded-2xl px-5 py-3 font-semibold text-slate-800
                         bg-white/70 border border-slate-200/70 hover:bg-white
                         shadow-[0_16px_40px_-26px_rgba(15,23,42,0.5)]
                         transition" @click="goHome">
                  Вернуться домой
                </button>

                <div class="flex gap-3">
                  <button class="flex-1 sm:flex-none rounded-2xl px-5 py-3 font-semibold
                           text-sky-700 bg-sky-50/70 border border-sky-200/70
                           hover:bg-sky-50 transition" @click="retry">
                    Перезапустить
                  </button>
                  <button class="flex-1 sm:flex-none rounded-2xl px-5 py-3 font-semibold
                           text-slate-600 bg-transparent border border-slate-200/70
                           hover:bg-white/40 transition" @click="router.back()">
                    Назад
                  </button>
                </div>
              </div>

              <!-- подсказка моб. статуса -->
              <div class="sm:hidden -mt-2 text-xs text-slate-500">
                Состояние:
                <span class="font-semibold"
                  :class="phase === 'lock404' ? 'text-rose-700' : phase === 'rewind' ? 'text-amber-700' : 'text-emerald-700'">
                  {{ phase === 'lock404' ? 'ERROR' : phase === 'rewind' ? 'ROLLBACK' : 'OK' }}
                </span>
              </div>
            </div>
          </div>

          <!-- нижняя декоративная линия -->
          <div class="h-10 border-t border-sky-200/30 bg-white/40" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---- фон / туман ---- */
.fog {
  position: absolute;
  inset: -30%;
  filter: blur(40px);
  opacity: 0.75;
  mix-blend-mode: multiply;
  animation: drift 16s ease-in-out infinite;
}

.fog-a {
  background: radial-gradient(closest-side at 30% 20%, rgba(56, 189, 248, 0.25), transparent 60%),
    radial-gradient(closest-side at 70% 70%, rgba(99, 102, 241, 0.12), transparent 60%);
}

.fog-b {
  animation-duration: 22s;
  background: radial-gradient(closest-side at 40% 80%, rgba(14, 165, 233, 0.18), transparent 60%),
    radial-gradient(closest-side at 75% 30%, rgba(2, 132, 199, 0.10), transparent 60%);
}

.fog-c {
  animation-duration: 28s;
  background: radial-gradient(closest-side at 20% 55%, rgba(125, 211, 252, 0.16), transparent 60%),
    radial-gradient(closest-side at 85% 55%, rgba(148, 163, 184, 0.10), transparent 60%);
}

@keyframes drift {
  0% {
    transform: translate3d(-2%, -2%, 0) scale(1.02);
  }

  50% {
    transform: translate3d(2%, 1.5%, 0) scale(1.04);
  }

  100% {
    transform: translate3d(-2%, -2%, 0) scale(1.02);
  }
}

/* ---- стекло ---- */
.glass {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.40));
  backdrop-filter: blur(18px);
}

/* scanlines + виньетка */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom,
      rgba(15, 23, 42, 0.03),
      rgba(15, 23, 42, 0.03) 1px,
      transparent 1px,
      transparent 6px);
  opacity: 0.22;
  pointer-events: none;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(closest-side at 50% 40%, transparent 55%, rgba(15, 23, 42, 0.08) 100%);
  pointer-events: none;
}

/* ---- дисплей ---- */
.display-wrap {
  width: 100%;
}

.display {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background:
    radial-gradient(1200px 420px at 20% 20%, rgba(56, 189, 248, 0.14), transparent 60%),
    radial-gradient(900px 320px at 80% 70%, rgba(99, 102, 241, 0.10), transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.62));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 22px 60px -30px rgba(2, 6, 23, 0.75);
}

.display-glow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.22), transparent 60%);
  filter: blur(32px);
  opacity: 0.85;
  animation: glow 2.8s ease-in-out infinite;
}

@keyframes glow {
  0% {
    transform: scale(1) translateY(0);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.05) translateY(-1%);
    opacity: 0.92;
  }

  100% {
    transform: scale(1) translateY(0);
    opacity: 0.75;
  }
}

.display-inner {
  position: relative;
  padding: 28px 24px;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

@media (min-width: 640px) {
  .display-inner {
    padding: 34px 34px;
    min-height: 220px;
  }
}

.digits {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  letter-spacing: 0.06em;
  font-weight: 800;
  line-height: 1;
  font-size: clamp(56px, 9vw, 104px);

  /* Реалистичное свечение + микродрожь */
  transform: translate3d(calc(var(--j, 0) * 1px), calc(var(--j, 0) * 0.6px), 0);
  color: rgba(125, 211, 252, 0.96);
  text-shadow:
    0 0 10px rgba(56, 189, 248, 0.45),
    0 0 22px rgba(56, 189, 248, 0.28),
    0 0 40px rgba(56, 189, 248, 0.18);
}

.hint {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  color: rgba(226, 232, 240, 0.82);
  font-size: 14px;
}

/* режим rewind — более “нервный” */
.display.is-rewind .digits {
  color: rgba(186, 230, 253, 0.96);
  text-shadow:
    0 0 10px rgba(251, 191, 36, 0.18),
    0 0 18px rgba(56, 189, 248, 0.34),
    0 0 48px rgba(56, 189, 248, 0.22);
  animation: glitch 0.22s infinite steps(2, end);
}

/* lock404 — финальная фиксация */
.display.is-lock .digits {
  color: rgba(254, 202, 202, 0.96);
  text-shadow:
    0 0 10px rgba(244, 63, 94, 0.25),
    0 0 22px rgba(244, 63, 94, 0.16),
    0 0 40px rgba(244, 63, 94, 0.10);
}

@keyframes glitch {
  0% {
    transform: translate3d(calc(var(--j, 0) * 1px), 0, 0);
  }

  25% {
    transform: translate3d(calc(var(--j, 0) * -1px), 1px, 0);
  }

  50% {
    transform: translate3d(0, -1px, 0);
  }

  75% {
    transform: translate3d(1px, 0, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
}
</style>
