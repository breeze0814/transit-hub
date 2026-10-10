import { onBeforeUnmount } from 'vue'
import { useDialog, type DialogReactive } from 'naive-ui'
import { useI18n } from 'vue-i18n'

export function useConfirm() {
  const dialog = useDialog()
  const { t } = useI18n()
  let active: { dialog: DialogReactive; resolve: (confirmed: boolean) => void } | null = null

  onBeforeUnmount(() => {
    active?.resolve(false)
    active?.dialog.destroy()
    active = null
  })

  return (content: string): Promise<boolean> => {
    if (active) return Promise.resolve(false)
    return new Promise((resolve) => {
      const finish = (confirmed: boolean) => {
        active = null
        resolve(confirmed)
      }
      const instance = dialog.warning({
        title: t('common.confirmation'),
        content,
        positiveText: t('common.confirm'),
        negativeText: t('common.cancel'),
        onPositiveClick: () => finish(true),
        onNegativeClick: () => finish(false),
        onClose: () => finish(false),
        onMaskClick: () => finish(false),
        onEsc: () => finish(false),
      })
      active = { dialog: instance, resolve }
    })
  }
}
