<script setup lang="ts">
import { NPageHeader } from 'naive-ui'

defineProps<{ title: string; description?: string; titleId?: string }>()
</script>

<template>
  <NPageHeader class="app-page-header">
    <template #title><h1 :id="titleId" class="app-page-title">{{ title }}</h1></template>
    <template v-if="$slots.actions" #extra><div class="app-page-actions"><slot name="actions" /></div></template>
    <p v-if="description" class="app-page-description">{{ description }}</p>
    <slot />
  </NPageHeader>
</template>
