<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { Globe, KeyRound, Mail, Moon, Sun } from 'lucide-vue-next'
import { loginWithEmail, storeAccessToken } from './api/auth'
import logoUrl from '@/assets/logo.png'

const { t, locale } = useI18n()
const router = useRouter()
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  initialValue: 'dark',
  storageKey: 'transithub-color-scheme',
})
const toggleDark = useToggle(isDark)
const toggleLocale = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const statusKey = ref<string | null>(null)
const errorKey = ref<string | null>(null)

const handleLogin = async () => {
  isLoading.value = true
  statusKey.value = null
  errorKey.value = null

  try {
    const response = await loginWithEmail({
      email: email.value,
      password: password.value,
    })
    storeAccessToken(response.accessToken)
    statusKey.value = 'auth.login.success'
    await router.push('/admin')
  } catch (error) {
    errorKey.value = error instanceof Error ? error.message : 'auth.errors.unknown'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-background p-4 sm:p-6">
    <div class="w-full max-w-sm">
      <div
        class="relative overflow-hidden rounded-xl border border-border/70 border-t-2 border-t-primary bg-surface-elevated p-6 shadow-xl shadow-black/10 sm:p-7"
      >
        <div class="mb-1 flex justify-end gap-1">
          <UiButton
            attr-type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-line hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :title="t('admin.layout.toggleLanguage')"
            :aria-label="t('admin.layout.toggleLanguage')"
            @click="toggleLocale"
          >
            <Globe class="h-4 w-4" aria-hidden="true" />
          </UiButton>
          <UiButton
            attr-type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-line hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :title="t('admin.layout.toggleTheme')"
            :aria-label="t('admin.layout.toggleTheme')"
            @click="toggleDark()"
          >
            <Moon v-if="!isDark" class="h-4 w-4" aria-hidden="true" />
            <Sun v-else class="h-4 w-4" aria-hidden="true" />
          </UiButton>
        </div>
        <div class="mb-7 text-center">
          <img
            :src="logoUrl"
            :alt="t('brand.logoAlt')"
            width="48"
            height="48"
            class="mx-auto mb-4 h-12 w-12 object-contain"
          />
          <h1 class="text-balance text-2xl font-semibold text-foreground">{{ t('auth.login.title') }}</h1>
          <p class="text-sm text-muted-foreground mt-2">{{ t('auth.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-2">
            <label for="login-email" class="text-sm font-medium text-foreground">{{ t('auth.login.email') }}</label>
            <UiInput
              id="login-email"
              v-model="email"
              name="email"
              type="email"
              :placeholder="t('auth.login.emailPlaceholder')"
              size="large"
              autocomplete="email"
              required
              :spellcheck="false"
              :disabled="isLoading"
            >
              <template #prefix>
                <Mail class="h-4 w-4" aria-hidden="true" />
              </template>
            </UiInput>
          </div>

          <div class="space-y-2">
            <label for="login-password" class="text-sm font-medium text-foreground">{{
              t('auth.login.password')
            }}</label>
            <UiInput
              id="login-password"
              v-model="password"
              name="password"
              type="password"
              :placeholder="t('auth.login.passwordPlaceholder')"
              size="large"
              autocomplete="current-password"
              required
              :disabled="isLoading"
            >
              <template #prefix>
                <KeyRound class="h-4 w-4" aria-hidden="true" />
              </template>
            </UiInput>
          </div>

          <p
            v-if="statusKey"
            class="rounded-lg border border-signal/20 bg-signal/10 px-4 py-3 text-sm font-medium text-signal"
            role="status"
            aria-live="polite"
          >
            {{ t(statusKey) }}
          </p>

          <p
            v-if="errorKey"
            class="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            role="alert"
          >
            {{ t(errorKey) }}
          </p>

          <n-button
            type="primary"
            attr-type="submit"
            size="large"
            block
            strong
            class="mt-2"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ t('auth.login.submit') }}
          </n-button>
        </form>
      </div>
    </div>
  </main>
</template>
