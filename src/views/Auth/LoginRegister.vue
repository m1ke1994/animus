<template>
  <div class="page">
    <div class="content">
      <header class="brand-block">
        <AnimusLogo :width="88" :height="88" :animate="true" />

        <div class="brand-text">
          <h1 class="text-white font-bold">Animus</h1>
          <p class="subtitle text-slate-900 font-bold">
            Контрольная панель синхронизации: тонкое управление потоками данных.
          </p>
        </div>
      </header>

      <main class="glass-card">
        <div class="tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'">
            Вход
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'">
            Регистрация
          </button>
        </div>

        <transition name="fade-slide" mode="out-in">
          <section :key="mode" class="form-section">
            <form v-if="mode === 'login'" @submit.prevent="onLogin">
              <p class="form-caption text-slate-900 text-center font-bold">
                Введите email и пароль, чтобы открыть дашборд.
              </p>

              <label for="login-email" class="text-slate-600 font-bold">EMAIL *</label>
              <input
                id="login-email"
                type="email"
                v-model="loginForm.email"
                placeholder="name@example.com" />

              <label for="login-password" class="text-slate-600 font-bold">Пароль *</label>
              <input
                id="login-password"
                type="password"
                v-model="loginForm.password"
                placeholder="••••••••" />

              <button type="submit" class="primary-btn">
                Войти
              </button>

              <p v-if="authError" class="error-text">{{ authError }}</p>

              <button
                type="button"
                class="link-btn text-slate-600 font-bold"
                @click="mode = 'register'">
                Нет аккаунта? Зарегистрируйтесь
              </button>
            </form>

            <form v-else @submit.prevent="onRegister">
              <p class="form-caption text-slate-900 text-center font-bold">
                Создайте учётную запись и сразу переходите к панели.
              </p>

              <label for="reg-email" class="text-slate-600 font-bold">EMAIL *</label>
              <input
                id="reg-email"
                type="email"
                v-model="registerForm.email"
                placeholder="name@example.com" />

              <div class="field-label">
                <label for="reg-name" class="text-slate-600 font-bold">Имя</label>
                <span class="field-helper text-slate-600 font-bold">Опционально</span>
              </div>
              <input
                id="reg-name"
                type="text"
                v-model="registerForm.name"
                placeholder="Как к вам обращаться" />

              <div class="field-label">
                <label for="reg-password" class="text-slate-600 font-bold">Пароль *</label>
                <span class="field-helper text-slate-600 font-bold">Мин. 8 символов</span>
              </div>
              <input
                id="reg-password"
                type="password"
                v-model="registerForm.password"
                placeholder="••••••••" />

              <button type="submit" class="primary-btn ">
                Зарегистрироваться
              </button>

              <p v-if="authError" class="error-text">{{ authError }}</p>

              <button
                type="button"
                class="link-btn text-slate-600 font-bold"
                @click="mode = 'login'">
                Уже есть вход? Перейти к авторизации
              </button>
            </form>
          </section>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import AnimusLogo from "@/components/AnimusLogo.vue"
import { useAuthStore } from "@/stores/auth"

const mode = ref<"login" | "register">("login")
const loginForm = reactive({
  email: "",
  password: "",
})
const registerForm = reactive({
  email: "",
  name: "",
  password: "",
})

const authError = ref("")
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const redirectAfterAuth = () => {
  const redirect = (route.query.redirect as string) || "/"
  void router.push(redirect)
}

const onLogin = () => {
  authError.value = ""
  if (!loginForm.email || !loginForm.password) {
    authError.value = "Введите email и пароль"
    return
  }

  const ok = authStore.login(loginForm.email, loginForm.password)
  if (ok) {
    redirectAfterAuth()
  } else {
    authError.value = "Неверный email или пароль"
  }
}

const onRegister = () => {
  authError.value = ""
  if (!registerForm.email || !registerForm.password) {
    authError.value = "Заполните email и пароль"
    return
  }

  authStore.register(registerForm.email, registerForm.name, registerForm.password)
  redirectAfterAuth()
}

watch(mode, () => {
  authError.value = ""
})
</script>

<style scoped>
.page {
  margin: 0;
  padding: 8px 12px 24px;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #e5e7eb;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.content {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 0;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.brand-text h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 16px;
}

.glass-card {
  position: relative;
  padding: 12px 12px 16px;
  border-radius: 18px;
  box-sizing: border-box;
  border: 1px solid rgba(148, 163, 184, 0.55);
  -webkit-backdrop-filter: blur(26px);
  backdrop-filter: blur(26px);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.9), 0 0 0 1px rgba(30, 64, 175, 0.2);
}

.tabs {
  display: flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(31, 41, 55, 0.9);
  margin-bottom: 10px;
}

.tab-btn {
  flex: 1;
  padding: 7px 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  color: #f9fafb;
  box-shadow: 0 0 18px rgba(37, 99, 235, 0.6);
}

.form-section {
  padding-top: 4px;
}

.form-caption {
  margin: 0 0 8px;
  font-size: 13px;
  text-align: center;
}

label {
  font-size: 11px;
  display: block;
  letter-spacing: 0.08em;
  color: rgb(15 23 42);
}

.field-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8px;
}

.field-helper {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(15 23 42 / 0.7);
}

input {
  width: 100%;
  padding: 11px 14px;
  background: transparent;
  border: 1px solid rgba(55, 65, 81, 0.9);
  border-radius: 10px;
  color: #f9fafb;
  margin-top: 4px;
  margin-bottom: 10px;
  outline: none;
  font-size: 14px;
}

input::placeholder {
  color: #1c2638;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.7), 0 0 30px rgba(37, 99, 235, 0.35);
}

.primary-btn {
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2px;
  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.08s ease;
  box-shadow: 0 16px 35px rgba(37, 99, 235, 0.6);
}

.primary-btn:hover {
  opacity: 0.96;
  transform: translateY(-3px);
}

.primary-btn:active {
  transform: translateY(0px) scale(0.99);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
}

.link-btn {
  width: 100%;
  margin-top: 10px;
  padding: 6px 4px;
  border: none;
  background: transparent;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.link-btn:hover {
  color: #e5e7eb;
  transition: all 0.3s ease;
}

.error-text {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #e11d48;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.18s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (min-width: 768px) {
  .page {
    padding: 14px 20px 36px;
    background: transparent;
    align-items: center;
  }

  .content {
    max-width: 480px;
    gap: 12px;
    padding-top: 0;
  }

  .glass-card {
    padding: 14px 16px 18px;
    border-radius: 20px;
  }

  .brand-text h1 {
    font-size: 28px;
  }
}
</style>
