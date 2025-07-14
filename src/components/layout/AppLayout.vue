<script setup lang="ts">
import { computed } from 'vue'

// Typy dla różnych wariantów layoutu
type LayoutVariant = 'container' | 'full-width' | 'narrow' | 'wide'
type PaddingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl'
type MaxWidthSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom'

// Props komponentu
interface AppLayoutProps {
  variant?: LayoutVariant // Typ layoutu
  padding?: PaddingSize // Rozmiar paddingu
  maxWidth?: MaxWidthSize // Maksymalna szerokość
  customMaxWidth?: string // Customowa szerokość (gdy maxWidth = 'custom')
  centered?: boolean // Czy wyśrodkować zawartość
  className?: string // Dodatkowe klasy CSS
  tag?: keyof HTMLElementTagNameMap // Tag HTML do użycia
}

// Definicja slotów z typowaniem
interface AppLayoutSlots {
  default(): any // Główna zawartość
  header?(): any // Opcjonalny header
  footer?(): any // Opcjonalna stopka
  sidebar?(): any // Opcjonalny sidebar
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<AppLayoutProps>(), {
  variant: 'container',
  padding: 'md',
  maxWidth: 'xl',
  customMaxWidth: '1184px',
  centered: true,
  className: '',
  tag: 'div',
})

// Typowanie slotów
defineSlots<AppLayoutSlots>()

// Computed property dla klas CSS
const layoutClasses = computed(() => {
  const classes: string[] = []

  // Podstawowe klasy
  classes.push('w-full')

  // Padding responsywny
  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-3 md:px-4',
    md: 'px-4 sm:px-6 md:px-8',
    lg: 'px-6 sm:px-8 md:px-12',
    xl: 'px-8 sm:px-12 md:px-16',
  }
  if (paddingClasses[props.padding]) {
    classes.push(paddingClasses[props.padding])
  }

  // Centrowanie
  if (props.centered) {
    classes.push('mx-auto')
  }

  // Dodatkowe klasy
  if (props.className) {
    classes.push(props.className)
  }

  return classes.filter(Boolean).join(' ')
})

// Computed property dla maksymalnej szerokości
const maxWidthStyle = computed(() => {
  const widthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1184px',
    full: '100%',
    custom: props.customMaxWidth,
  }

  const width = widthMap[props.maxWidth]

  if (props.variant === 'full-width') {
    return { width: '100%' }
  }

  if (props.variant === 'narrow') {
    return { width: 'min(640px, 100vw)' }
  }

  if (props.variant === 'wide') {
    return { width: 'min(1400px, 100vw)' }
  }

  // Domyślny container
  return { width: `min(${width}, 100vw)` }
})

// Computed property dla układu z sidebarom
const isLayoutWithSidebar = computed(() => {
  // Sprawdzenie czy slot sidebar jest używany w template
  return false // Będzie automatycznie wykrywane w template
})

// Type guard dla walidacji customowej szerokości
const isValidWidth = (width: string): boolean => {
  // Sprawdzenie czy width ma poprawny format CSS
  const validUnits = ['px', 'rem', 'em', '%', 'vw', 'vh']
  return validUnits.some((unit) => width.endsWith(unit)) || width === 'auto'
}

// Walidacja props przy developmencie
if (import.meta.env.DEV) {
  if (props.maxWidth === 'custom' && !isValidWidth(props.customMaxWidth)) {
    console.warn(`AppLayout: Nieprawidłowa customowa szerokość: ${props.customMaxWidth}`)
  }
}
</script>

<template>
  <component :is="tag" :class="layoutClasses" :style="maxWidthStyle">
    <!-- Opcjonalny header -->
    <header v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </header>

    <!-- Layout z sidebarom -->
    <div v-if="$slots.sidebar" class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar -->
      <aside class="lg:w-64 flex-shrink-0">
        <slot name="sidebar" />
      </aside>

      <!-- Główna zawartość -->
      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>

    <!-- Standardowy layout -->
    <main v-else>
      <slot />
    </main>

    <!-- Opcjonalna stopka -->
    <footer v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </component>
</template>
