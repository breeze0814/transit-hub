<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NButton } from 'naive-ui'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'default' | 'secondary' | 'destructive' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
  }>(),
  {
    type: 'button',
    variant: 'default',
    size: 'default',
  },
)

const attrs = useAttrs()
const buttonSize = computed(() => ({ default: 'medium', sm: 'small', lg: 'large' }[props.size] as 'small' | 'medium' | 'large'))
const buttonType = computed(() => (props.variant === 'destructive' ? 'error' : 'primary'))
</script>

<template>
  <n-button
    v-bind="attrs"
    :type="buttonType"
    :size="buttonSize"
    :attr-type="type"
    :secondary="variant === 'secondary'"
    :quaternary="variant === 'ghost'"
  >
    <slot />
  </n-button>
</template>
