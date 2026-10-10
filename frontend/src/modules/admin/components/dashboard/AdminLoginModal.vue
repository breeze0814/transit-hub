<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, Loader2, ShieldCheck, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DashboardAdminLoginForm, DashboardAdminPlatform, Sub2apiAuthMethod } from '../../types/dashboardAdmin'

const props = defineProps<{
  open: boolean
  submitting: boolean
  errorKey: string | null
  /** 打开弹窗时用于预填的非敏感已知信息。 */
  initialValue?: Partial<DashboardAdminLoginForm>
}>()

const emit = defineEmits<{
  (event: 'submit', form: DashboardAdminLoginForm): void
  (event: 'close'): void
}>()

const { t } = useI18n()
const dialogRef = ref<HTMLElement | null>(null)
const titleId = 'admin-login-dialog-title'
const descriptionId = 'admin-login-dialog-description'
let previouslyFocusedElement: HTMLElement | null = null
let previousBodyOverflow = ''

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const restorePageFocus = () => {
  document.body.style.overflow = previousBodyOverflow
  previouslyFocusedElement?.focus()
  previouslyFocusedElement = null
}

const handleDialogKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !props.submitting) {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusableElements = Array.from(dialogRef.value.querySelectorAll<HTMLElement>(focusableSelector))
  if (focusableElements.length === 0) {
    event.preventDefault()
    dialogRef.value.focus()
    return
  }

  const first = focusableElements[0]
  const last = focusableElements[focusableElements.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const platform = ref<DashboardAdminPlatform>('sub2api')
const authMethod = ref<Sub2apiAuthMethod>('password')
const authMethods = computed<Sub2apiAuthMethod[]>(() =>
  platform.value === 'newapi' ? ['password', 'admin_key'] : ['password', 'token', 'admin_key'],
)

const siteUrl = ref('')
const email = ref('')
const password = ref('')
const accessToken = ref('')
const refreshToken = ref('')
const tokenType = ref('')
const adminKey = ref('')
const userId = ref('')

// 弹窗打开瞬间用 initialValue 预填非敏感字段，只填充一次，避免覆盖用户正在输入的内容；
// 同时必须清空敏感字段，因为组件常驻挂载，关闭弹窗不会销毁内部 ref，上一次输入的
// password/token/key 会残留在内存里。
const clearSensitiveFields = () => {
  password.value = ''
  accessToken.value = ''
  refreshToken.value = ''
  tokenType.value = ''
  adminKey.value = ''
  userId.value = ''
}

const applyInitialValue = () => {
  platform.value = props.initialValue?.platform ?? 'sub2api'
  siteUrl.value = props.initialValue?.siteUrl ?? ''
  authMethod.value = props.initialValue?.authMethod ?? 'password'
  email.value = props.initialValue?.email ?? ''
  clearSensitiveFields()
}

watch(
  () => props.open,
  (open) => {
    if (open) applyInitialValue()
    else clearSensitiveFields()
  },
)

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      restorePageFocus()
      return
    }
    previouslyFocusedElement = document.activeElement as HTMLElement | null
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialogRef.value?.querySelector<HTMLElement>('input:not([disabled])')?.focus()
  },
  { flush: 'post' },
)

onBeforeUnmount(restorePageFocus)

const canSubmit = computed(() => {
  if (!siteUrl.value.trim()) return false
  switch (authMethod.value) {
    case 'password':
      return Boolean(email.value.trim() && password.value.trim())
    case 'token':
      return platform.value === 'sub2api' && Boolean(accessToken.value.trim() || refreshToken.value.trim())
    case 'admin_key':
      return Boolean(adminKey.value.trim() && (platform.value === 'sub2api' || userId.value.trim()))
    default:
      return false
  }
})

const selectPlatform = (next: DashboardAdminPlatform) => {
  platform.value = next
  if (next === 'newapi' && authMethod.value === 'token') {
    authMethod.value = 'password'
  }
}

