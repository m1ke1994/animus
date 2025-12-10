<!-- ControlCenterCard.vue -->
<template>
  <div class="cc-wrapper">
    <!-- круглая линза -->
    <div class="cc-lens">
      
      <!-- большая неон-линия -->
      <div class="cc-lens-bg" />

      <!-- внутреннее ядро -->
      <div class="cc-core">
        <div class="cc-core-inner" />
      </div>

      <!-- текст внутри линзы -->
      <div class="cc-text">
        <div class="cc-title">ИНСТРУМЕНТЫ</div>
        <div class="cc-subtitle">Центр управления</div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
/* Контейнер карточки */
.cc-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

/* ---------- ЛИНЗА ---------- */
.cc-lens {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.35s ease;
  cursor: pointer;
}

/* Hover — увеличение линзы */
.cc-lens:hover {
  transform: scale(1.07);
}

/* ---------- ФОН ЛИНЗЫ ---------- */
.cc-lens-bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 50% 50%, #75c2e8 0%, #2c5d74 45%, rgba(20, 33, 48, 0.3) 100%);
  box-shadow:
    0 0 22px rgba(20, 33, 48, 0.8),
    0 0 30px rgba(110, 184, 224, 0.25),
    inset 0 0 25px rgba(110, 184, 224, 0.2);
  animation: lensPulse 5s ease-in-out infinite;
}

/* ---------- ВНУТРЕННЕЕ ЯДРО ---------- */
.cc-core {
  width: 65px;
  height: 65px;
  border-radius: 999px;
  background: radial-gradient(circle, #75c2e8 0%, #2c5d74 50%, rgba(20, 33, 48, 0.4));
  filter: drop-shadow(0 0 10px rgba(154, 215, 244, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;

  animation: corePulse 4s ease-in-out infinite;
}

.cc-core-inner {
  width: 22px;
  height: 22px;
  border-radius: inherit;
  background: radial-gradient(circle, #9ad7f4 0%, #142130 80%);
}

/* ---------- ТЕКСТ ВНУТРИ ЛИНЗЫ ---------- */
.cc-text {
  position: absolute;
  text-align: center;
}

.cc-title {
  color: rgba(154, 215, 244, 0.9);
  text-transform: uppercase;
  font-size: 0.55rem;
  letter-spacing: 0.35em;
  font-weight: 600;
}

.cc-subtitle {
  margin-top: 0.55rem;
  font-size: 0.85rem;
  color: #e8f7ff;
  opacity: 0.95;
  font-weight: 500;
}

/* ---------- АНИМАЦИИ ---------- */
@keyframes lensPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

@keyframes corePulse {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(154, 215, 244, 0.8));
  }
  50% {
    transform: scale(1.12);
    filter: drop-shadow(0 0 14px rgba(154, 215, 244, 1));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(154, 215, 244, 0.8));
  }
}
</style>
