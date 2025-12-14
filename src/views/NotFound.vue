<template>
  <div class="notfound flex items-center justify-center h-[96vh]">
    <div class="glass w-full max-w-xl rounded-3xl border border-white/30 bg-white/25 backdrop-blur-xl shadow-lg shadow-white/10 p-6 text-slate-900 flex flex-col gap-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">404 · Страница не найдена</div>
      <h1 class="text-3xl font-semibold leading-tight">Кажется, мы потерялись.</h1>
      <p class="text-sm text-slate-500">
        Такой маршрут не существует. Попробуйте вернуться в панель или на экран входа.
      </p>
      <div class="flex flex-wrap gap-2">
        <RouterLink
          to="/"
          class="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition">
          В панель
        </RouterLink>
        <RouterLink
          to="/authregister"
          class="rounded-full bg-white/40 border border-white/50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white/50 active:scale-[0.98] transition">
          На вход
        </RouterLink>
      </div>
    </div>
  </div>
</template>