const handleSubmit = () => {
  if (!canSubmit.value || props.submitting) return
  emit('submit', {
    platform: platform.value,
    siteUrl: siteUrl.value.trim(),
    authMethod: authMethod.value,
    email: email.value.trim(),
    password: password.value,
    accessToken: accessToken.value.trim(),
    refreshToken: refreshToken.value.trim(),
    tokenType: tokenType.value.trim(),
    adminKey: adminKey.value.trim(),
    userId: userId.value.trim(),
  })
}
</script>

<template>
  <UiModal
    v-if="open"
    :show="Boolean(open)"
    :z-index="100"
    @mask-click="emit('close')"
    @esc="emit('close')"
    @keydown="handleDialogKeydown"
  >
    <div
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
      tabindex="-1"
      class="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-xl border border-border/70 border-t-2 border-t-primary bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 px-6 pt-6">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <div>
            <h2 :id="titleId" class="text-lg font-semibold text-foreground">
              {{ t('admin.dashboard.adminAuth.modal.title') }}
            </h2>
            <p :id="descriptionId" class="text-sm text-muted-foreground">
              {{ t('admin.dashboard.adminAuth.modal.subtitle') }}
            </p>
          </div>
        </div>
        <UiButton
          attr-type="button"
          class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          :title="t('admin.dashboard.adminAuth.modal.close')"
          :aria-label="t('admin.dashboard.adminAuth.modal.close')"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </UiButton>
      </div>

      <form class="space-y-5 px-6 py-6" @submit.prevent="handleSubmit">
        <!-- 平台选择 -->
        <div class="space-y-2">
          <span class="text-sm font-medium text-foreground">{{
            t('admin.dashboard.adminAuth.modal.platformLabel')
          }}</span>
          <NRadioGroup
            :value="platform"
            @update:value="selectPlatform($event)"
            :aria-label="t('admin.dashboard.adminAuth.modal.platformLabel')"
            size="small"
            class="ui-radio-segmented"
          >
            <NRadioButton :value="'sub2api'">
              <span class="block text-sm font-semibold">{{
                t('admin.dashboard.adminAuth.modal.platform.sub2api')
              }}</span>
            </NRadioButton>
            <NRadioButton :value="'newapi'">
              <span class="block text-sm font-semibold">{{
                t('admin.dashboard.adminAuth.modal.platform.newapi')
              }}</span>
            </NRadioButton>
          </NRadioGroup>
        </div>

        <!-- 站点域名 -->
        <div class="space-y-2">
          <label for="admin-login-site-url" class="text-sm font-medium text-foreground">{{
            t('admin.dashboard.adminAuth.modal.siteUrlLabel')
          }}</label>
          <Input
            id="admin-login-site-url"
            v-model="siteUrl"
            name="siteUrl"
            type="url"
            :placeholder="t('admin.dashboard.adminAuth.modal.siteUrlPlaceholder')"
            autocomplete="url"
            spellcheck="false"
          />
        </div>

        <!-- 登录方式 -->
        <div class="space-y-2">
          <span class="text-sm font-medium text-foreground">{{
            t('admin.dashboard.adminAuth.modal.methodLabel')
          }}</span>
          <NRadioGroup
            :value="authMethod"
            @update:value="authMethod = $event"
            :aria-label="t('admin.dashboard.adminAuth.modal.methodLabel')"
            size="small"
            class="ui-radio-segmented"
          >
            <NRadioButton v-for="method in authMethods" :key="method" :value="method">
              {{ t(`admin.dashboard.adminAuth.modal.method.${method}`) }}
            </NRadioButton>
          </NRadioGroup>
        </div>

        <!-- 邮箱/账号 + 密码 -->
        <div v-if="authMethod === 'password'" class="space-y-3">
          <Input
            v-model="email"
            :type="platform === 'newapi' ? 'text' : 'email'"
            :placeholder="
              platform === 'newapi'
                ? t('admin.dashboard.adminAuth.modal.fields.usernamePlaceholder')
                : t('admin.dashboard.adminAuth.modal.fields.emailPlaceholder')
            "
            :aria-label="
              platform === 'newapi'
                ? t('admin.dashboard.adminAuth.modal.fields.usernamePlaceholder')
                : t('admin.dashboard.adminAuth.modal.fields.emailPlaceholder')
            "
            name="adminIdentity"
            autocomplete="username"
          />
          <Input
            v-model="password"
            name="adminPassword"
            type="password"
            :placeholder="t('admin.dashboard.adminAuth.modal.fields.passwordPlaceholder')"
            :aria-label="t('admin.dashboard.adminAuth.modal.fields.passwordPlaceholder')"
            autocomplete="current-password"
          />
        </div>

        <!-- RT + AT（仅 sub2api token 模式） -->
        <div v-else-if="authMethod === 'token'" class="space-y-3">
          <Input
            v-model="accessToken"
            name="accessToken"
            :placeholder="t('admin.dashboard.adminAuth.modal.fields.accessTokenPlaceholder')"
            :aria-label="t('admin.dashboard.adminAuth.modal.fields.accessTokenPlaceholder')"
            autocomplete="off"
          />
          <Input
            v-model="refreshToken"
            name="refreshToken"
            :placeholder="t('admin.dashboard.adminAuth.modal.fields.refreshTokenPlaceholder')"
            :aria-label="t('admin.dashboard.adminAuth.modal.fields.refreshTokenPlaceholder')"
            autocomplete="off"
          />
          <Input
            v-model="tokenType"
            name="tokenType"
            :placeholder="t('admin.dashboard.adminAuth.modal.fields.tokenTypePlaceholder')"
            :aria-label="t('admin.dashboard.adminAuth.modal.fields.tokenTypePlaceholder')"
            autocomplete="off"
          />
          <p class="text-xs text-muted-foreground">
            {{ t('admin.dashboard.adminAuth.modal.fields.tokenHelp') }}
          </p>
        </div>

        <!-- Admin API Key / new-api system access token -->
        <div v-else class="space-y-3">
          <Input
            v-model="adminKey"
            name="adminKey"
            type="password"
            :placeholder="
              t(
                `admin.dashboard.adminAuth.modal.fields.${platform === 'newapi' ? 'newApiAdminKeyPlaceholder' : 'sub2apiAdminKeyPlaceholder'}`,
              )
            "
            :aria-label="
              t(
                `admin.dashboard.adminAuth.modal.fields.${platform === 'newapi' ? 'newApiAdminKeyPlaceholder' : 'sub2apiAdminKeyPlaceholder'}`,
              )
            "
            autocomplete="off"
          />
          <Input
            v-if="platform === 'newapi'"
            v-model="userId"
            name="userId"
            :placeholder="t('admin.dashboard.adminAuth.modal.fields.userIdPlaceholder')"
            :aria-label="t('admin.dashboard.adminAuth.modal.fields.userIdPlaceholder')"
            inputmode="numeric"
            autocomplete="off"
          />
          <p class="text-xs text-muted-foreground">
            {{
              t(
                `admin.dashboard.adminAuth.modal.fields.${platform === 'newapi' ? 'newApiAdminKeyHelp' : 'sub2apiAdminKeyHelp'}`,
              )
            }}
          </p>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="errorKey"
          class="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          <span>{{ t(errorKey) }}</span>
        </div>

        <Button type="submit" class="w-full" :disabled="!canSubmit || submitting">
          <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
          <ShieldCheck v-else class="h-4 w-4" />
          {{
            submitting ? t('admin.dashboard.adminAuth.modal.submitting') : t('admin.dashboard.adminAuth.modal.submit')
          }}
        </Button>
      </form>
    </div>
  </UiModal>
</template>
