<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { UiInput, UiNumberInput, UiDatePicker } from '../compat/controls'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string
    type?: string
    placeholder?: string
    autocomplete?: string
  }>(),
  {
    type: 'text',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const component = computed(() => props.type === 'number' ? UiNumberInput : props.type === 'datetime-local' ? UiDatePicker : UiInput)
</script>

<template>
  <component
    :is="component"
    v-bind="attrs"
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    @update:model-value="emit('update:modelValue', String($event ?? ''))"
  >
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
  </component>
</template>
