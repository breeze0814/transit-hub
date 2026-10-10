<script setup lang="ts">
import { NButton, NMenu, type MenuOption } from 'naive-ui'
import { LogOut, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import logoUrl from '@/assets/logo.png'

defineProps<{ options: MenuOption[]; selected: string; expandedKeys: string[]; mobile?: boolean }>()
const emit = defineEmits<{ close: []; logout: []; 'update:expandedKeys': [keys: string[]] }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex h-full flex-col bg-surface-elevated">
    <div class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/40 px-5">
      <div class="flex items-center gap-2">
        <img :src="logoUrl" :alt="t('brand.logoAlt')" width="32" height="32" class="h-8 w-8 object-contain" />
        <span class="text-xl font-bold text-foreground">{{ t('brand.name') }}</span>
      </div>
      <NButton v-if="mobile" quaternary circle :aria-label="t('admin.layout.closeNavigation')" @click="emit('close')">
        <X class="h-4 w-4" />
      </NButton>
    </div>
    <nav class="min-h-0 flex-1 overflow-y-auto px-2 py-4" :aria-label="t('brand.name')">
      <NMenu
        :options="options"
        :value="selected"
        :expanded-keys="expandedKeys"
        :indent="18"
        :root-indent="16"
        :icon-size="20"
        @update:expanded-keys="emit('update:expandedKeys', $event)"
      />
    </nav>
    <div class="border-t border-border/40 p-4">
      <NButton quaternary block @click="emit('logout')">
        <template #icon><LogOut class="h-4 w-4" /></template>
        {{ t('admin.menu.signOut') }}
      </NButton>
    </div>
  </div>
</template>
