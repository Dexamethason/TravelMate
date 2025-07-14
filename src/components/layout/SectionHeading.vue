<script setup lang="ts">
import { computed, readonly } from 'vue'

// Typy dla różnych wariantów komponentu
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type AlignmentVariant = 'left' | 'center' | 'right'
type ColorVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'muted'

// Interface dla props komponentu
interface SectionHeadingProps {
  title: string
  subtitle?: string
  level?: HeadingLevel
  size?: SizeVariant
  alignment?: AlignmentVariant
  color?: ColorVariant
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  maxWidth?: string
  id?: string
  className?: string
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<SectionHeadingProps>(), {
  subtitle: '',
  level: 'h2',
  size: 'lg',
  alignment: 'center',
  color: 'default',
  spacing: 'md',
  maxWidth: '100%',
  id: '',
  className: '',
})

// Type guards dla walidacji
const isValidTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 200
}

const isValidSubtitle = (subtitle: string): boolean => {
  return subtitle.length === 0 || (subtitle.trim().length > 0 && subtitle.trim().length <= 500)
}

const isValidHeadingLevel = (level: string): level is HeadingLevel => {
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level)
}

// Computed property dla klas CSS tytułu
const titleClasses = computed<string>(() => {
  const classes: string[] = ['font-bold']

  // Size classes
  const sizeClasses: Record<SizeVariant, string> = {
    xs: 'text-lg sm:text-xl',
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
    '2xl': 'text-5xl sm:text-6xl',
    '3xl': 'text-6xl sm:text-7xl',
  }
  classes.push(sizeClasses[props.size])

  // Color classes
  const colorClasses: Record<ColorVariant, string> = {
    default: 'text-gray-900',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600',
    muted: 'text-gray-600',
  }
  classes.push(colorClasses[props.color])

  // Spacing bottom
  const spacingClasses: Record<string, string> = {
    none: '',
    sm: 'mb-1',
    md: 'mb-2',
    lg: 'mb-4',
    xl: 'mb-6',
  }
  classes.push(spacingClasses[props.spacing])

  return classes.join(' ')
})

// Computed property dla klas CSS podtytułu
const subtitleClasses = computed<string>(() => {
  const classes: string[] = []

  // Base classes
  classes.push('opacity-90')

  // Size based on main title size
  const subtitleSizeClasses: Record<SizeVariant, string> = {
    xs: 'text-sm sm:text-base',
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
    '3xl': 'text-4xl sm:text-5xl',
  }
  classes.push(subtitleSizeClasses[props.size])

  // Color (usually muted version of title color)
  const subtitleColorClasses: Record<ColorVariant, string> = {
    default: 'text-gray-600',
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    muted: 'text-gray-500',
  }
  classes.push(subtitleColorClasses[props.color])

  // Bottom spacing for subtitle
  const subtitleSpacingClasses: Record<string, string> = {
    none: '',
    sm: 'pb-4',
    md: 'pb-6',
    lg: 'pb-8',
    xl: 'pb-10',
  }
  classes.push(subtitleSpacingClasses[props.spacing])

  return classes.join(' ')
})

// Computed property dla klas kontenera
const containerClasses = computed<string>(() => {
  const classes: string[] = []

  // Alignment
  const alignmentClasses: Record<AlignmentVariant, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  classes.push(alignmentClasses[props.alignment])

  // Additional custom classes
  if (props.className) {
    classes.push(props.className)
  }

  return classes.join(' ')
})

// Computed property dla stylów kontenera
const containerStyle = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {}

  if (props.maxWidth && props.maxWidth !== '100%') {
    styles.maxWidth = props.maxWidth
    styles.margin = '0 auto'
  }

  return styles
})

// Computed property dla ID elementu
const headingId = computed<string>(() => {
  if (props.id) return props.id

  // Generate ID from title if not provided
  return props.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
})

// Funkcja sanityzacji tekstu
const sanitizeText = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Computed properties dla bezpiecznych tekstów
const safeTitle = computed<string>(() => sanitizeText(props.title))
const safeSubtitle = computed<string>(() => sanitizeText(props.subtitle))

// Funkcja pobierania ARIA level dla heading
const getAriaLevel = (): number => {
  return parseInt(props.level.charAt(1))
}

// Expose funkcji dla parent component
defineExpose({
  headingId: readonly(headingId),
  isValidContent: computed(() => isValidTitle(props.title) && isValidSubtitle(props.subtitle)),
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  if (!isValidTitle(props.title)) {
    console.warn('SectionHeading: Tytuł musi zawierać 1-200 znaków:', props.title)
  }

  if (!isValidSubtitle(props.subtitle)) {
    console.warn('SectionHeading: Podtytuł może zawierać maksymalnie 500 znaków:', props.subtitle)
  }

  if (!isValidHeadingLevel(props.level)) {
    console.warn('SectionHeading: Nieprawidłowy poziom nagłówka:', props.level)
  }

  // Warning dla accessibility
  if (props.level === 'h1') {
    console.info(
      'SectionHeading: Używasz h1 - upewnij się, że to jedyny h1 na stronie dla lepszej accessibility',
    )
  }
}
</script>

<template>
  <div :class="containerClasses" :style="containerStyle" role="region" :aria-labelledby="headingId">
    <!-- Main heading -->
    <component :is="props.level" :id="headingId" :class="titleClasses" :aria-level="getAriaLevel()">
      {{ safeTitle }}
    </component>

    <!-- Subtitle -->
    <p
      v-if="props.subtitle && props.subtitle.trim().length > 0"
      :class="subtitleClasses"
      :aria-describedby="headingId"
    >
      {{ safeSubtitle }}
    </p>
  </div>
</template>

<style scoped>
/* Responsive improvements */
@media (max-width: 640px) {
  /* Ensure proper line height on small screens */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.2;
  }

  p {
    line-height: 1.5;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

/* Print styles */
@media print {
  div {
    color: #000 !important;
    background: transparent !important;
  }
}

/* Focus styles for better accessibility */
h1:focus,
h2:focus,
h3:focus,
h4:focus,
h5:focus,
h6:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Ensure proper text wrapping */
h1,
h2,
h3,
h4,
h5,
h6,
p {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
