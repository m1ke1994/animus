import { createRouter, createWebHistory } from 'vue-router'

import LoginRegister from '@/views/Auth/LoginRegister.vue'
import ControlCenter from '@/views/ControlCenter.vue'
import Analytics from '@/views/Analytics.vue'
import Pipelines from '@/views/Pipelines.vue'
import Memory from '@/views/Memory.vue'
import Simulations from '@/views/Simulations.vue'
import Policies from '@/views/Policies.vue'
import Sensors from '@/views/Sensors.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ControlCenter
    },
    {
      path: '/auth',
      name: 'auth',
      component: LoginRegister
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics
    },
    {
      path: '/pipelines',
      name: 'pipelines',
      component: Pipelines
    },
    {
      path: '/memory',
      name: 'memory',
      component: Memory
    },
    {
      path: '/simulations',
      name: 'simulations',
      component: Simulations
    },
    {
      path: '/policies',
      name: 'policies',
      component: Policies
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: Sensors
    }
  ]
})

export default router
