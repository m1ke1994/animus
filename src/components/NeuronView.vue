<!-- NeuronView.vue -->
<template>
  <div class="neuron-root">
    <svg
      class="neuron-svg"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#75C2E8" stop-opacity="1" />
          <stop offset="45%" stop-color="#2C5D74" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#142130" stop-opacity="0.3" />
        </radialGradient>

        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6EB8E0" stop-opacity="0.45" />
          <stop offset="55%" stop-color="#39566B" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#142130" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="satGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#9AD7F4" stop-opacity="0.95" />
          <stop offset="40%" stop-color="#3C8AAD" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#142130" stop-opacity="0.3" />
        </radialGradient>

        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <!-- аксоны -->
      <g
        stroke="#2E4E60"
        stroke-width="1"
        stroke-opacity="0.65"
        filter="url(#softBlur)"
      >
        <line x1="200" y1="200" x2="200" y2="70" />
        <line x1="200" y1="200" x2="305" y2="110" />
        <line x1="200" y1="200" x2="325" y2="200" />
        <line x1="200" y1="200" x2="305" y2="290" />
        <line x1="200" y1="200" x2="200" y2="330" />
        <line x1="200" y1="200" x2="95" y2="290" />
      </g>

      <!-- орбиты -->
      <g fill="none" stroke="#6EB8E0" stroke-opacity="0.35">
        <circle cx="200" cy="200" r="70" stroke-width="3" />
        <circle cx="200" cy="200" r="105" stroke-width="2" />
      </g>

      <!-- мягкое свечение -->
      <circle
        cx="200"
        cy="200"
        r="110"
        fill="url(#ringGrad)"
        filter="url(#softBlur)"
      />

      <!-- ядро -->
      <circle cx="200" cy="200" r="55" fill="url(#coreGrad)" filter="url(#softBlur)" />
      <circle cx="200" cy="200" r="26" fill="#142130" fill-opacity="0.9" />
      <circle cx="200" cy="200" r="10" fill="#9AD7F4" fill-opacity="1" />

      <!-- сателлиты -->
      <g class="sat sat-1">
        <circle cx="200" cy="70" r="18" fill="url(#satGrad)" />
      </g>
      <g class="sat sat-2">
        <circle cx="305" cy="110" r="18" fill="url(#satGrad)" />
      </g>
      <g class="sat sat-3">
        <circle cx="325" cy="200" r="18" fill="url(#satGrad)" />
      </g>
      <g class="sat sat-4">
        <circle cx="305" cy="290" r="18" fill="url(#satGrad)" />
      </g>
      <g class="sat sat-5">
        <circle cx="200" cy="330" r="18" fill="url(#satGrad)" />
      </g>
      <g class="sat sat-6">
        <circle cx="95" cy="290" r="18" fill="url(#satGrad)" />
      </g>

      <!-- частицы -->
      <g class="float-particles">
        <circle cx="260" cy="230" r="2.5" fill="#9AD7F4" />
        <circle cx="260" cy="230" r="5" fill="#9AD7F4" opacity="0.4" />
        <circle cx="150" cy="100" r="1.7" fill="#9AD7F4" opacity="0.8" />
        <circle cx="320" cy="150" r="1.4" fill="#9AD7F4" opacity="0.7" />
        <circle cx="80" cy="200" r="1.7" fill="#9AD7F4" opacity="0.6" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.neuron-root {
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 400px;
  position: relative;
  overflow: hidden;
}

/* SVG растягивается по контейнеру */
.neuron-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* общая настройка анимаций */
.sat {
  transform-origin: center;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

/* траектории */
@keyframes satFloat1 { from { transform: translate(0,0); } to { transform: translate(8px,22px); } }
@keyframes satFloat2 { from { transform: translate(0,0); } to { transform: translate(14px,12px); } }
@keyframes satFloat3 { from { transform: translate(0,0); } to { transform: translate(18px,6px); } }
@keyframes satFloat4 { from { transform: translate(0,0); } to { transform: translate(10px,-20px); } }
@keyframes satFloat5 { from { transform: translate(0,0); } to { transform: translate(-8px,-22px); } }
@keyframes satFloat6 { from { transform: translate(0,0); } to { transform: translate(-16px,-12px); } }

@keyframes particlesFloat {
  from { transform: translate(-12px, 7px); }
  to   { transform: translate(16px, -14px); }
}

/* по умолчанию — спокойная анимация (для десктопа) */
.sat-1 { animation: satFloat1 4s infinite alternate ease-in-out; }
.sat-2 { animation: satFloat2 4.4s infinite alternate ease-in-out; }
.sat-3 { animation: satFloat3 4.1s infinite alternate ease-in-out; }
.sat-4 { animation: satFloat4 4.6s infinite alternate ease-in-out; }
.sat-5 { animation: satFloat5 4.2s infinite alternate ease-in-out; }
.sat-6 { animation: satFloat6 4.8s infinite alternate ease-in-out; }

.float-particles {
  animation: particlesFloat 5.2s ease-in-out infinite alternate;
  opacity: 0.85;
}

/* мобильная настройка — можно ускорить / изменить при желании */
@media (max-width: 640px) {
  .neuron-root {
    max-width: unset;
    max-height: unset;
  }
}
</style>
