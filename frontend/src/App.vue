<script setup lang="ts">
import { computed, ref } from 'vue'
import { darkTheme, lightTheme, zhCN, enUS, dateZhCN, dateEnUS, NConfigProvider, NDialogProvider, NGlobalStyle, type GlobalThemeOverrides } from 'naive-ui'
import { useDark, useMutationObserver } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

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

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const dark = isDark.value
  return {
    common: {
      fontFamily: "'Segoe UI Variable', 'Segoe UI', 'Microsoft YaHei', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      bodyColor: dark ? '#101319' : '#f6f7f9',
      cardColor: dark ? '#161b22' : '#fcfcfd',
      modalColor: dark ? '#161b22' : '#fcfcfd',
      popoverColor: dark ? '#202633' : '#ffffff',
      inputColor: dark ? '#1a2028' : '#edf0f4',
      tableColor: dark ? '#161b22' : '#fcfcfd',
      primaryColor: dark ? '#6d9eff' : '#2c74e3',
      primaryColorHover: dark ? '#8bb4ff' : '#4a88ec',
      primaryColorPressed: dark ? '#4f7fd9' : '#235db6',
      infoColor: dark ? '#6d9eff' : '#2c74e3',
      successColor: '#4ecb93',
      warningColor: '#f5b85c',
      errorColor: '#f27676',
      borderRadius: '10px',
      borderRadiusSmall: '8px',
      borderColor: dark ? 'rgba(150, 167, 196, 0.18)' : 'rgba(61, 78, 109, 0.2)',
      dividerColor: dark ? 'rgba(150, 167, 196, 0.14)' : 'rgba(61, 78, 109, 0.14)',
      textColorBase: dark ? '#f5f7fb' : '#1a2233',
      textColor1: dark ? '#f5f7fb' : '#1a2233',
      textColor2: dark ? '#b8c3d8' : '#3f4d67',
      textColor3: dark ? '#8290aa' : '#687690',
    },
    Card: {
      color: 'hsl(var(--card))',
      colorModal: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border) / 0.78)',
      borderRadius: '12px',
      paddingMedium: '20px',
    },
    Button: {
      borderRadiusMedium: '9px',
      fontWeight: '600',
      heightMedium: '40px',
    },
    Input: {
      color: 'hsl(var(--surface))',
      colorFocus: 'hsl(var(--surface))',
      border: '1px solid hsl(var(--border))',
      borderFocus: '1px solid #6d9eff',
      boxShadowFocus: '0 0 0 2px rgba(109, 158, 255, 0.16)',
    },
    Layout: {
      color: 'hsl(var(--background))',
      colorEmbedded: 'hsl(var(--surface))',
      siderColor: 'hsl(var(--surface))',
      headerColor: 'hsl(var(--surface) / 0.86)',
      footerColor: 'hsl(var(--surface))',
    },
    Menu: {
      itemColorActive: 'hsl(var(--primary) / 0.14)',
      itemColorActiveHover: 'hsl(var(--primary) / 0.2)',
      itemTextColorActive: dark ? '#a9c4ff' : '#2b62c6',
      itemTextColor: 'hsl(var(--muted-foreground))',
      itemTextColorHover: 'hsl(var(--foreground))',
      itemBorderRadius: '9px',
    },
    Tag: {
      borderRadius: '999px',
    },
  }
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
