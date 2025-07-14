<script setup lang="ts">
import { computed, readonly } from 'vue'

// Union types dla wymiarów i jednostek
type CSSUnit = 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw'
type DimensionValue = number | `${number}${CSSUnit}`
type ColorValue = string
type AngleValue = `${number}deg` | `${number}rad` | `${number}turn`

// Interface dla props komponentu
interface DiagonalBlocksProps {
  topColor?: ColorValue
  bottomColor?: ColorValue
  showTop?: boolean
  showBottom?: boolean
  skewAngle?: AngleValue
  topHeight?: DimensionValue
  bottomHeight?: DimensionValue
  width?: DimensionValue
  opacity?: number
  zIndex?: number
  responsive?: boolean
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<DiagonalBlocksProps>(), {
  topColor: '#ffffff',
  bottomColor: '#1f2937',
  showTop: true,
  showBottom: true,
  skewAngle: '45deg',
  topHeight: 40,
  bottomHeight: 40,
  width: 60,
  opacity: 1,
  zIndex: 5,
  responsive: true,
})

// Type guard dla walidacji kolorów CSS
const isValidCSSColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') return false

  // Basic CSS color validation patterns
  const colorPatterns = [
    /^#[0-9A-Fa-f]{3}$/, // #RGB
    /^#[0-9A-Fa-f]{6}$/, // #RRGGBB
    /^#[0-9A-Fa-f]{8}$/, // #RRGGBBAA
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // rgb(r,g,b)
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // rgba(r,g,b,a)
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // hsl(h,s,l)
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // hsla(h,s,l,a)
    /^var\(--[\w-]+\)$/, // CSS custom properties
  ]

  // CSS named colors (basic set)
  const namedColors = [
    'transparent',
    'currentColor',
    'inherit',
    'initial',
    'unset',
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
    colorPatterns.some((pattern) => pattern.test(color.trim())) ||
    namedColors.includes(color.toLowerCase().trim())
  )
}

// Type guard dla walidacji kątów
const isValidAngle = (angle: string): angle is AngleValue => {
  const anglePattern = /^-?\d+(\.\d+)?(deg|rad|turn)$/
  return anglePattern.test(angle)
}

// Type guard dla walidacji wymiarów
const isValidDimension = (value: DimensionValue): boolean => {
  if (typeof value === 'number') {
    return value >= 0 && value <= 1000 // Reasonable limits
  }

  const dimensionPattern = /^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/
  return typeof value === 'string' && dimensionPattern.test(value)
}

// Type guard dla walidacji opacity
const isValidOpacity = (opacity: number): boolean => {
  return typeof opacity === 'number' && opacity >= 0 && opacity <= 1
}

// Funkcja bezpiecznego formatowania koloru
const getSafeColor = (color: string): string => {
  if (isValidCSSColor(color)) {
    return color.trim()
  }

  console.warn('DiagonalBlocks: Nieprawidłowy kolor CSS:', color)
  return 'transparent'
}

// Funkcja bezpiecznego formatowania wymiaru
const getSafeDimension = (value: DimensionValue): string => {
  if (!isValidDimension(value)) {
    console.warn('DiagonalBlocks: Nieprawidłowy wymiar:', value)
    return '0px'
  }

  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}

// Funkcja bezpiecznego formatowania kąta
const getSafeAngle = (angle: string): string => {
  if (isValidAngle(angle)) {
    return angle
  }

  console.warn('DiagonalBlocks: Nieprawidłowy kąt:', angle)
  return '0deg'
}

// Computed property dla transform skew
const skewTransform = computed<string>(() => {
  const safeAngle = getSafeAngle(props.skewAngle)
  return `skew(${safeAngle})`
})

// Computed property dla stylów górnego bloku
const topBlockStyle = computed<Record<string, string>>(() => {
  if (!props.showTop) {
    return {
      display: 'none',
      backgroundColor: '',
      transform: '',
      height: '',
      width: '',
      opacity: '',
    }
  }

  return {
    display: '',
    backgroundColor: getSafeColor(props.topColor),
    transform: skewTransform.value,
    height: getSafeDimension(props.topHeight),
    width: getSafeDimension(props.width),
    opacity: isValidOpacity(props.opacity) ? props.opacity.toString() : '1',
  }
})

