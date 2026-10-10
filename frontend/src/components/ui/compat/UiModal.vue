<script setup lang="ts">
import { NModal } from 'naive-ui'
import { useAttrs, type Ref } from 'vue'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
withDefaults(defineProps<{ show: boolean; zIndex?: number; dismissible?: boolean; contentRef?: Ref<HTMLElement | null> }>(), { dismissible: true })
const emit = defineEmits<{ 'mask-click': []; 'esc': [] }>()
</script>

<template>
  <NModal
    :show="show"
    :z-index="zIndex"
    :mask-closable="dismissible"
    :close-on-esc="dismissible"
    @mask-click="emit('mask-click')"
    @esc="emit('esc')"
  >
    <div :ref="contentRef" v-bind="attrs" class="ui-modal-container" @click.self="dismissible && emit('mask-click')">
      <slot />
    </div>
  </NModal>
</template>
