import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginRegister from '@/views/Auth/LoginRegister.vue'
import ControlCenter from '@/views/ControlCenter.vue'
import Analytics from '@/views/Analytics.vue'
import Pipelines from '@/views/Pipelines.vue'
import Memory from '@/views/Memory.vue'
import Simulations from '@/views/Simulations.vue'
import Policies from '@/views/Policies.vue'
import Sensors from '@/views/Sensors.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ControlCenter,
      meta: { requiresAuth: true },
    },
    {
      path: '/authregister',
      name: 'authregister',
      component: LoginRegister,
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics,
      meta: { requiresAuth: true },
    },
    {
      path: '/pipelines',
      name: 'pipelines',
      component: Pipelines,
      meta: { requiresAuth: true },
    },
    {
      path: '/memory',
      name: 'memory',
      component: Memory,
      meta: { requiresAuth: true },
    },
    {
      path: '/simulations',
      name: 'simulations',
      component: Simulations,
      meta: { requiresAuth: true },
    },
    {
      path: '/policies',
      name: 'policies',
      component: Policies,
      meta: { requiresAuth: true },
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: Sensors,
      meta: { requiresAuth: true },
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFound,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.name === 'authregister' && auth.isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.name === 'not-found') {
    return next()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'authregister', query: { redirect: to.fullPath } })
  }

  return next()
})

export default router
