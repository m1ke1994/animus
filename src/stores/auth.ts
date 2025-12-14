import { computed, ref } from "vue"
import { defineStore } from "pinia"

type AuthUser = {
  email: string
  name: string
  role?: "admin" | "user"
  password?: string
}

const STORAGE_KEY = "animus_auth_user"
const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "admin"

const loadUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch (e) {
    console.error("Failed to parse auth user", e)
    return null
  }
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(loadUser())

  const isAuthenticated = computed(() => Boolean(user.value))

  const persist = (val: AuthUser | null) => {
    if (val) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: AuthUser = {
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "admin",
      }
      user.value = adminUser
      persist(adminUser)
      return true
    }

    const saved = loadUser()
    if (saved && saved.email === normalizedEmail && saved.password === password) {
      user.value = { ...saved }
      persist(saved)
      return true
    }

    return false
  }

  const register = (email: string, name: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const newUser: AuthUser = {
      email: normalizedEmail,
      name: name.trim() || "User",
      role: "user",
      password,
    }
    user.value = newUser
    persist(newUser)
    return true
  }

  const logout = () => {
    user.value = null
    persist(null)
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  }
})
