<!-- AnimusLogo.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    width?: number;   // CSS-ширина логотипа в px
    height?: number;  // CSS-высота логотипа в px
    animate?: boolean;
  }>(),
  {
    width: 56,
    height: 56,
    animate: true,
  }
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let frameId: number | null = null;
let startTime = 0;

const DPR = () => Math.min(2.5, window.devicePixelRatio || 1);
const TWO_PI = Math.PI * 2;

function resizeCanvas(ctx: CanvasRenderingContext2D) {
  const canvas = ctx.canvas;
  const cssWidth = props.width;
  const cssHeight = props.height;
  const dpr = DPR();

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawProceduralLogo(ctx: CanvasRenderingContext2D, size: number) {
  const radius = size * 0.42;
  const ringWidth = size * 0.12;
  const gapStart = Math.PI * 0.82;
  const gapEnd = Math.PI * 1.24;
  const color = 'rgba(240, 250, 255, 0.95)';

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Внешнее кольцо с разрывом
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI / 2, gapStart, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius, gapEnd, (Math.PI * 3) / 2, false);
  ctx.stroke();

  // "Стрелка" сверху
  const arrowHeight = size * 0.34;
  const arrowWidth = arrowHeight * 0.72;
  ctx.beginPath();
  ctx.moveTo(0, -radius - arrowHeight * 0.6);
  ctx.lineTo(arrowWidth / 2, -radius + arrowHeight * 0.22);
  ctx.lineTo(-arrowWidth / 2, -radius + arrowHeight * 0.22);
  ctx.closePath();
  ctx.fill();

  // Вертикальный "стержень" и дуга справа
  const stemX = -size * 0.12;
  const dHeight = size * 0.62;
  const dRadius = size * 0.28;
  ctx.lineWidth = ringWidth * 0.75;
  ctx.beginPath();
  ctx.moveTo(stemX, -dHeight / 2);
  ctx.lineTo(stemX, dHeight / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(stemX + dRadius, 0, dRadius, -Math.PI / 2, Math.PI / 2, false);
  ctx.stroke();

  // Коннекторы слева
  const connectorGap = size * 0.18;
  const connectorReach = radius * 1.08;
  const connectorRadius = ringWidth * 0.38;
  ctx.lineWidth = ringWidth * 0.6;
  ctx.beginPath();
  ctx.moveTo(stemX, -connectorGap);
  ctx.lineTo(-connectorReach, -connectorGap);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(stemX, connectorGap);
  ctx.lineTo(-connectorReach * 1.05, connectorGap);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-connectorReach - connectorRadius * 0.2, -connectorGap, connectorRadius, 0, TWO_PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-connectorReach * 1.05 - connectorRadius * 0.2, connectorGap, connectorRadius, 0, TWO_PI);
  ctx.fill();

  ctx.restore();
}

function renderFrame(ctx: CanvasRenderingContext2D, now: number) {
  const cssWidth = props.width;
  const cssHeight = props.height;
  const time = now - startTime;

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  ctx.save();
  ctx.translate(cssWidth / 2, cssHeight / 2);

 const baseSize = Math.min(cssWidth, cssHeight) * 0.75;
const pulse = props.animate
  ? 1 + Math.sin(time * 0.005) * 0.04
  : 1;


  drawProceduralLogo(ctx, baseSize * pulse);
  ctx.restore();
}

function startLoop(ctx: CanvasRenderingContext2D) {
  cancelLoop();
  startTime = performance.now();
  const tick = (now: number) => {
    renderFrame(ctx, now);
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);
}

function cancelLoop() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  resizeCanvas(ctx);
  startLoop(ctx);
});

onBeforeUnmount(() => {
  cancelLoop();
});

watch(
  () => [props.width, props.height] as const,
  () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resizeCanvas(ctx);
    startLoop(ctx);
  }
);
</script>

<template>
  <canvas ref="canvasRef" class="animus-logo"></canvas>
</template>

<style scoped>
.animus-logo {
  display: block;

  border-radius: 14px;
  background: transparent;
}
</style>
