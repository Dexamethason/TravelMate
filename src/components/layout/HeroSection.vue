<script setup lang="ts">
import { ref, computed, onMounted, readonly } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import DiagonalBlocks from '@/components/ui/DiagonalBlocks.vue'

// Interface dla opcjonalnych props komponentu
interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  targetRoute?: RouteLocationRaw
  showCta?: boolean
  bigImagePath?: string
  smallImagePath?: string
}

// Interface dla eventów emitowanych przez komponent
interface HeroSectionEmits {
  (event: 'cta-click'): void
  (event: 'image-load-error', imagePath: string): void
  (event: 'image-loaded', imagePath: string): void
}

// Interface dla stylów CSS background
interface BackgroundStyle {
  backgroundImage: string
  backgroundAttachment: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<HeroSectionProps>(), {
  title: 'Odkrywaj świat z TravelMate',
  subtitle:
    'Zaplanuj swoją wymarzoną podróż bez stresu. Wszystko czego potrzebujesz w jednym miejscu: loty, noclegi i atrakcje z najlepszymi cenami.',
  ctaText: 'Zaplanuj podróż teraz!',
  targetRoute: '/planner',
  showCta: true,
  bigImagePath: '@/assets/images/hero/mainPage-hero-big.jpg',
  smallImagePath: '@/assets/images/hero/mainPage-hero-small.jpg',
})

// Definicja emitów
const emit = defineEmits<HeroSectionEmits>()

const router = useRouter()

// Stan komponentu z typowaniem
const isImageLoaded = ref<boolean>(false)
const imageLoadError = ref<boolean>(false)

// Obsługiwane rozszerzenia obrazów
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'] as const

// Type guard dla walidacji URL obrazu
const isValidImagePath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false

  try {
    const lowercasePath = path.toLowerCase()
    return SUPPORTED_IMAGE_EXTENSIONS.some((ext) => lowercasePath.includes(ext))
  } catch {
    return false
  }
}

// Bezpieczne pobieranie URL obrazów z error handling
const getSafeImageUrl = (imagePath: string): string => {
  try {
    if (!isValidImagePath(imagePath)) {
      console.warn('HeroSection: Nieprawidłowa ścieżka obrazu:', imagePath)
      return ''
    }
    return new URL(imagePath, import.meta.url).href
  } catch (error) {
    console.error('HeroSection: Błąd podczas ładowania obrazu:', error)
    emit('image-load-error', imagePath)
    return ''
  }
}

// Computed properties dla obrazów z error handling
const bigHeroImage = computed<string>(() => getSafeImageUrl(props.bigImagePath))
const smallHeroImage = computed<string>(() => getSafeImageUrl(props.smallImagePath))

// Funkcja nawigacji z proper typing i error handling
const navigateToPlanner = async (): Promise<void> => {
  try {
    emit('cta-click')
    await router.push(props.targetRoute)
  } catch (error) {
    console.error('HeroSection: Błąd nawigacji:', error)
    // Fallback navigation
    if (typeof props.targetRoute === 'string') {
      window.location.href = props.targetRoute
    }
  }
}

// Handler dla ładowania obrazów
const handleImageLoad = (imagePath: string): void => {
  isImageLoaded.value = true
  emit('image-loaded', imagePath)
}

// Handler dla błędów ładowania obrazów
const handleImageError = (imagePath: string): void => {
  imageLoadError.value = true
  emit('image-load-error', imagePath)
  console.warn('HeroSection: Nie udało się załadować obrazu:', imagePath)
}

