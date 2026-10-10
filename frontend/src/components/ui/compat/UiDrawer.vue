<script setup lang="ts">
import { NDrawer, NDrawerContent } from 'naive-ui'

withDefaults(defineProps<{ show: boolean; width?: string; zIndex?: number }>(), { width: '32rem' })
const emit = defineEmits<{ 'mask-click': []; 'esc': [] }>()
</script>

<template>
  <NDrawer
    :show="show"
    :width="`min(${width}, 100vw)`"
    :z-index="zIndex"
    @mask-click="emit('mask-click')"
    @esc="emit('esc')"
  >
    <NDrawerContent :body-content-style="{ padding: '0', height: '100%' }" :native-scrollbar="false">
      <slot />
    </NDrawerContent>
  </NDrawer>
</template>
