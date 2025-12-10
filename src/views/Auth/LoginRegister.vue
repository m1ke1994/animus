<template>
  <div class="page">
    <div class="content">
      <!-- Центр — логотип + бренд -->
      <header class="brand-block">
        <AnimusLogo :width="88" :height="88" :animate="true" />

        <div class="brand-text">
          <h1 class="text-white font-bold">Animus</h1>
          <p class="subtitle text-slate-900 font-bold">
            Управление пайплайнами данных под полным контролем
          </p>
        </div>
      </header>

      <!-- Стеклянная карточка авторизации/регистрации -->
      <main class="glass-card">
        <!-- Переключатель вкладок -->
        <div class="tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            ВОЙТИ
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >
            РЕГИСТРАЦИЯ
          </button>
        </div>

        <!-- Содержимое -->
        <transition name="fade-slide" mode="out-in">
          <section :key="mode" class="form-section">
            <!-- LOGIN -->
            <form v-if="mode === 'login'" @submit.prevent="onLogin">
              <p class="form-caption text-slate-900 text-center font-bold">
                Вернитесь к управлению пайплайнами
              </p>

              <label for="login-email" class="text-slate-600 font-bold">EMAIL *</label>
              <input
                id="login-email"
                type="email"
                v-model="loginForm.email"
                placeholder="name@example.com"
              />

              <label for="login-password" class="text-slate-600 font-bold">ПАРОЛЬ *</label>
              <input
                id="login-password"
                type="password"
                v-model="loginForm.password"
                placeholder="Ваш пароль"
              />

              <button type="submit" class="primary-btn">
                ВОЙТИ
              </button>

              <button
                type="button"
                class="link-btn text-slate-600 font-bold"
                @click="mode = 'register'"
              >
                Нужен аккаунт? Зарегистрируйтесь
              </button>
            </form>

            <!-- REGISTER -->
            <form v-else @submit.prevent="onRegister">
              <p class="form-caption text-slate-900 text-center font-bold">
                Создайте рабочее место для своих данных
              </p>

              <!-- EMAIL -->
              <label for="reg-email" class="text-slate-600 font-bold">EMAIL *</label>
              <input
                id="reg-email"
                type="email"
                v-model="registerForm.email"
                placeholder="name@example.com"
              />

              <!-- ИМЯ -->
              <div class="field-label">
                <label for="reg-name" class="text-slate-600 font-bold">ИМЯ</label>
                <span class="field-helper text-slate-600 font-bold">НЕОБЯЗАТЕЛЬНО</span>
              </div>
              <input
                id="reg-name"
                type="text"
                v-model="registerForm.name"
                placeholder="Мария Дата-Операторщица"
              />

              <!-- ПАРОЛЬ -->
              <div class="field-label">
                <label for="reg-password" class="text-slate-600 font-bold">ПАРОЛЬ *</label>
                <span class="field-helper text-slate-600 font-bold">МИНИМУМ 8 СИМВОЛОВ</span>
              </div>
              <input
                id="reg-password"
                type="password"
                v-model="registerForm.password"
                placeholder="Придумайте надёжный пароль"
              />

              <button type="submit" class="primary-btn ">
                СОЗДАТЬ АККАУНТ
              </button>

              <button
                type="button"
                class="link-btn text-slate-600 font-bold"
                @click="mode = 'login'"
              >
                Уже есть аккаунт? Войти
              </button>
            </form>
          </section>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import AnimusLogo from "@/components/AnimusLogo.vue";

const mode = ref("login"); // 'login' | 'register'

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  email: "",
  name: "",
  password: "",
});

const onLogin = () => {
  console.log("login:", { ...loginForm });
  // TODO: вызвать API авторизации
};

const onRegister = () => {
  console.log("register:", { ...registerForm });
  // TODO: вызвать API регистрации
};
</script>

<style scoped>
.page {
  margin: 0;
  padding: 24px 16px;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #e5e7eb;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* блок с логотипом по центру */
.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
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

/* стеклянная карточка */
.glass-card {
  position: relative;
  padding: 18px 18px 20px;
  border-radius: 22px;
  box-sizing: border-box;
  border: 1px solid rgba(148, 163, 184, 0.55);
  -webkit-backdrop-filter: blur(26px);
  backdrop-filter: blur(26px);
  box-shadow:
    0 22px 60px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(30, 64, 175, 0.2);
}

/* tabs */
.tabs {
  display: flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(31, 41, 55, 0.9);
  margin-bottom: 14px;
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

/* форма внутри стекла */
.form-section {
  padding-top: 4px;
}

.form-caption {
  margin: 0 0 12px;
  font-size: 14px;
  text-align: center;
}

/* подписи полей */
label {
  font-size: 11px;
  display: block;
  letter-spacing: 0.08em;
  color: rgb(15 23 42); /* slate-900 */
}

.field-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 10px;
}

.field-helper {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(15 23 42 / 0.7); /* slate-900 but lighter */
}

/* инпуты */
input {
  width: 100%;
  padding: 11px 14px;
  background: transparent;
  border: 1px solid rgba(55, 65, 81, 0.9);
  border-radius: 10px;
  color: #f9fafb;
  margin-top: 4px;
  margin-bottom: 14px;
  outline: none;
  font-size: 14px;
}

input::placeholder {
  color:#1C2638;
}

input:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 1px rgba(37, 99, 235, 0.7),
    0 0 30px rgba(37, 99, 235, 0.35);
}

/* основная кнопка */
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

/* вторичная текстовая кнопка */
.link-btn {
  width: 100%;
  margin-top: 14px;
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

/* анимация переключения форм */
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

/* десктопные подправки */
@media (min-width: 768px) {
  .page {
    padding: 32px 24px;
    background: transparent;
  }

  .content {
    max-width: 480px;
    gap: 24px;
  }

  .glass-card {
    padding: 22px 24px 26px;
    border-radius: 24px;
  }

  .brand-text h1 {
    font-size: 28px;
  }
}
</style>
