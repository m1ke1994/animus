<script setup lang="ts">
import DNABackground from './components/DNABackground.vue'

import { RouterView } from 'vue-router'
</script>

<template>
  <div class="relative min-h-screen text-white overflow-hidden w-full">
    <!-- 3D фон: фиксирован на весь экран -->
    <DNABackground class="fixed inset-0 -z-10" />

    <!-- Контентный слой -->
    <div
      class="relative z-10 min-h-screen flex flex-col
             pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <main
        class="flex-1 w-full lmax-w-5x 
               px-4 py-4
               sm:px-6 sm:py-6
               lg:px-8 lg:py-8
               overflow-x-hidden"
      >
        <RouterView />
        
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
