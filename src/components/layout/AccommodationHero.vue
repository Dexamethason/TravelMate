<script setup lang="ts">
import SectionHeading from '@/components/layout/SectionHeading.vue'
import { computed } from 'vue'

// Typy dla obsługiwanych formatów obrazów
type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
type ImagePath = `${string}.${ImageFormat}`

// Rozszerzone props z lepszym typowaniem
interface HeroProps {
  title: string
  subtitle: string
  smallImage: ImagePath
  bigImage: ImagePath
  altText?: string // Opcjonalny alt text dla accessibility
  heroHeight?: 'sm' | 'md' | 'lg' | 'xl' // Predefiniowane wysokości
  overlayOpacity?: 'light' | 'medium' | 'dark' // Intensywność overlay
  className?: string // Dodatkowe klasy CSS
}

// Definicja slotów z typowaniem
interface HeroSlots {
  search(): any // Slot dla formularza wyszukiwania
  default?(): any // Opcjonalny domyślny slot
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<HeroProps>(), {
  altText: 'Hero section background',
  heroHeight: 'lg',
  overlayOpacity: 'medium',
  className: '',
})

// Typowanie slotów
defineSlots<HeroSlots>()

// Computed properties dla dynamicznych klas CSS
const heroClasses = computed(() => {
  const heightClasses = {
    sm: 'h-[400px] lg:h-[500px]',
    md: 'h-[500px] lg:h-[600px]',
    lg: 'h-[600px] lg:h-[700px]',
    xl: 'h-[700px] lg:h-[800px]',
  }

  return ['relative overflow-hidden', heightClasses[props.heroHeight], props.className]
    .filter(Boolean)
    .join(' ')
})

const overlayClasses = computed(() => {
  const opacityClasses = {
    light: 'from-black/30 to-black/10',
    medium: 'from-black/50 to-black/20',
    dark: 'from-black/70 to-black/40',
  }

  return ['absolute inset-0 bg-gradient-to-b', opacityClasses[props.overlayOpacity]].join(' ')
})

// Type guard dla walidacji ścieżek obrazów
const isValidImagePath = (path: string): path is ImagePath => {
  const validExtensions: ImageFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'avif']
  const extension = path.split('.').pop()?.toLowerCase() as ImageFormat
  return validExtensions.includes(extension)
}

// Walidacja ścieżek obrazów przy developmencie
if (import.meta.env.DEV) {
  if (!isValidImagePath(props.smallImage)) {
    console.warn(
      `AccommodationHero: Nieprawidłowy format obrazu dla smallImage: ${props.smallImage}`,
    )
  }
  if (!isValidImagePath(props.bigImage)) {
    console.warn(`AccommodationHero: Nieprawidłowy format obrazu dla bigImage: ${props.bigImage}`)
  }
}
</script>

<template>
  <section :class="heroClasses">
    <!-- Responsywne tło hero z obrazami -->
    <div class="absolute inset-0">
      <picture>
        <source media="(min-width: 1024px)" :srcset="bigImage" />
        <source media="(max-width: 1023px)" :srcset="smallImage" />
        <img
          :src="bigImage"
          :alt="altText"
          class="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </picture>
      <div :class="overlayClasses"></div>
    </div>

    <!-- Zawartość hero -->
    <div class="relative h-full z-10">
      <div class="container mx-auto px-4 h-full flex flex-col justify-center items-center">
        <SectionHeading :title="title" :subtitle="subtitle" class="text-white text-center" />

        <!-- Opcjonalny domyślny slot dla dodatkowej zawartości -->
        <slot />
      </div>
    </div>

    <!-- Overlay dla formularza wyszukiwania -->
    <div class="absolute -bottom-20 left-0 right-0 z-20">
      <div class="container mx-auto px-4">
        <div class="bg-white rounded-lg shadow-xl p-6">
          <slot name="search" />
        </div>
      </div>
    </div>
  </section>
</template>
