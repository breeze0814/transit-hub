<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from 'vue-i18n'
import { NAlert, NCard, NForm, NFormItem } from 'naive-ui'
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-vue-next'
import { registerWithEmail, requestEmailCode, storeAccessToken } from './api/auth'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const code = ref('')
const isLoading = ref(false)
const isSendingCode = ref(false)
const statusKey = ref<string | null>(null)
const statusParams = ref<Record<string, string>>({})
const errorKey = ref<string | null>(null)

const handleSendCode = async () => {
  if (!email.value) return
  isSendingCode.value = true
  statusKey.value = null
  statusParams.value = {}
  errorKey.value = null

  try {
    const response = await requestEmailCode({ email: email.value })
    statusKey.value = 'auth.register.codeSentSuccess'
    statusParams.value = { code: response.code }
  } catch (error) {
    errorKey.value = error instanceof Error ? error.message : 'auth.errors.unknown'
  } finally {
    isSendingCode.value = false
  }
}

const handleRegister = async () => {
  isLoading.value = true
  statusKey.value = null
  statusParams.value = {}
  errorKey.value = null

  try {
    const response = await registerWithEmail({
      email: email.value,
      password: password.value,
      code: code.value,
    })
    storeAccessToken(response.accessToken)
    statusKey.value = 'auth.register.success'
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
      <UiButton attr-type="button" quaternary @click="router.push('/')">
        <template #icon><ArrowLeft class="h-4 w-4" /></template>
        {{ t('auth.backToHome') }}
      </UiButton>
      <span class="app-auth-brand">{{ t('brand.name') }}</span>
    </header>
    <div class="app-auth-body">
      <div class="app-auth-form">
        <NCard class="app-auth-card" :bordered="true">
          <div class="app-auth-heading">
            <h1>{{ t('auth.register.title') }}</h1>
            <p>{{ t('auth.register.subtitle') }}</p>
          </div>

          <NForm @submit.prevent="handleRegister">
            <NFormItem :label="t('auth.register.email')" path="email">
            <div class="relative">
              <Input
                v-model="email"
                type="email"
                :placeholder="t('auth.register.emailPlaceholder')"
                class="h-12 bg-surface border-border/50 focus:border-primary"
                autocomplete="email"
                :disabled="isLoading"
                required
              >
                <template #prefix><Mail class="w-4 h-4 text-muted-foreground" /></template>
              </Input>
            </div>
          </NFormItem>

          <NFormItem :label="t('auth.register.password')" path="password">
            <div class="relative">
              <Input
                v-model="password"
                type="password"
                :placeholder="t('auth.register.passwordPlaceholder')"
                class="h-12 bg-surface border-border/50 focus:border-primary"
                autocomplete="new-password"
                :disabled="isLoading"
                required
              >
                <template #prefix><KeyRound class="w-4 h-4 text-muted-foreground" /></template>
              </Input>
            </div>
          </NFormItem>

          <NFormItem :label="t('auth.register.code')" path="code">
            <div class="relative">
              <Input
                v-model="code"
                type="text"
                :placeholder="t('auth.register.codePlaceholder')"
                class="h-12 bg-surface border-border/50 focus:border-primary"
                autocomplete="one-time-code"
                :disabled="isLoading"
                required
              >
                <template #prefix><ShieldCheck class="w-4 h-4 text-muted-foreground" /></template>
                <template #suffix
                  ><UiButton
                    attr-type="button"
                    @click="handleSendCode"
                    :disabled="isSendingCode || isLoading || !email"
                    class="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1.5 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSendingCode ? t('auth.register.sendingCode') : t('auth.register.sendCode') }}
                  </UiButton></template
                >
              </Input>
            </div>
          </NFormItem>

          <NAlert
            v-if="statusKey"
            class="mb-4"
            type="success"
          >{{ t(statusKey, statusParams) }}</NAlert>

          <NAlert
            v-if="errorKey"
            class="mb-4"
            type="error"
          >{{ t(errorKey) }}</NAlert>

          <Button type="submit" class="w-full h-12 text-base font-bold mt-2 shadow-glow" :disabled="isLoading">
            {{ isLoading ? t('auth.register.submitting') : t('auth.register.submit') }}
          </Button>

          <div class="mt-5 text-center text-sm">
            <span class="text-muted-foreground">{{ t('auth.register.hasAccount') }}</span>
            <router-link to="/login" class="text-primary hover:text-primary/80 font-medium ml-1 transition-colors">
              {{ t('auth.register.loginLink') }}
            </router-link>
          </div>
          </NForm>
        </NCard>
      </div>
    </div>
  </main>
</template>
