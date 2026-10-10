import { createApp, watch } from 'vue'
import {
  NButton,
  NMenu,
  NTabs,
  NTab,
  NRadioGroup,
  NRadioButton,
  NRadio,
  NPagination,
  NProgress,
  NSkeleton,
} from 'naive-ui'
import {
  UiButton,
  UiInput,
  UiNumberInput,
  UiDatePicker,
  UiChoice,
  UiSelect,
  UiOption,
  UiTable,
  UiTabs,
} from './components/ui/compat/controls'
import UiModal from './components/ui/compat/UiModal.vue'
import UiDrawer from './components/ui/compat/UiDrawer.vue'
import App from './App.vue'
import './styles/globals.css'
import { i18n } from './i18n'
import { router } from './router'

const app = createApp(App)
const localeRef = i18n.global.locale as unknown as { value: string }

watch(
  () => localeRef.value,
  (currentLocale) => {
    document.documentElement.lang = currentLocale
  },
  { immediate: true },
)

const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
const syncThemeColor = () => {
  themeColor?.setAttribute('content', document.documentElement.classList.contains('dark') ? '#101319' : '#f6f7f9')
}
const themeObserver = new MutationObserver(syncThemeColor)
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
})
syncThemeColor()

app.use(i18n)
app.use(router)
for (const [name, component] of Object.entries({
  NButton,
  NMenu,
  NTabs,
  NTab,
  NRadioGroup,
  NRadioButton,
  NRadio,
  NPagination,
  NProgress,
  NSkeleton,
  UiButton,
  UiInput,
  UiNumberInput,
  UiDatePicker,
  UiChoice,
  UiSelect,
  UiOption,
  UiTable,
  UiTabs,
  UiModal,
  UiDrawer,
})) {
  app.component(name, component)
}
app.mount('#app')
