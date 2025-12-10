import { createRouter, createWebHistory } from 'vue-router'

import LoginRegister from '@/views/Auth/LoginRegister.vue'
import ControlCenter from '@/views/ControlCenter.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ControlCenter,
    },
    {
      path: '/authregister',
      name: 'authregister',
      component: LoginRegister,
    },
  ],
})

export default router
