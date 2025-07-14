<script setup lang="ts">
import { computed, readonly, withDefaults, defineProps, defineEmits, defineExpose } from 'vue'

// Union types dla różnych wariantów
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
type ButtonSize = 'small' | 'default' | 'large'
type ButtonType = 'button' | 'submit' | 'reset'

// Interface dla props komponentu
interface AnimatedButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  animationColor?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  ariaLabel?: string
  className?: string
}

// Interface dla eventów emitowanych przez komponent
interface AnimatedButtonEmits {
  (event: 'click', e: MouseEvent): void
  (event: 'focus', e: FocusEvent): void
  (event: 'blur', e: FocusEvent): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<AnimatedButtonProps>(), {
  variant: 'primary',
  size: 'default',
  type: 'button',
  animationColor: '',
  disabled: false,
  loading: false,
  fullWidth: false,
  ariaLabel: '',
  className: '',
})

// Definicja emitów
const emit = defineEmits<AnimatedButtonEmits>()

// Type guard dla walidacji koloru CSS
const isValidCSSColor = (color: string): boolean => {
  if (!color) return true // Empty string is valid (uses default)

  // Basic CSS color validation
  const colorPatterns = [
    /^#[0-9A-Fa-f]{3}$/, // #RGB
    /^#[0-9A-Fa-f]{6}$/, // #RRGGBB
    /^#[0-9A-Fa-f]{8}$/, // #RRGGBBAA
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // rgb(r,g,b)
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // rgba(r,g,b,a)
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // hsl(h,s,l)
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // hsla(h,s,l,a)
  ]

  // CSS named colors (basic set)
  const namedColors = [
    'transparent',
    'white',
    'black',
    'red',
    'green',
    'blue',
    'yellow',
    'orange',
    'purple',
    'pink',
    'gray',
    'grey',
    'brown',
    'cyan',
    'magenta',
  ]

  return (
    colorPatterns.some((pattern) => pattern.test(color)) ||
    namedColors.includes(color.toLowerCase())
  )
}

// Computed property dla klas CSS przycisku
const buttonClasses = computed<string>(() => {
  const classes: string[] = [
    'btn-special-animation',
    'relative',
    'overflow-hidden',
    'z-0',
    'rounded-lg',
    'shadow-lg',
    'hover:shadow-xl',
    'transition-all',
    'duration-300',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'font-medium',
    'inline-flex',
    'items-center',
    'justify-center',
    'text-center',
  ]

  // Variant classes
  const variantClasses: Record<ButtonVariant, string[]> = {
    primary: [
      'bg-primary-600',
      'hover:bg-primary-700',
      'text-white',
      'focus:ring-primary-500',
      'disabled:bg-primary-300',
    ],
    secondary: [
      'bg-gray-500',
      'hover:bg-gray-600',
      'text-white',
      'focus:ring-gray-500',
      'disabled:bg-gray-300',
    ],
    outline: [
      'bg-transparent',
      'border-2',
      'border-primary-600',
      'hover:bg-primary-50',
      'text-primary-600',
      'focus:ring-primary-500',
      'disabled:border-primary-300',
      'disabled:text-primary-300',
    ],
    danger: [
      'bg-red-600',
      'hover:bg-red-700',
      'text-white',
      'focus:ring-red-500',
      'disabled:bg-red-300',
    ],
    success: [
      'bg-green-600',
      'hover:bg-green-700',
      'text-white',
      'focus:ring-green-500',
      'disabled:bg-green-300',
    ],
  }
  classes.push(...variantClasses[props.variant])

  // Size classes
  const sizeClasses: Record<ButtonSize, string[]> = {
    small: ['px-3', 'py-1.5', 'text-xs', 'sm:text-sm'],
    default: ['px-5', 'sm:px-7', 'py-3', 'sm:py-3.5'],
    large: ['px-7', 'sm:px-9', 'py-4', 'sm:py-4.5', 'text-lg'],
  }
  classes.push(...sizeClasses[props.size])

  // State classes
  if (props.disabled || props.loading) {
    classes.push('cursor-not-allowed', 'opacity-50')
  } else {
    classes.push('cursor-pointer')
  }

  if (props.fullWidth) {
    classes.push('w-full')
  }

  // Custom classes
  if (props.className) {
    classes.push(props.className)
  }

  return classes.join(' ')
})

// Computed property dla inline styles
const buttonStyle = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {}

  if (props.animationColor && isValidCSSColor(props.animationColor)) {
    styles['--animation-color'] = props.animationColor
  }

  return styles
})

// Computed property dla sprawdzenia czy przycisk jest interaktywny
const isInteractive = computed<boolean>(() => {
  return !props.disabled && !props.loading
})

// Event handlers z typowaniem
const handleClick = (event: MouseEvent): void => {
  if (!isInteractive.value) {
    event.preventDefault()
    return
  }

  emit('click', event)
}

const handleFocus = (event: FocusEvent): void => {
  if (isInteractive.value) {
    emit('focus', event)
  }
}

const handleBlur = (event: FocusEvent): void => {
  if (isInteractive.value) {
    emit('blur', event)
  }
}

// Computed property dla accessibility attributes
const accessibilityAttrs = computed<Record<string, string | boolean>>(() => {
  const attrs: Record<string, string | boolean> = {}

  if (props.ariaLabel) {
    attrs['aria-label'] = props.ariaLabel
  }

  if (props.loading) {
    attrs['aria-busy'] = true
    attrs['aria-disabled'] = true
  } else if (props.disabled) {
    attrs['aria-disabled'] = true
  }

  return attrs
})

// Expose funkcji dla parent component
defineExpose({
  isInteractive: readonly(isInteractive),
  focus: (): void => {
    // Focus button programmatically
  },
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  if (props.animationColor && !isValidCSSColor(props.animationColor)) {
    console.warn('AnimatedButton: Nieprawidłowy kolor animacji:', props.animationColor)
  }

  if (props.loading && props.disabled) {
    console.warn('AnimatedButton: Przycisk nie powinien być jednocześnie loading i disabled')
  }
}
</script>

<template>
  <button
    :type="props.type"
    :class="buttonClasses"
    :style="buttonStyle"
    :disabled="props.disabled || props.loading"
    v-bind="accessibilityAttrs"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <span
      v-if="props.loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      aria-hidden="true"
    >
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- Button content -->
    <span :class="{ 'opacity-0': props.loading }" class="flex items-center justify-center gap-2">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn-special-animation {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 0;
}

.btn-special-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--animation-color, rgba(255, 255, 255, 0.1));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.btn-special-animation:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.btn-special-animation:active {
  transform: translateY(1px);
}

.btn-special-animation:disabled::before,
.btn-special-animation[aria-busy='true']::before {
  display: none;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .btn-special-animation,
  .btn-special-animation::before {
    transition: none;
  }

  .animate-spin {
    animation: none;
  }
}

/* Focus styles dla keyboard navigation */
.btn-special-animation:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-special-animation {
    border: 2px solid currentColor;
  }
}

/* Print styles */
@media print {
  .btn-special-animation {
    box-shadow: none !important;
    background: transparent !important;
    border: 1px solid #000 !important;
    color: #000 !important;
  }

  .btn-special-animation::before {
    display: none !important;
  }
}
</style>
