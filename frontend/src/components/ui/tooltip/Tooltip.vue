<script setup lang="ts">
import { ref } from 'vue'
import { NTooltip } from 'naive-ui'

defineProps<{ text: string; wide?: boolean }>()
const focused = ref(false)
</script>

<template>
  <NTooltip
    placement="top"
    :delay="150"
    :show="focused ? true : undefined"
    :style="{ maxWidth: wide ? '256px' : 'min(360px, calc(100vw - 32px))' }"
  >
    <template #trigger>
      <span class="inline-flex" @focusin="focused = true" @focusout="focused = false">
        <slot />
      </span>
    </template>
    {{ text }}
  </NTooltip>
</template>
