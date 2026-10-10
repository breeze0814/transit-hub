import {
  defineComponent,
  cloneVNode,
  h,
  isVNode,
  mergeProps,
  nextTick,
  ref,
  type Component,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue'
import {
  NButton,
  NCheckbox,
  NDatePicker,
  NInput,
  NInputNumber,
  NRadio,
  NSelect,
  NSwitch,
  NTable,
  NTabs,
  NTab,
  type InputInst,
} from 'naive-ui'

// Preserve layout classes while Naive UI owns the control's border, surface and padding.
function layoutClass(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(layoutClass)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) => layoutClass(key)))
  }
  if (typeof value !== 'string') return value
  return value
    .split(/\s+/)
    .filter(
      (token) =>
        !/^(?:[^:]+:)*(?:bg-|border(?:-|$)|rounded|p[xytrbl]?\-|shadow|appearance-|outline-|ring-|focus|placeholder:|resize-|sr-only|peer)/.test(
          token,
        ),
    )
    .join(' ')
}

function invoke(listener: unknown, ...args: unknown[]) {
  if (Array.isArray(listener)) listener.forEach((item) => invoke(item, ...args))
  else if (typeof listener === 'function') listener(...args)
}

function eventFor(value: unknown, checked?: boolean) {
  return { target: { value, checked }, currentTarget: { value, checked } }
}

const valueProp = {
  type: [String, Number, Boolean, Array, Object] as PropType<
    string | number | boolean | unknown[] | Record<string, unknown> | Set<unknown> | null
  >,
  default: undefined,
}

export const UiButton = defineComponent({
  name: 'UiButton',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const button = ref<{ $el?: HTMLElement } | null>(null)
    expose({
      focus: (options?: FocusOptions) => button.value?.$el?.focus(options),
      blur: () => button.value?.$el?.blur(),
    })
    return () =>
      h(
        NButton,
        mergeProps(attrs, {
          ref: button,
          text: !['secondary', 'tertiary', 'quaternary', 'ghost', 'dashed'].some(
            (key) => key in attrs && attrs[key] !== false,
          ),
          class: 'ui-action',
          // Native button layouts include clickable rows, navigation and thumbnails.
          // Their dimensions and flex/grid alignment are retained on the actual button.
        }),
        slots,
      )
  },
})

export const UiInput = defineComponent({
  name: 'UiInput',
  inheritAttrs: false,
  props: {
    modelValue: valueProp,
    value: valueProp,
    modelModifiers: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, expose, slots }) {
    const input = ref<InputInst | null>(null)
    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      select: () => input.value?.select(),
    })
    return () => {
      const type = String(attrs.type ?? 'text')
      const value = props.modelValue === undefined ? props.value : props.modelValue
      const multiline = type === 'textarea'
      const nativeProps: Record<string, unknown> = {}
      const controlProps: Record<string, unknown> = {}
      for (const [key, item] of Object.entries(attrs)) {
        if (['class', 'style', 'type', 'rows', 'onInput', 'onChange', 'onFocus', 'onBlur'].includes(key)) continue
        if (
          [
            'disabled',
            'readonly',
            'placeholder',
            'maxlength',
            'minlength',
            'clearable',
            'size',
            'status',
            'show-password-on',
            'autosize',
          ].includes(key)
        )
          controlProps[key] = item === '' ? true : item
        else nativeProps[key] = item
      }
      if (!multiline && type !== 'password') nativeProps.type = type
      const originalClass = typeof attrs.class === 'string' ? attrs.class : ''
      nativeProps.class = originalClass
        .split(/\s+/)
        .filter((token) => /^(?:pl-|pr-|font-mono|text-(?:xs|sm)|leading-)/.test(token))
        .join(' ')
      const update = (next: string) => {
        let result: string | number = props.modelModifiers.trim ? next.trim() : next
        if (props.modelModifiers.number) {
          const numeric = Number.parseFloat(String(result))
          if (!Number.isNaN(numeric)) result = numeric
        }
        if (!props.modelModifiers.lazy) emit('update:modelValue', result)
      }
      return h(
        NInput,
        {
          ...controlProps,
          ref: input,
          class: ['ui-input', layoutClass(attrs.class)],
          style: attrs.style,
          value: String(value ?? ''),
          type: multiline ? 'textarea' : type === 'password' ? 'password' : 'text',
          rows: Number(attrs.rows ?? 3),
          inputProps: nativeProps,
          'onUpdate:value': update,
          onInput: (next: string) => {
            const target = multiline ? input.value?.textareaElRef : input.value?.inputElRef
            invoke(attrs.onInput, {
              target: target ?? { value: next },
              currentTarget: target ?? { value: next },
            })
          },
          onChange: (next: string) => {
            if (props.modelModifiers.lazy) emit('update:modelValue', next)
            const target = multiline ? input.value?.textareaElRef : input.value?.inputElRef
            invoke(attrs.onChange, {
              target: target ?? { value: next },
              currentTarget: target ?? { value: next },
            })
          },
          onFocus: (event: FocusEvent) => invoke(attrs.onFocus, event),
          onBlur: (event: FocusEvent) => invoke(attrs.onBlur, event),
        },
        slots,
      )
    }
  },
})

