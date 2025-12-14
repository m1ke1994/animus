<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const timeText = ref("4:03")
const isPulse = computed(() => timeText.value === "4:04")

let timeoutId: number | null = null

onMounted(() => {
  timeoutId = window.setTimeout(() => {
    timeText.value = "4:04"
  }, 1000)
})

onBeforeUnmount(() => {
  if (timeoutId) window.clearTimeout(timeoutId)
})

const goPanel = () => router.push("/")
const goLogin = () => router.push("/authregister")
</script>

<template>
  <div class="min-h-screen w-full bg-transparent flex flex-col items-center justify-center gap-10 px-4">
    <div class="select-none text-center">
      <div
        class="clock font-mono font-extrabold tracking-[0.10em] leading-none
               text-[clamp(56px,10vw,140px)]
               text-slate-900/90
               drop-shadow-[0_12px_26px_rgba(2,6,23,0.18)]"
        :class="{ 'pulse-on': isPulse }">
        {{ timeText }}
      </div>
      <div class="mt-3 h-[2px] w-full rounded-full bg-slate-900/10" />
      <p class="mt-3 text-sm text-slate-600">Страница не найдена</p>
    </div>

    <div class="flex items-center gap-3 flex-wrap justify-center">
      <button
        class="rounded-2xl px-5 py-3 text-sm font-semibold
               bg-slate-900 text-white
               shadow-[0_18px_40px_-26px_rgba(2,6,23,0.65)]
               hover:translate-y-[-1px] hover:shadow-[0_22px_52px_-30px_rgba(2,6,23,0.7)]
               active:translate-y-0
               transition"
        @click="goPanel">
        В панель
      </button>

      <button
        class="rounded-2xl px-5 py-3 text-sm font-semibold
               bg-white/55 backdrop-blur-md
               border border-slate-200/70 text-slate-700
               shadow-[0_16px_40px_-28px_rgba(2,6,23,0.25)]
               hover:bg-white/70 hover:translate-y-[-1px]
               active:translate-y-0
               transition"
        @click="goLogin">
        На вход
      </button>
    </div>
  </div>
</template>

<style scoped>
.clock {
  transform-origin: center;
  will-change: transform, filter;
}

.pulse-on {
  animation: pulse404 1.05s ease-in-out infinite;
}

@keyframes pulse404 {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 12px 26px rgba(2, 6, 23, 0.18));
  }

  50% {
    transform: scale(1.08);
    filter: drop-shadow(0 18px 34px rgba(2, 6, 23, 0.22));
  }

  100% {
    transform: scale(1);
    filter: drop-shadow(0 12px 26px rgba(2, 6, 23, 0.18));
  }
}
</style>
