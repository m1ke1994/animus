<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hexes = Array.from({ length: 5 }, (_, i) => i + 1)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let fogMaterial: THREE.ShaderMaterial | null = null
let fogMesh: THREE.Mesh | null = null
let dnas: THREE.Object3D[] = []
let animationId = 0

const clock = new THREE.Clock()

// ==== Брейкпоинты ====
const isDesktop = () => window.innerWidth >= 1024

// ==== Инициализация ====
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Сцена
  scene = new THREE.Scene()

  // Камера
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 0, 10)

  // Рендерер
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Свет
  scene.add(new THREE.AmbientLight(0xffffff, 0.9))

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
  dirLight.position.set(1, 1.5, 3)
  scene.add(dirLight)

  // ==== Шейдерный туман ====
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    precision highp float;

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;

    const float FOG_BASE = 0.55;
    const float FOG_GAIN = 0.8;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i+vec2(1,0));
      float c = hash(i+vec2(0,1));
      float d = hash(i+vec2(1,1));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a,b,u.x) +
             (c-a)*u.y*(1.0-u.x) +
             (d-b)*u.x*u.y;
    }

    float fbm(vec2 p) {
      float v=0.0;
      float a=0.5;
      for(int i=0;i<5;i++){
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= uResolution.x / uResolution.y;

      float t = uTime * 0.05;

      float n1 = fbm(uv * 1.6 + vec2(t, 0.0));
      float n2 = fbm(uv * 0.9 + vec2(-t * 0.7, t * 0.4));
      float n  = mix(n1, n2, 0.5);

      float fogNoise = smoothstep(0.2, 0.9, n);

      float fogAmount = clamp(FOG_BASE + fogNoise * FOG_GAIN, 0.0, 1.0);

      vec3 fogColor = vec3(0.90, 0.95, 1.00);
      vec3 bg = vec3(0.16, 0.22, 0.34);

      vec3 color = mix(bg, fogColor, fogAmount);

      gl_FragColor = vec4(color, fogAmount * 0.85);
    }
  `

  fogMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
  })

  // Плоскость с туманом
  const createFogPlane = () => {
    if (!camera || !scene) return

    if (fogMesh) {
      scene.remove(fogMesh)
      fogMesh.geometry.dispose()
    }

    const distance = 5
    const fov = (camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * distance
    const width = height * camera.aspect

    fogMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      fogMaterial
    )

    fogMesh.position.set(0, 0, camera.position.z - distance)
    scene.add(fogMesh)
  }

  createFogPlane()

  // ==== Загрузка ДНК (Только на десктопе!) ====
  if (isDesktop()) {
    const loader = new OBJLoader()
    loader.load(
      '/dna.obj',
      (obj: THREE.Object3D) => {
        const setup = (model: THREE.Object3D) => {
          model.rotation.set(Math.PI / 2, 0, Math.PI / 2)
          model.scale.set(0.4, 0.4, 0.4)
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0xf3f3f3,
                metalness: 0.1,
                roughness: 0.4,
                transparent: true,
                opacity: 0.8,
              })
            }
          })
        }

        const left = obj
        setup(left)
        left.position.set(-2.2, 3, 3)
        scene!.add(left)

        const right = left.clone(true)
        setup(right)
        right.position.set(2.2, 3, 3)
        scene!.add(right)

        dnas = [left, right]
      }
    )
  }

  // ===== Анимация =====
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    if (fogMaterial) fogMaterial.uniforms.uTime.value = t

    dnas.forEach((dna, i) => {
      dna.rotation.z = Math.PI / 2 + t * (i === 0 ? 0.35 : -0.35)
    })

    renderer?.render(scene!, camera!)
  }

  animate()

  // ==== Ресайз ====
  const handleResize = () => {
    renderer?.setSize(window.innerWidth, window.innerHeight)

    if (camera) {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.position.z = isDesktop() ? 10 : 12
      camera.updateProjectionMatrix()
    }

    if (fogMaterial) {
      fogMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }

    createFogPlane()
  }

  window.addEventListener('resize', handleResize)

  // ==== Очистка ====
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    fogMesh?.geometry.dispose()
    fogMaterial?.dispose()
    renderer?.dispose()
  })
})

const hexStyle = (n: number, side: 'tl' | 'br') => {
  const size = (120 + ((n % 4) * 8)) / 3
  const baseRotate = side === 'tl' ? -6 : 8
  const spin = (side === 'tl' ? -1 : 1) * (5 + (n % 3) * 2)
  const offsetX = side === 'tl' ? 6 : 18
  const offsetY = side === 'tl' ? 6 : 18
  const x = (n * 18 + (side === 'tl' ? 4 : 10)) % 80 + offsetX
  const y = (n * 21 + (side === 'tl' ? 7 : 12)) % 80 + offsetY
  const duration = 20 + (n % 4) * 3
  const delay = -n * 0.8
  const dx = ((n % 2 === 0 ? 1 : -1) * (26 + (n % 4) * 9))
  const dy = ((n % 3 === 0 ? -1 : 1) * (20 + (n % 4) * 8))

  return {
    '--hex-size': `${size}px`,
    '--hex-rotate': `${baseRotate + n * 0.5}deg`,
    '--hex-spin': `${spin}deg`,
    '--hex-dur': `${duration}s`,
    '--hex-delay': `${delay}s`,
    '--x': `${x}%`,
    '--y': `${y}%`,
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
  } as Record<string, string>
}
</script>

<template>
  <canvas ref="canvasRef" class="bg-canvas" />
  <div class="hex-group hex-group--tl" aria-hidden="true">
    <img v-for="n in hexes" :key="`tl-${n}`" class="hex-img" src="/hexagon_icon_125735.svg" alt=""
      :style="hexStyle(n, 'tl')" />
  </div>
  <div class="hex-group hex-group--br" aria-hidden="true">
    <img v-for="n in hexes" :key="`br-${n}`" class="hex-img" src="/hexagon_icon_125735.svg" alt=""
      :style="hexStyle(n, 'br')" />
  </div>
</template>

<style scoped>
.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.hex-group {
  position: fixed;
  width: 42vw;
  height: 42vh;
  pointer-events: none;
  z-index: 11;
  overflow: visible;
}

.hex-group--tl {
  top: 0;
  left: 0;
}

.hex-group--br {
  right: 0;
  bottom: 0;
}

.hex-img {
  --hex-size: 40px;
  --hex-rotate: 0deg;
  --hex-spin: 6deg;
  --hex-dur: 20s;
  --hex-delay: 0s;
  --x: 0%;
  --y: 0%;
  --dx: 0px;
  --dy: 0px;
  position: absolute;
  top: var(--y);
  left: var(--x);
  width: var(--hex-size);
  height: var(--hex-size);
  transform: translate(-50%, -50%) rotate(var(--hex-rotate));
  opacity: 0.05;
  mix-blend-mode: screen;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.12));
  animation: floatSpin var(--hex-dur) ease-in-out infinite alternate;
  animation-delay: var(--hex-delay);
}

@keyframes floatSpin {
  0% {
    transform: translate(-50%, -50%) rotate(var(--hex-rotate));
  }

  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(calc(var(--hex-rotate) + var(--hex-spin)));
  }
}
</style>