export const UiChoice = defineComponent({
  name: 'UiChoice',
  inheritAttrs: false,
  props: {
    modelValue: valueProp,
    value: valueProp,
    checked: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    return () => {
      const isRadio = attrs.type === 'radio'
      const array = Array.isArray(props.modelValue) ? props.modelValue : null
      const set = props.modelValue instanceof Set ? props.modelValue : null
      const checked =
        props.checked ??
        (isRadio
          ? props.modelValue === props.value
          : array
            ? array.includes(props.value)
            : set
              ? set.has(props.value)
              : Boolean(props.modelValue))
      const forwarded = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => !['type', 'class', 'switch', 'onChange'].includes(key)),
      )
      const isSwitch = !isRadio && (attrs.switch === '' || attrs.switch === true)
      const component: Component = isRadio ? NRadio : isSwitch ? NSwitch : NCheckbox
      const hasLabel = Boolean(slots.default) && component !== NSwitch
      const classes = layoutClass(attrs.class)
      return h(
        component,
        {
          ...forwarded,
          class: hasLabel
            ? [
                'ui-choice',
                typeof classes === 'string'
                  ? classes
                      .split(/\s+/)
                      .filter((token) => !/^(?:h-|w-|shrink-)/.test(token))
                      .join(' ')
                  : classes,
              ]
            : classes,
          ...(isSwitch ? { value: checked } : { checked, value: props.value }),
          [isSwitch ? 'onUpdate:value' : 'onUpdate:checked']: (next: boolean) => {
            let result: unknown = isRadio ? props.value : next
            if (array) result = next ? [...array, props.value] : array.filter((item) => item !== props.value)
            if (set) {
              const copy = new Set(set)
              if (next) copy.add(props.value)
              else copy.delete(props.value)
              result = copy
            }
            if (!isRadio || next) {
              emit('update:modelValue', result)
              invoke(attrs.onChange, eventFor(props.value, next))
            }
          },
        },
        slots,
      )
    }
  },
})

// Declarative option data is collected by UiSelect and rendered by NSelect.
export const UiOption = defineComponent({
  name: 'UiOption',
  setup: () => () => null,
})

function nodeText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(nodeText).join('')
  if (isVNode(value)) return nodeText(value.children)
  return ''
}

export const UiSelect = defineComponent({
  name: 'UiSelect',
  inheritAttrs: false,
  props: {
    modelValue: valueProp,
    value: valueProp,
    modelModifiers: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    return () => {
      const options: {
        label: string
        value: string | number
        disabled: boolean
      }[] = []
      function visit(nodes: VNodeChild[]) {
        for (const node of nodes) {
          if (!isVNode(node)) continue
          if (node.type === UiOption) {
            const item = node.props ?? {}
            const children = node.children as {
              default?: () => VNode[]
            } | null
            options.push({
              label: nodeText(children?.default?.() ?? node.children).trim(),
              value: item.value ?? '',
              disabled: item.disabled === '' || item.disabled === true,
            })
          } else if (Array.isArray(node.children)) visit(node.children)
        }
      }
      visit(slots.default?.() ?? [])
      const forwarded = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => !['class', 'onChange', 'multiple'].includes(key)),
      )
      const value = props.modelValue === undefined ? props.value : props.modelValue
      const selected = Array.isArray(value)
        ? value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
        : typeof value === 'string' || typeof value === 'number'
          ? value
          : null
      return h(
        NSelect,
        {
          ...forwarded,
          class: ['ui-select', layoutClass(attrs.class)],
          options,
          value: selected,
          multiple: attrs.multiple === '' || attrs.multiple === true,
          'onUpdate:value': (next: string | number | null) => {
            const numeric = Number.parseFloat(String(next))
            const result = props.modelModifiers.number && !Number.isNaN(numeric) ? numeric : next
            emit('update:modelValue', result)
            invoke(attrs.onChange, eventFor(result))
          },
        },
        { prefix: slots.prefix, suffix: slots.suffix },
      )
    }
  },
})

