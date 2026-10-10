import type { GlobalThemeOverrides } from 'naive-ui'

// Naive UI computes hover and alpha colors from concrete values; CSS owns the palette.
export function createNaiveTheme(): GlobalThemeOverrides {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(`--ui-${name}`).trim()
  const css = (name: string) => `var(--${name})`
  return {
    common: {
      fontFamily: css('font-body'), fontFamilyMono: css('font-mono'),
      bodyColor: token('background'), cardColor: token('card'), modalColor: token('card'),
      popoverColor: token('popover'), inputColor: token('input'), tableColor: token('card'),
      primaryColor: token('primary'), primaryColorHover: token('primary-hover'),
      primaryColorPressed: token('primary-pressed'), primaryColorSuppl: token('primary-hover'),
      infoColor: token('primary'), successColor: token('success'), warningColor: token('warning'), errorColor: token('error'),
      textColorBase: token('text'), textColor1: token('text'), textColor2: token('text-secondary'), textColor3: token('text-muted'),
      borderColor: token('border'), dividerColor: token('divider'),
      borderRadius: css('radius-control'), borderRadiusSmall: css('radius-control'), fontSize: '16px',
    },
    Card: { borderRadius: css('radius-panel'), borderColor: token('border'), boxShadow: 'none', paddingSmall: '16px', paddingMedium: '20px', titleFontSizeMedium: '15px', titleFontWeight: '600' },
    Button: { borderRadiusMedium: css('radius-control'), borderRadiusSmall: css('radius-control'), borderRadiusLarge: css('radius-control'), heightSmall: '32px', heightMedium: '36px', heightLarge: '42px', fontWeight: '500' },
    Input: { color: token('input'), colorFocus: token('input'), border: `1px solid ${token('control-border')}`, borderFocus: `1px solid ${token('primary')}`, boxShadowFocus: css('focus-ring') },
    Select: { peers: { InternalSelection: { color: token('input'), colorActive: token('input'), border: `1px solid ${token('control-border')}`, borderActive: `1px solid ${token('primary')}`, boxShadowActive: css('focus-ring') } } },
    Menu: { color: token('card'), itemColorActive: css('color-selected'), itemColorActiveHover: css('color-selected-hover'), itemTextColorActive: token('primary'), itemIconColorActive: token('primary'), itemTextColor: token('text-secondary'), itemTextColorHover: token('text'), itemBorderRadius: css('radius-control'), itemHeight: '40px', fontSize: '16px' },
    Tabs: { tabFontWeight: '500', tabFontWeightActive: '600', tabBorderRadius: css('radius-control'), panePaddingMedium: '16px 0 0' },
    Table: { thColor: token('table-header'), tdColor: token('card'), tdColorHover: token('table-hover'), borderColor: token('divider'), thFontWeight: '500', borderRadius: css('radius-panel') },
    Pagination: { itemSizeSmall: '30px', itemBorderRadius: css('radius-control') },
    Alert: { borderRadius: css('radius-control') },
    Tag: { borderRadius: '4px' },
    Drawer: { color: token('card') },
    PageHeader: { titleFontSize: '24px', titleFontWeight: '600' },
  }
}
