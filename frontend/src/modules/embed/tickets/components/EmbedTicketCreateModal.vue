<script setup lang="ts">
import { ref, watch } from 'vue'
import { NUpload, type UploadFileInfo } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { AlertCircle, Image as ImageIcon, Loader2, Paperclip, X } from 'lucide-vue-next'
import { createEmbedTicket } from '../api/tickets'

const props = withDefaults(defineProps<{
  open: boolean
  maxImages: number
  categoryOptions?: string[]
  priorityOptions?: string[]
}>(), {
  categoryOptions: () => [],
  priorityOptions: () => [],
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'created', id: string): void
}>()

const { t } = useI18n()

const manualEmail = ref('')
const title = ref('')
const body = ref('')
// 分类/优先级默认不自动选中，用户必须明确选择——空字符串代表"尚未选择"。
const category = ref('')
const priority = ref('')
const images = ref<File[]>([])
const isSubmitting = ref(false)
const errorKey = ref<string | null>(null)

const resetForm = () => {
  manualEmail.value = ''
  title.value = ''
  body.value = ''
  category.value = ''
  priority.value = ''
  images.value = []
  errorKey.value = null
  isSubmitting.value = false
}

// 弹窗每次打开都清空上一次可能残留的未提交内容和错误状态。
watch(() => props.open, (isOpen) => {
  if (isOpen) resetForm()
})

const canAttachMore = () => props.maxImages > 0 && images.value.length < props.maxImages

const handleFileChange = ({ file }: { file: UploadFileInfo }) => {
  const selected = file.file ? [file.file] : []
  if (selected.length === 0) return

  const remaining = Math.max(props.maxImages - images.value.length, 0)
  if (remaining <= 0) {
    errorKey.value = 'embed.tickets.errors.tooManyImages'
    return
  }
  if (selected.length > remaining) {
    errorKey.value = 'embed.tickets.errors.tooManyImages'
  }
  images.value = [...images.value, ...selected.slice(0, remaining)]
}

const removeImage = (index: number) => {
  images.value = images.value.filter((_, i) => i !== index)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 联系邮箱/标题/内容均为必填，且不会自动把 Sub2API 邮箱静默填入 manualEmail——用户必须自己
// 确认并输入联系邮箱。后端仍会做同样的必填/格式校验，前端校验只是提前给出友好提示。
const submit = async () => {
  if (!manualEmail.value.trim() || !title.value.trim() || !body.value.trim() || !category.value || !priority.value) {
    errorKey.value = 'embed.tickets.errors.formIncomplete'
    return
  }
  isSubmitting.value = true
  errorKey.value = null
  try {
    const detail = await createEmbedTicket({
      manualEmail: manualEmail.value.trim(),
      title: title.value.trim(),
      body: body.value.trim(),
      category: category.value,
      priority: priority.value,
    }, images.value)
    emit('created', detail.id)
    emit('close')
  } catch (error) {
    errorKey.value = error instanceof Error ? error.message : 'embed.tickets.errors.unknown'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiModal
    v-if="open"
    :show="Boolean(open)"
    :z-index="150"
    @mask-click="!isSubmitting && emit('close')"
    @esc="!isSubmitting && emit('close')"
  >
    <div
      v-if="open"
      role="dialog"
      aria-modal="true"
      :aria-label="t('embed.tickets.createModal.title')"
      class="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-2xl"
    >
      <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-card/95 backdrop-blur px-5 py-4"
      >
        <h2 class="text-sm font-semibold text-foreground">{{ t('embed.tickets.createModal.title') }}</h2>
        <UiButton
          attr-type="button"
          class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
          :disabled="isSubmitting"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </UiButton>
      </div>

      <div class="space-y-4 px-5 py-5">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">
            {{ t('embed.tickets.form.manualEmail') }}
            <span class="text-red-500 dark:text-red-400">*</span>
          </label>
          <UiInput
            v-model="manualEmail"
            type="email"
            class="h-10 w-full rounded-lg border border-border/50 bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            :placeholder="t('embed.tickets.form.manualEmailPlaceholder')"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">
            {{ t('embed.tickets.form.title') }}
            <span class="text-red-500 dark:text-red-400">*</span>
          </label>
          <UiInput
            v-model="title"
            type="text"
            class="h-10 w-full rounded-lg border border-border/50 bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            :placeholder="t('embed.tickets.form.titlePlaceholder')"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">
            {{ t('embed.tickets.form.body') }}
            <span class="text-red-500 dark:text-red-400">*</span>
          </label>
          <UiInput
            type="textarea"
            v-model="body"
            rows="4"
            class="w-full rounded-lg border border-border/50 bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            :placeholder="t('embed.tickets.form.bodyPlaceholder')"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-muted-foreground">
              {{ t('embed.tickets.form.category') }}
              <span class="text-red-500 dark:text-red-400">*</span>
            </label>
            <UiSelect
              v-model="category"
              class="h-10 w-full rounded-lg border border-border/50 bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <UiOption value="" disabled>{{ t('embed.tickets.form.categoryPlaceholder') }}</UiOption>
              <UiOption v-for="option in categoryOptions" :key="option" :value="option">{{ option }}</UiOption>
            </UiSelect>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-muted-foreground">
              {{ t('embed.tickets.form.priority') }}
              <span class="text-red-500 dark:text-red-400">*</span>
            </label>
            <UiSelect
              v-model="priority"
              class="h-10 w-full rounded-lg border border-border/50 bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <UiOption value="" disabled>{{ t('embed.tickets.form.priorityPlaceholder') }}</UiOption>
              <UiOption v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</UiOption>
            </UiSelect>
          </div>
        </div>

        <div v-if="maxImages > 0">
          <label class="mb-1 block text-xs font-medium text-muted-foreground">
            {{ t('embed.tickets.form.images') }}
            <span class="text-muted-foreground">{{
              t('embed.tickets.form.imagesCount', { count: images.length, max: maxImages })
            }}</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(image, index) in images"
              :key="`${image.name}-${index}`"
              class="flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface px-2 py-1.5 text-xs text-foreground"
            >
              <ImageIcon class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span class="max-w-[120px] truncate">{{ image.name }}</span>
              <span class="shrink-0 text-muted-foreground">{{ formatSize(image.size) }}</span>
              <UiButton
                attr-type="button"
                class="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-red-500"
                :disabled="isSubmitting"
                @click="removeImage(index)"
              >
                <X class="h-3 w-3" />
              </UiButton>
            </div>
            <NUpload
              v-if="canAttachMore()"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              :file-list="[]"
              :default-upload="false"
              :show-file-list="false"
              :disabled="isSubmitting"
              @change="handleFileChange"
            >
              <UiButton
                v-if="canAttachMore()"
                attr-type="button"
                class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <Paperclip class="h-3.5 w-3.5" />
                {{ t('embed.tickets.form.addImage') }}
              </UiButton>
            </NUpload>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('embed.tickets.form.imagesHint') }}</p>
        </div>

        <div
          v-if="errorKey"
          class="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning"
        >
          <AlertCircle class="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{{ t(errorKey) }}</span>
        </div>

        <div class="flex items-center justify-end gap-2">
          <UiButton
            attr-type="button"
            class="h-9 rounded-lg border border-border/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            {{ t('embed.tickets.form.cancel') }}
          </UiButton>
          <UiButton
            attr-type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="submit"
          >
            <Loader2 v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            {{ t('embed.tickets.form.submit') }}
          </UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>