export const UiDatePicker = defineComponent({
  name: 'UiDatePicker',
  inheritAttrs: false,
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h(NDatePicker, {
        ...attrs,
        class: layoutClass(attrs.class),
        type: 'datetime',
        valueFormat: "yyyy-MM-dd'T'HH:mm",
        formattedValue: props.modelValue || null,
        clearable: true,
        'onUpdate:formattedValue': (next: string | null) => emit('update:modelValue', next ?? ''),
      })
  },
})

export const UiNumberInput = defineComponent({
  name: 'UiNumberInput',
  inheritAttrs: false,
  props: {
    modelValue: valueProp,
    value: valueProp,
    modelModifiers: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    return () => {
      const value = props.modelValue === undefined ? props.value : props.modelValue
      const forwarded = Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) =>
            ![
              'class',
              'type',
              'onInput',
              'onChange',
              'min',
              'max',
              'step',
              'id',
              'name',
              'required',
              'autocomplete',
              'aria-label',
              'aria-labelledby',
              'aria-describedby',
            ].includes(key),
        ),
      )
      const inputProps = Object.fromEntries(
        Object.entries(attrs).filter(([key]) =>
          ['id', 'name', 'required', 'autocomplete', 'aria-label', 'aria-labelledby', 'aria-describedby'].includes(key),
        ),
      )
      return h(
        NInputNumber,
        {
          ...forwarded,
          inputProps,
          class: layoutClass(attrs.class),
          value: value === '' || value == null ? null : Number(value),
          min: attrs.min == null ? undefined : Number(attrs.min),
          max: attrs.max == null ? undefined : Number(attrs.max),
          step: attrs.step == null || attrs.step === 'any' ? 1 : Number(attrs.step),
          showButton: attrs['show-button'] === true || attrs['show-button'] === '',
          'onUpdate:value': (next: number | null) => {
            emit('update:modelValue', props.modelModifiers.number ? (next ?? '') : next == null ? '' : String(next))
            invoke(attrs.onInput, eventFor(next == null ? '' : String(next)))
            invoke(attrs.onChange, eventFor(next == null ? '' : String(next)))
          },
        },
        slots,
      )
    }
  },
})

// NTable preserves the existing accessible table headers, row content and actions.
export const UiTable = defineComponent({
  name: 'UiTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(NTable, { ...attrs, bordered: false, singleLine: true, size: 'small' }, slots)
  },
})

// NTab renders its own chrome; add the tab semantics and keyboard navigation.
export const UiTabs = defineComponent({
  name: 'UiTabs',
  inheritAttrs: false,
  props: { value: { type: [String, Number] as PropType<string | number>, required: true } },
  emits: ['update:value'],
  setup(props, { attrs, emit, slots }) {
    return () => {
      const tabs: VNode[] = []
      const visit = (nodes: VNodeChild[]) => {
        for (const node of nodes) {
          if (!isVNode(node)) continue
          if (node.type === NTab) tabs.push(node)
          else if (Array.isArray(node.children)) visit(node.children)
        }
      }
      visit(slots.default?.() ?? [])
      const available = tabs.filter((tab) => tab.props?.disabled !== true && tab.props?.disabled !== '')
      return h(
        NTabs,
        {
          ...attrs,
          role: 'tablist',
          value: props.value,
          'onUpdate:value': (value: string | number) => emit('update:value', value),
        },
        {
          default: () =>
            tabs.map((tab) =>
              cloneVNode(tab, {
                role: 'tab',
                tabindex: tab.props?.name === props.value ? 0 : -1,
                'aria-selected': tab.props?.name === props.value,
                'aria-disabled': tab.props?.disabled === true || tab.props?.disabled === '',
                onKeydown: (event: KeyboardEvent) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) return
                  if (tab.props?.disabled === true || tab.props?.disabled === '') return
                  event.preventDefault()
                  const index = available.indexOf(tab)
                  const target =
                    event.key === 'Home'
                      ? available[0]
                      : event.key === 'End'
                        ? available.at(-1)
                        : event.key === 'ArrowLeft'
                          ? available[(index - 1 + available.length) % available.length]
                          : event.key === 'ArrowRight'
                            ? available[(index + 1) % available.length]
                            : tab
                  const name = target?.props?.name
                  if (name == null) return
                  const root = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
                  emit('update:value', name)
                  void nextTick(() =>
                    Array.from(root?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
                      .find((element) => element.dataset.name === String(name))
                      ?.focus({ preventScroll: true }),
                  )
                },
              }),
            ),
        },
      )
    }
  },
})
