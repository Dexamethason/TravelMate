<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

// Typy dla ikon Font Awesome
type FontAwesomeIcon = `fa-${string}`

// Interface dla linków social media
interface SocialLink {
  icon: FontAwesomeIcon
  url: string
  label: string
  external?: boolean // Czy link prowadzi na zewnętrzną stronę
}

// Interface dla linków nawigacyjnych
interface NavigationLink {
  label: string
  to: RouteLocationRaw
  external?: boolean
}

// Interface dla sekcji nawigacyjnych
interface NavigationSection {
  title: string
  links: NavigationLink[]
}

// Props komponentu
interface AppFooterProps {
  companyName?: string
  description?: string
  showNewsletter?: boolean
  showSocialLinks?: boolean
  copyrightText?: string
}

// Eventy emitowane przez komponent
interface AppFooterEmits {
  (event: 'newsletter-signup'): void
  (event: 'social-click', link: SocialLink): void
  (event: 'navigation-error', error: Error): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<AppFooterProps>(), {
  companyName: 'TravelMate',
  description:
    'Planuj podróże bez stresu. TravelMate pomaga znaleźć najlepsze loty, noclegi i atrakcje w jednym miejscu.',
  showNewsletter: true,
  showSocialLinks: true,
  copyrightText: 'Wszelkie prawa zastrzeżone.',
})

// Definicja emitów
const emit = defineEmits<AppFooterEmits>()

const router = useRouter()

// Aktualny rok jako computed property
const currentYear = computed<number>(() => new Date().getFullYear())

// Type guard dla walidacji URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    // Sprawdzenie czy to relatywna ścieżka zaczynająca się od /
    return url.startsWith('/') || url.startsWith('#')
  }
}

// Konfiguracja linków social media z typowaniem
const socialLinks: readonly SocialLink[] = [
  {
    icon: 'fa-facebook-f',
    url: 'https://facebook.com/travelmate',
    label: 'Facebook',
    external: true,
  },
  {
    icon: 'fa-twitter',
    url: 'https://twitter.com/travelmate',
    label: 'Twitter',
    external: true,
  },
  {
    icon: 'fa-instagram',
    url: 'https://instagram.com/travelmate',
    label: 'Instagram',
    external: true,
  },
] as const

// Sekcje nawigacyjne z typowaniem
const navigationSections: readonly NavigationSection[] = [
  {
    title: 'Odkrywaj',
    links: [
      { label: 'Planer podróży', to: { name: 'planner' } },
      { label: 'Loty', to: { name: 'flights' } },
      { label: 'Noclegi', to: { name: 'accommodations' } },
      { label: 'Atrakcje', to: { name: 'attractions' } },
    ],
  },
  {
    title: 'Pomoc',
    links: [
      { label: 'Centrum pomocy', to: '/help', external: true },
      { label: 'FAQ', to: '/faq' },
      { label: 'Kontakt', to: '/contact' },
      { label: 'Regulamin', to: '/terms' },
    ],
  },
] as const

// Linki w stopce z typowaniem
const footerLinks: readonly NavigationLink[] = [
  { label: 'Polityka prywatności', to: '/privacy' },
  { label: 'Polityka cookies', to: '/cookies' },
  { label: 'Mapa strony', to: '/sitemap' },
] as const

// Handler nawigacji z obsługą błędów
const navigateToPlanner = async (): Promise<void> => {
  try {
    await router.push({ name: 'planner' })
  } catch (error) {
    console.error('Błąd nawigacji do planera:', error)
    emit('navigation-error', error as Error)
  }
}

// Handler kliknięcia w link social media
const handleSocialClick = (link: SocialLink): void => {
  emit('social-click', link)
}

// Handler newsletter signup
const handleNewsletterSignup = (): void => {
  emit('newsletter-signup')
  navigateToPlanner()
}

// Walidacja konfiguracji przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie poprawności URL-i w linkach social media
  socialLinks.forEach((link, index) => {
    if (!isValidUrl(link.url)) {
      console.warn(`AppFooter: Nieprawidłowy URL dla social link ${index}: ${link.url}`)
    }
  })

  // Sprawdzenie poprawności ikon FontAwesome
  socialLinks.forEach((link, index) => {
    if (!link.icon.startsWith('fa-')) {
      console.warn(
        `AppFooter: Nieprawidłowa ikona FontAwesome dla social link ${index}: ${link.icon}`,
      )
    }
  })
}

// Computed property dla pełnego copyright tekstu
const fullCopyrightText = computed<string>(() => {
  return `© ${currentYear.value} ${props.companyName}. ${props.copyrightText}`
})
</script>

<template>
  <footer class="bg-gray-800 text-white">
    <!-- Główna zawartość footera -->
    <div class="w-full px-4 sm:px-6 md:px-8 py-12 mx-auto" style="width: min(1184px, 100vw)">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Logo i opis -->
        <div>
          <div class="flex items-center mb-4">
            <div class="h-10 w-10 bg-green-500 rounded-md flex items-center justify-center">
              <span class="text-white font-bold">TM</span>
            </div>
            <span class="ml-2 text-xl font-semibold text-white">{{ companyName }}</span>
          </div>
          <p class="text-gray-300 mb-4">
            {{ description }}
          </p>

          <!-- Social media -->
          <div v-if="showSocialLinks" class="flex space-x-4 mt-4">
            <a
              v-for="social in socialLinks"
              :key="social.icon"
              :href="social.url"
              :aria-label="social.label"
              :target="social.external ? '_blank' : '_self'"
              :rel="social.external ? 'noopener noreferrer' : undefined"
              class="text-gray-400 hover:text-white transition-colors"
              @click="handleSocialClick(social)"
            >
              <i :class="['fab', social.icon]"></i>
            </a>
          </div>
        </div>

        <!-- Sekcje nawigacyjne -->
        <div v-for="section in navigationSections" :key="section.title">
          <h3 class="text-lg font-semibold mb-4">{{ section.title }}</h3>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.label">
              <component
                :is="link.external ? 'a' : 'router-link'"
                :to="!link.external ? link.to : undefined"
                :href="link.external ? (typeof link.to === 'string' ? link.to : '#') : undefined"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="text-gray-300 hover:text-white transition-colors"
              >
                {{ link.label }}
              </component>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div v-if="showNewsletter">
          <h3 class="text-lg font-semibold mb-4">Bądź na bieżąco</h3>
          <p class="text-gray-300 mb-4">
            Zapisz się do naszego newslettera, aby otrzymywać najlepsze oferty podróży.
          </p>
          <div class="mt-4">
            <AnimatedButton
              variant="primary"
              size="default"
              animation-color="rgba(255, 255, 255, 0.2)"
              @click="handleNewsletterSignup"
            >
              Zaplanuj podróż
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Dolny pasek copyright -->
    <div class="w-full bg-gray-900 py-4">
      <div class="mx-auto px-4 sm:px-6 md:px-8" style="width: min(1184px, 100vw)">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <!-- Copyright -->
          <p class="text-sm text-gray-400">
            {{ fullCopyrightText }}
          </p>

          <!-- Dodatkowe linki -->
          <div class="flex space-x-4 mt-2 md:mt-0">
            <component
              v-for="link in footerLinks"
              :key="link.label"
              :is="link.external ? 'a' : 'router-link'"
              :to="!link.external ? link.to : undefined"
              :href="link.external ? (typeof link.to === 'string' ? link.to : '#') : undefined"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
              class="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {{ link.label }}
            </component>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Dodatkowe style specyficzne dla footera */
</style>
