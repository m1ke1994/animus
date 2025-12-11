<script setup lang="ts">
import { ref, computed } from "vue"

const range = ref<"1h" | "24h" | "7d">("1h")
const isAutoRefresh = ref(true)

const metrics = computed(() => {
  if (range.value === "1h") {
    return { throughput: "1.2k / мин", errors: 3, sla: "99.95%", dlq: 12 }
  }
  if (range.value === "24h") {
    return { throughput: "870k", errors: 41, sla: "99.89%", dlq: 87 }
  }
  return { throughput: "4.2M", errors: 213, sla: "99.72%", dlq: 302 }
})

const lastSync = ref("только что")
</script>

<template>
  <div
    class="relative h-[96vh] w-full text-slate-900 bg-white/30 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/25 shadow-lg shadow-white/10">
    <div class="mx-auto h-full max-w-7xl px-4 py-3 flex flex-col space-y-3 overflow-hidden ">
      <!-- Хлебные крошки -->
      <div class="text-xs uppercase tracking-[0.2em] text-slate-400">
        Главная ·
        <span class="text-slate-500 font-medium">Аналитика</span>
      </div>

      <!-- Заголовок + контролы -->
      <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Панель аналитики
          </h1>
          <p class="mt-1 text-sm text-slate-500 max-w-xl">
            Обзор состояния очередей сообщений: outbox, DLQ, лаги по топикам и соблюдение SLO.
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
              <span class="relative inline-flex h-5 w-9 items-center rounded-full transition bg-slate-200"
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
      </div>

      <!-- Контентная часть: занимает оставшееся место -->
      <div class="flex-1 flex flex-col space-y-3 overflow-hidden">
        <!-- Карточки с метриками -->
        <div class="grid gap-2.5 md:grid-cols-4">
          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Пропускная способность</div>
            <div class="mt-1.5 text-2xl font-semibold text-slate-900">{{ metrics.throughput }}</div>
            <p class="mt-0.5 text-xs text-slate-400">Отправлено сообщений</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Ошибки</div>
            <div class="mt-1.5 text-2xl font-semibold text-rose-500">{{ metrics.errors }}</div>
            <p class="mt-0.5 text-xs text-slate-400">FAILD TO FETCH и другие ошибки</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">SLO доставки</div>
            <div class="mt-1.5 text-2xl font-semibold text-emerald-600">{{ metrics.sla }}</div>
            <p class="mt-0.5 text-xs text-slate-400">Успешная доставка в целевое время</p>
          </div>

          <div
            class="rounded-2xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-3 flex flex-col justify-between">
            <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Dead Letter Queue</div>
            <div class="mt-1.5 text-2xl font-semibold text-amber-500">{{ metrics.dlq }}</div>
            <p class="mt-0.5 text-xs text-slate-400">Сообщений ожидают ручной обработки</p>
          </div>
        </div>

        <!-- Две основные панели -->
        <div class="grid gap-3 xl:grid-cols-2 flex-1 min-h-0">
          <section
            class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 min-h-0">
            <header class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">Outbox backlog</h2>
                <p class="mt-1 text-xs text-slate-500 max-w-sm">
                  Мониторинг готовых и плановых сообщений, лагов и <горячих> топиков.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <select
                  class="rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-sky-200">
                  <option>release.publish</option>
                  <option>user.events</option>
                  <option>billing.events</option>
                </select>
              </div>
            </header>

            <div class="grid gap-2.5 sm:grid-cols-4 mt-1">
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Готово</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">0</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Запланировано</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">0</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Горячий топик</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">-</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">SLO нарушено</div>
                <div class="mt-1 text-xl font-semibold text-emerald-600">0</div>
              </div>
            </div>

            <div
              class="mt-3 h-28 rounded-2xl border border-dashed border-white/50 bg-white/10 backdrop-blur flex items-center justify-center text-xs text-slate-400">
              Здесь будет график / чарты backlog'а по времени
            </div>

            <p class="mt-2 text-xs text-rose-500">
              Ошибка загрузки: FAILED TO FETCH. Проверьте соединение и попробуйте позже.
            </p>
          </section>

          <section
            class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 flex flex-col gap-3 min-h-0">
            <header class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">Dead Letter Queue</h2>
                <p class="mt-1 text-xs text-slate-500 max-w-sm">
                  Диагностика зависших сообщений. Повторные попытки и удаление помогают держать DLQ
                  под контролем.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <input type="number" min="10" max="500"
                  class="w-20 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-sky-200"
                  :value="50" />
                <span class="text-[11px] text-slate-400 uppercase tracking-[0.2em]">Лимит</span>
              </div>
            </header>

            <div class="grid gap-2.5 sm:grid-cols-3 mt-1">
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Сообщений</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">0</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Горячий топик</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">-</div>
              </div>
              <div class="rounded-2xl bg-white/25 border border-white/40 px-3 py-2.5">
                <div class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Макс. возраст</div>
                <div class="mt-1 text-xl font-semibold text-slate-900">-</div>
              </div>
            </div>

            <div
              class="mt-3 h-28 rounded-2xl border border-dashed border-white/50 bg-white/10 backdrop-blur flex items-center justify-center text-xs text-slate-400">
              Здесь будет таблица / список DLQ-сообщений
            </div>

            <p class="mt-2 text-xs text-rose-500">
              Ошибка статистики: FAILED TO FETCH. Проверьте соединение и попробуйте позже.
            </p>
          </section>
        </div>

        <!-- Таймлайн событий -->
        <section
          class="rounded-3xl bg-white/35 backdrop-blur border border-white/40 shadow-sm p-4 mt-1 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-900">Последние события системы</h2>
            <span class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Live log</span>
          </div>
          <p class="text-xs text-slate-500">
            Здесь можно отрисовать лог синхронизаций, ретраев и изменений конфигурации.
          </p>

          <div class="grid gap-2 sm:grid-cols-3">
            <div class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
              <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
              <div>
                <div class="font-medium text-slate-800">Синхронизация outbox завершена успешно</div>
                <div class="text-slate-400">12:03 · release.publish</div>
              </div>
            </div>

            <div class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
              <div class="mt-1 h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />
              <div>
                <div class="font-medium text-slate-800">Обнаружен рост DLQ для топика billing.events</div>
                <div class="text-slate-400">11:47 · 23 сообщения</div>
              </div>
            </div>

            <div class="flex items-start gap-2.5 text-xs rounded-2xl bg-white/25 border border-white/40 p-3">
              <div class="mt-1 h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
              <div>
                <div class="font-medium text-slate-800">FAILED TO FETCH при загрузке статистики</div>
                <div class="text-slate-400">11:32 · retry через 15 секунд</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
