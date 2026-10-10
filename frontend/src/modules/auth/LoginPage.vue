<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { NAlert, NButton, NCard, NForm, NFormItem } from 'naive-ui'
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
  <main class="app-auth">
    <header class="app-auth-toolbar">
      <div class="app-auth-brand">
        <img :src="logoUrl" :alt="t('brand.logoAlt')" width="28" height="28" class="h-7 w-7 object-contain" />
        <span>{{ t('brand.name') }}</span>
      </div>
      <div class="flex items-center gap-1">
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
    </header>
    <div class="app-auth-body">
      <div class="app-auth-form">
        <NCard class="app-auth-card" :bordered="true">
          <div class="app-auth-heading">
            <h1>{{ t('auth.login.title') }}</h1>
            <p>{{ t('auth.login.subtitle') }}</p>
          </div>

          <NForm @submit.prevent="handleLogin">
            <NFormItem :label="t('auth.login.email')" path="email">
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
            </NFormItem>
            <NFormItem :label="t('auth.login.password')" path="password">
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
            </NFormItem>

          <NAlert
            v-if="statusKey"
            class="mb-4"
            type="success"
            role="status"
            aria-live="polite"
          >{{ t(statusKey) }}</NAlert>

          <NAlert
            v-if="errorKey"
            class="mb-4"
            type="error"
            role="alert"
          >{{ t(errorKey) }}</NAlert>

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
          </NForm>
        </NCard>
      </div>
    </div>
  </main>
</template>