// Computed property dla stylów dolnego bloku
const bottomBlockStyle = computed<Record<string, string>>(() => {
  if (!props.showBottom) {
    return {
      display: 'none',
      backgroundColor: '',
      transform: '',
      height: '',
      width: '',
      opacity: '',
    }
  }

  return {
    display: '',
    backgroundColor: getSafeColor(props.bottomColor),
    transform: skewTransform.value,
    height: getSafeDimension(props.bottomHeight),
    width: getSafeDimension(props.width),
    opacity: isValidOpacity(props.opacity) ? props.opacity.toString() : '1',
  }
})

// Computed property dla stylów kontenera
const containerStyle = computed<Record<string, string>>(() => ({
  zIndex: props.zIndex.toString(),
}))

// Computed property dla klas CSS kontenera
const containerClasses = computed<string>(() => {
  const classes = ['diagonal-blocks-container']

  if (props.responsive) {
    classes.push('responsive')
  }

  return classes.join(' ')
})

// Computed property dla sprawdzenia czy bloki są widoczne
const hasVisibleBlocks = computed<boolean>(() => {
  return props.showTop || props.showBottom
})

// Expose funkcji dla parent component
defineExpose({
  hasVisibleBlocks: readonly(hasVisibleBlocks),
  isValidConfiguration: computed(() => {
    return (
      isValidCSSColor(props.topColor) &&
      isValidCSSColor(props.bottomColor) &&
      isValidAngle(props.skewAngle) &&
      isValidDimension(props.topHeight) &&
      isValidDimension(props.bottomHeight) &&
      isValidDimension(props.width) &&
      isValidOpacity(props.opacity)
    )
  }),
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  if (!isValidCSSColor(props.topColor)) {
    console.warn('DiagonalBlocks: Nieprawidłowy kolor górnego bloku:', props.topColor)
  }

  if (!isValidCSSColor(props.bottomColor)) {
    console.warn('DiagonalBlocks: Nieprawidłowy kolor dolnego bloku:', props.bottomColor)
  }

  if (!isValidAngle(props.skewAngle)) {
    console.warn('DiagonalBlocks: Nieprawidłowy kąt skew:', props.skewAngle)
  }

  if (!isValidOpacity(props.opacity)) {
    console.warn('DiagonalBlocks: Nieprawidłowa wartość opacity (0-1):', props.opacity)
  }

  if (props.zIndex < 0 || props.zIndex > 9999) {
    console.warn('DiagonalBlocks: Nieprawidłowa wartość z-index (0-9999):', props.zIndex)
  }
}
</script>

<template>
  <div
    v-if="hasVisibleBlocks"
    :class="containerClasses"
    :style="containerStyle"
    role="presentation"
    aria-hidden="true"
  >
    <!-- Górny ukośny blok -->
    <div
      v-if="props.showTop"
      class="diagonal-block diagonal-block-right"
      :style="topBlockStyle"
      data-block="top"
    ></div>

    <!-- Dolny ukośny blok -->
    <div
      v-if="props.showBottom"
      class="diagonal-block diagonal-block-left"
      :style="bottomBlockStyle"
      data-block="bottom"
    ></div>
  </div>
</template>

<style scoped>
/* Kontener do poprawnego pozycjonowania bloków */
.diagonal-blocks-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Style dla ukośnych bloków */
.diagonal-block {
  position: absolute;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pozycjonowanie bloków */
.diagonal-block-left {
  bottom: 0;
  left: -50px;
}

.diagonal-block-right {
  top: 0;
  right: -50px;
}

/* Responsive adjustments */
.responsive .diagonal-block-left {
  left: -20px;
}

.responsive .diagonal-block-right {
  right: -20px;
}

@media (max-width: 768px) {
  .responsive .diagonal-block {
    transform: scale(0.8);
  }

  .responsive .diagonal-block-left {
    left: -30px;
  }

  .responsive .diagonal-block-right {
    right: -30px;
  }
}

@media (max-width: 480px) {
  .responsive .diagonal-block {
    transform: scale(0.6);
  }

  .responsive .diagonal-block-left {
    left: -40px;
  }

  .responsive .diagonal-block-right {
    right: -40px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .diagonal-block {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .diagonal-block {
    border: 1px solid currentColor;
  }
}

/* Print styles */
@media print {
  .diagonal-blocks-container {
    display: none !important;
  }
}

/* Focus management - blocks should never receive focus */
.diagonal-block:focus {
  outline: none;
}
</style>