// Helper function dla tworzenia background styles
const createBackgroundStyle = (
  imageUrl: string,
  attachment: 'fixed' | 'scroll',
): BackgroundStyle => {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundAttachment: attachment,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

// Computed property dla stylów tła desktop - POPRAWIONE
const desktopBackgroundStyle = computed<Record<string, string>>(() => {
  if (!bigHeroImage.value) return {}

  const styles = createBackgroundStyle(bigHeroImage.value, 'fixed')
  return styles as unknown as Record<string, string>
})

// Computed property dla stylów tła mobile - POPRAWIONE
const mobileBackgroundStyle = computed<Record<string, string>>(() => {
  if (!smallHeroImage.value) return {}

  const styles = createBackgroundStyle(smallHeroImage.value, 'scroll')
  return styles as unknown as Record<string, string>
})

// Computed property dla sprawdzenia czy obrazy są dostępne
const hasValidImages = computed<boolean>(() => {
  return !!bigHeroImage.value && !!smallHeroImage.value
})

// Preload obrazów dla lepszej wydajności
const preloadImages = (): void => {
  if (bigHeroImage.value) {
    const img1 = new Image()
    img1.onload = () => handleImageLoad(props.bigImagePath)
    img1.onerror = () => handleImageError(props.bigImagePath)
    img1.src = bigHeroImage.value
  }

  if (smallHeroImage.value) {
    const img2 = new Image()
    img2.onload = () => handleImageLoad(props.smallImagePath)
    img2.onerror = () => handleImageError(props.smallImagePath)
    img2.src = smallHeroImage.value
  }
}

// Type guard dla walidacji route
const isValidRoute = (route: RouteLocationRaw): boolean => {
  if (typeof route === 'string') {
    return route.startsWith('/') || route.startsWith('http')
  }
  if (typeof route === 'object' && route !== null) {
    return 'name' in route || 'path' in route
  }
  return false
}

// Computed property dla sprawdzenia czy wszystkie dane są prawidłowe
const isComponentReady = computed<boolean>(() => {
  return !!(props.title && props.subtitle && (hasValidImages.value || !imageLoadError.value))
})

// Expose funkcji dla parent component
defineExpose({
  navigateToPlanner,
  hasValidImages: readonly(hasValidImages),
  isImageLoaded: readonly(isImageLoaded),
  imageLoadError: readonly(imageLoadError),
  isComponentReady: readonly(isComponentReady),
})

// Lifecycle hook
onMounted((): void => {
  // Preload images for better UX
  preloadImages()

  // Validate route prop
  if (!isValidRoute(props.targetRoute)) {
    console.warn('HeroSection: Nieprawidłowa route:', props.targetRoute)
  }
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  // Walidacja podstawowych props
  const validationChecks = [
    {
      check: () => props.title && props.title.trim().length > 0,
      message: 'Tytuł nie może być pusty',
    },
    {
      check: () => props.subtitle && props.subtitle.trim().length > 0,
      message: 'Podtytuł nie może być pusty',
    },
    {
      check: () => !props.showCta || (props.ctaText && props.ctaText.trim().length > 0),
      message: 'Tekst CTA nie może być pusty gdy showCta=true',
    },
    {
      check: () => isValidImagePath(props.bigImagePath),
      message: `Nieprawidłowa ścieżka dużego obrazu: ${props.bigImagePath}`,
    },
    {
      check: () => isValidImagePath(props.smallImagePath),
      message: `Nieprawidłowa ścieżka małego obrazu: ${props.smallImagePath}`,
    },
    {
      check: () => isValidRoute(props.targetRoute),
      message: `Nieprawidłowa route: ${JSON.stringify(props.targetRoute)}`,
    },
  ]

  validationChecks.forEach(({ check, message }) => {
    if (!check()) {
      console.warn(`HeroSection: ${message}`)
    }
  })

  // Log component info
  console.info('HeroSection: Komponent załadowany z props:', {
    title: props.title?.substring(0, 30) + (props.title && props.title.length > 30 ? '...' : ''),
    showCta: props.showCta,
    hasImages: hasValidImages.value,
  })
}
</script>

<template>
  <!-- Hero section z tłem zdjęciowym - pełna szerokość i wysokość -->
  <section
    class="relative w-full hero-height flex flex-col items-center justify-center text-center overflow-hidden"
    role="banner"
    aria-label="Hero section - główna sekcja strony"
  >
    <!-- Ukośne bloki dekoracyjne -->
    <DiagonalBlocks topColor="#ffffff" bottomColor="#1f2937" :responsive="true" :opacity="0.1" />

    <!-- Tło -->
    <div class="absolute inset-0 w-full h-full" aria-hidden="true">
      <!-- Fallback background gdy obrazy się nie załadują -->
      <div
        v-if="imageLoadError || !hasValidImages"
        class="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800"
        role="img"
        aria-label="Fallback background - gradient"
      ></div>

      <!-- Zdjęcie desktop (ukryte na małych ekranach) -->
      <div
        v-if="hasValidImages"
        class="hidden md:block w-full h-full bg-cover bg-center"
        :style="desktopBackgroundStyle"
        role="img"
        :aria-label="`Tło hero section - ${props.title}`"
      ></div>

      <!-- Zdjęcie mobile (widoczne tylko na małych ekranach) -->
      <div
        v-if="hasValidImages"
        class="md:hidden w-full h-full bg-cover bg-center"
        :style="mobileBackgroundStyle"
        role="img"
        :aria-label="`Tło hero section mobile - ${props.title}`"
      ></div>

      <!-- Przyciemnione tło obrazka (overlay) -->
      <div class="absolute inset-0 bg-black opacity-35"></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
      ></div>
    </div>

    <!-- Główna zawartość -->
    <div
      class="relative z-10 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto flex flex-col justify-between gap-8"
    >
      <!-- Teksty -->
      <header>
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 hero-shadow"
          id="heroTitle"
        >
          {{ props.title }}
        </h1>
        <p
          class="text-lg md:text-xl text-white max-w-xl mx-auto hero-shadow"
          aria-describedby="heroTitle"
        >
          {{ props.subtitle }}
        </p>
      </header>

      <!-- Przycisk CTA z animacją -->
      <div v-if="props.showCta">
        <AnimatedButton
          variant="primary"
          size="default"
          animation-color="rgba(255, 255, 255, 0.2)"
          @click="navigateToPlanner"
          class="py-3.5 px-7"
          :aria-label="`${props.ctaText} - przejdź do plannera podróży`"
        >
          {{ props.ctaText }}
        </AnimatedButton>
      </div>
    </div>

    <!-- Loading indicator dla obrazów -->
    <div
      v-if="!isImageLoaded && !imageLoadError"
      class="absolute inset-0 flex items-center justify-center bg-primary-600"
      aria-label="Ładowanie obrazu tła"
      role="status"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span class="sr-only">Ładowanie obrazu tła...</span>
    </div>
  </section>
</template>

<style scoped>
/* Dodatkowe style dla sekcji hero */
.hero-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Wysokość sekcji hero*/
.hero-height {
  height: calc(100vh - 5rem);
  margin-bottom: -1px;
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  min-height: 500px; /* Minimalna wysokość */
}

/* Responsywny odstęp dla różnych rozmiarów ekranu */
@media (max-width: 768px) {
  .gap-8 {
    gap: 1.5rem;
  }

  .hero-height {
    height: calc(100vh - 4rem);
    min-height: 400px;
  }
}

@media (max-width: 640px) {
  .gap-8 {
    gap: 1.25rem;
  }

  .hero-height {
    height: calc(100vh - 3rem);
    min-height: 350px;
  }
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
  .animate-spin {
    animation: none;
  }

  [style*='backgroundAttachment: fixed'] {
    background-attachment: scroll !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .hero-shadow {
    text-shadow: 0 0 0 currentColor;
  }

  .bg-black {
    border: 1px solid currentColor;
  }
}

/* Print styles */
@media print {
  .hero-height {
    height: auto !important;
    min-height: 200px !important;
  }

  .absolute {
    position: relative !important;
  }

  .animate-spin {
    animation: none !important;
  }
}
</style>
