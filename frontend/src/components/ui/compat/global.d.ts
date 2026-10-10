import type {
  UiButton,
  UiInput,
  UiNumberInput,
  UiDatePicker,
  UiChoice,
  UiSelect,
  UiOption,
  UiTable,
  UiTabs,
} from './controls'
import type UiModal from './UiModal.vue'
import type UiDrawer from './UiDrawer.vue'
import type {
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

declare module 'vue' {
  export interface GlobalComponents {
    NButton: typeof NButton
    NMenu: typeof NMenu
    NTabs: typeof NTabs
    NTab: typeof NTab
    NRadioGroup: typeof NRadioGroup
    NRadioButton: typeof NRadioButton
    NRadio: typeof NRadio
    NPagination: typeof NPagination
    NProgress: typeof NProgress
    NSkeleton: typeof NSkeleton
    UiButton: typeof UiButton
    UiInput: typeof UiInput
    UiNumberInput: typeof UiNumberInput
    UiDatePicker: typeof UiDatePicker
    UiChoice: typeof UiChoice
    UiSelect: typeof UiSelect
    UiOption: typeof UiOption
    UiTable: typeof UiTable
    UiTabs: typeof UiTabs
    UiModal: typeof UiModal
    UiDrawer: typeof UiDrawer
  }
}
