<script setup lang="ts">
import { computed, ref } from 'vue'
import { darkTheme, lightTheme, zhCN, enUS, dateZhCN, dateEnUS, NConfigProvider, NDialogProvider, NGlobalStyle } from 'naive-ui'
import { useDark, useMutationObserver } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { createNaiveTheme } from './styles/naiveTheme'

useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  initialValue: 'dark',
  storageKey: 'transithub-color-scheme',
})

const isDark = ref(document.documentElement.classList.contains('dark'))
useMutationObserver(document.documentElement, () => {
  isDark.value = document.documentElement.classList.contains('dark')
}, { attributes: true, attributeFilter: ['class'] })
const { locale } = useI18n()

const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

const themeOverrides = computed(() => {
  // CSS tokens stay the source of truth so a theme switch updates Naive UI and legacy utility classes together.
  isDark.value
  return createNaiveTheme()
})
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="locale === 'zh-CN' ? zhCN : enUS"
    :date-locale="locale === 'zh-CN' ? dateZhCN : dateEnUS"
    abstract
  >
    <n-global-style />
    <NDialogProvider><router-view /></NDialogProvider>
  </n-config-provider>
</template>
