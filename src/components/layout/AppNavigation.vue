<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const router = useRouter()
const isLoggedIn = ref(false)
const isMobileMenuOpen = ref(false)
const isLanguageCurrencyOpen = ref(false)
const activeTab = ref('currency')
const isScrolled = ref(false)

const currencyDropdownRef = ref<HTMLElement | null>(null)
const currencyButtonRef = ref<HTMLElement | null>(null)
const mobileButtonRef = ref<HTMLElement | null>(null)

// Uproszczona kontrola przewijania - tylko pionowe gdy potrzebne
const setBodyOverflow = (lockVertical: boolean) => {
  // Poziome przewijanie zawsze zablokowane przez CSS globalny
  // Kontrolujemy tylko pionowe przewijanie dla modal
  if (lockVertical) {
    document.body.style.overflowY = 'hidden'
  } else {
    document.body.style.overflowY = 'auto'
  }
}

// Otwieranie hamburger menu
const toggleMobileMenu = () => {
  if (isLanguageCurrencyOpen.value) {
    closeLanguageCurrency()
  }

  isMobileMenuOpen.value = !isMobileMenuOpen.value
  setBodyOverflow(isMobileMenuOpen.value)
}

// Otwieranie okna wyboru języka i waluty
const toggleLanguageCurrency = (fromMobile = false) => {
  if (fromMobile) {
    isMobileMenuOpen.value = false
    // Delay zamknięcia menu
    setTimeout(() => {
      isLanguageCurrencyOpen.value = true
      setBodyOverflow(true)
    }, 150)
  } else {
    isLanguageCurrencyOpen.value = !isLanguageCurrencyOpen.value
    setBodyOverflow(isLanguageCurrencyOpen.value)
  }
}

// Zamykanie okienka z ustawieniami
const closeLanguageCurrency = () => {
  isLanguageCurrencyOpen.value = false
  setBodyOverflow(isMobileMenuOpen.value)
}

// Zmiana zakładki w ustawieniach
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// Zamykanie okna po kliknięciu gdzieś obok
const handleClickOutside = (event: MouseEvent) => {
  if (!isLanguageCurrencyOpen.value) return

  const target = event.target as Node
  const modalContent = currencyDropdownRef.value
  const currencyBtn = currencyButtonRef.value
  const mobileBtn = mobileButtonRef.value

  if (
    modalContent &&
    !modalContent.contains(target) &&
    ((currencyBtn && !currencyBtn.contains(target)) || !currencyBtn) &&
    ((mobileBtn && !mobileBtn.contains(target)) || !mobileBtn)
  ) {
    closeLanguageCurrency()
  }
}

// Obsługa przewijania
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Dodajemy listenery po pierwszym renderze
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside as EventListener)
  window.addEventListener('scroll', handleScroll)

  // Inicjalne wywołanie, żeby poprawnie ustawić stan przy pierwszym ładowaniu
  handleScroll()

  // Resetowanie scrolla przy zmianie strony
  router.afterEach(() => {
    setBodyOverflow(false)
  })
})

// Usuwamy listenery przy zamykaniu komponentu
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside as EventListener)
  window.removeEventListener('scroll', handleScroll)
  setBodyOverflow(false)
})

// Logowanie i wylogowywanie
const toggleLogin = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    setBodyOverflow(false)
  }

  // Zmiana stanu i przekierowanie
  isLoggedIn.value = !isLoggedIn.value
  if (isLoggedIn.value) {
    router.push('/')
  }
}

// Obsługa kliknięć w przyciski logowania
const handleAuthClick = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    setBodyOverflow(false)
  }
}

// Obsługa kliknięcia w logo
const handleLogoClick = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    setBodyOverflow(false)
  }
}
</script>

<template>
  <!-- Pusty element do utrzymania przestrzeni pod nawigacją -->
  <div class="h-20 w-full"></div>
  <header class="fixed top-0 left-0 right-0 bg-white z-50 nav-header">
    <!-- Kontener z ograniczoną szerokością -->
    <div class="w-full mx-auto px-4 sm:px-6 md:px-8 nav-container">
      <div class="flex justify-between h-20">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <router-link to="/" class="flex items-center" @click="handleLogoClick">
            <div
              class="h-10 w-10 xs:h-12 xs:w-12 bg-green-500 rounded-md flex items-center justify-center logo-icon flex-shrink-0"
            >
              <span class="text-white font-bold text-sm xs:text-lg">TM</span>
            </div>
            <span class="ml-2 xs:ml-3 text-base xs:text-xl font-semibold text-gray-900 logo-text">
              TravelMate
            </span>
          </router-link>
        </div>

        <!-- Menu nawigacyjne -->
        <nav class="hidden lg:flex items-center ml-4 lg:ml-8 flex-shrink">
          <div class="flex space-x-1 lg:space-x-6">
            <router-link
              to="/planner"
              class="text-gray-700 hover:text-gray-900 px-3 lg:px-4 py-4 text-sm lg:text-base font-medium nav-link"
            >
              Planer
            </router-link>
            <router-link
              to="/flights"
              class="text-gray-700 hover:text-gray-900 px-3 lg:px-4 py-4 text-sm lg:text-base font-medium nav-link"
            >
              Loty
            </router-link>
            <router-link
              to="/accommodations"
              class="text-gray-700 hover:text-gray-900 px-3 lg:px-4 py-4 text-sm lg:text-base font-medium nav-link"
            >
              Noclegi
            </router-link>
            <router-link
              to="/attractions"
              class="text-gray-700 hover:text-gray-900 px-3 lg:px-4 py-4 text-sm lg:text-base font-medium nav-link"
            >
              Atrakcje
            </router-link>
          </div>
        </nav>

        <!-- Przyciski prawej strony -->
        <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
          <!-- Dropdown języka/waluty (tylko na desktop) -->
          <div class="hidden lg:block relative currency-dropdown">
            <button
              ref="currencyButtonRef"
              @click="toggleLanguageCurrency()"
              class="flex items-center text-sm lg:text-base text-gray-700 hover:text-gray-900 px-2 lg:px-2 py-2 cursor-pointer nav-link whitespace-nowrap"
            >
              <span>PL / PLN</span>
              <span class="text-xs ml-1">▼</span>
            </button>
          </div>

          <!-- Przyciski logowania -->
          <template v-if="isLoggedIn">
            <AnimatedButton
              variant="secondary"
              size="small"
              @click="toggleLogin"
              class="hidden md:inline-flex nav-btn auth-btn-desktop"
            >
              Wyloguj
            </AnimatedButton>
            <router-link
              to="/profile"
              @click="handleAuthClick"
              class="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer flex-shrink-0"
            >
              <i class="fas fa-user text-gray-600"></i>
            </router-link>
          </template>

          <template v-else>
            <!-- Przyciski na dużych ekranach -->
            <div class="hidden md:flex space-x-2 lg:space-x-3">
              <AnimatedButton
                variant="secondary"
                size="small"
                @click="toggleLogin"
                class="nav-btn auth-btn px-3 py-2 text-sm"
              >
                Zaloguj
              </AnimatedButton>
              <router-link to="/auth/register" @click="handleAuthClick">
                <AnimatedButton
                  variant="primary"
                  size="small"
                  class="nav-btn auth-btn px-3 py-2 text-sm"
                >
                  Konto
                </AnimatedButton>
              </router-link>
            </div>

            <!-- Ikona logowania na małych ekranach -->
            <button
              @click="toggleLogin"
              class="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer flex-shrink-0"
              title="Zaloguj się"
            >
              <i class="fas fa-sign-in-alt text-gray-600"></i>
            </button>
          </template>

          <!-- Hamburger -->
          <div class="flex items-center lg:hidden ml-1 sm:ml-2 flex-shrink-0">
            <button
              ref="mobileButtonRef"
              @click="toggleMobileMenu"
              class="text-gray-700 hover:text-gray-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              :aria-expanded="isMobileMenuOpen"
              aria-controls="mobile-menu"
            >
              <span class="sr-only">Otwórz menu</span>
              <i class="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Menu na mobilce -->
  <transition name="mobile-nav">
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-white mobile-menu">
      <div class="w-full mx-auto px-3 sm:px-4 md:px-6">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            to="/planner"
            class="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer mobile-nav-link"
            :class="{ 'mobile-active': $route.path === '/planner' }"
            @click="isMobileMenuOpen = false; setBodyOverflow(false)"
          >
            Planer
          </router-link>
          <router-link
            to="/flights"
            class="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer mobile-nav-link"
            :class="{ 'mobile-active': $route.path === '/flights' }"
            @click="isMobileMenuOpen = false; setBodyOverflow(false)"
          >
            Loty
          </router-link>
          <router-link
            to="/accommodations"
            class="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer mobile-nav-link"
            :class="{ 'mobile-active': $route.path === '/accommodations' }"
            @click="isMobileMenuOpen = false; setBodyOverflow(false)"
          >
            Noclegi
          </router-link>
          <router-link
            to="/attractions"
            class="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer mobile-nav-link"
            :class="{ 'mobile-active': $route.path === '/attractions' }"
            @click="isMobileMenuOpen = false; setBodyOverflow(false)"
          >
            Atrakcje
          </router-link>
        </div>
        
        <div class="pt-4 pb-3 border-t border-gray-200">
          <!-- Język i Waluta -->
          <div class="flex items-center justify-between px-4">
            <div class="flex items-center">
              <div class="flex flex-col cursor-pointer" @click="toggleLanguageCurrency(true)">
                <div class="px-1 py-1 text-xs text-gray-500">Język i waluta</div>
                <div class="text-sm text-gray-700 font-medium">PL / PLN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal wyboru języka i waluty -->
  <div v-if="isLanguageCurrencyOpen" class="modal-wrapper">
    <!-- Ciemne tło -->
    <div class="modal-overlay" @click="closeLanguageCurrency"></div>

    <!-- Zawartość modalu -->
    <div ref="currencyDropdownRef" class="modal-content">
      <!-- Nagłówek -->
      <div class="flex justify-between items-center p-2 xs:p-4 border-b border-gray-200">
        <h2 class="text-lg xs:text-xl font-bold text-gray-800">Preferencje</h2>
        <button
          @click="closeLanguageCurrency"
          class="text-gray-500 hover:text-gray-900 cursor-pointer"
          aria-label="Zamknij"
        >
          <i class="fas fa-times text-lg xs:text-xl"></i>
        </button>
      </div>

      <!-- Karty zaminy języka/ waluty -->
      <div class="border-b border-gray-200">
        <div class="flex">
          <button
            @click="setActiveTab('region')"
            :class="[
              'px-3 xs:px-6 py-2 xs:py-3 text-sm xs:text-base font-medium cursor-pointer',
              activeTab === 'region' ? 'text-black border-b-2 border-black' : 'text-gray-500',
            ]"
          >
            Region
          </button>
          <button
            @click="setActiveTab('currency')"
            :class="[
              'px-3 xs:px-6 py-2 xs:py-3 text-sm xs:text-base font-medium cursor-pointer',
              activeTab === 'currency' ? 'text-black border-b-2 border-black' : 'text-gray-500',
            ]"
          >
            Waluta
          </button>
        </div>
      </div>

      <!-- Zawartość zakładek -->
      <div class="p-2 xs:p-4 overflow-y-auto max-h-[60vh]">
        <!-- Języki -->
        <div v-if="activeTab === 'region'" class="dropdown-content">
          <h3 class="font-medium mb-2 xs:mb-4 text-sm xs:text-base">Wybierz region i język</h3>

          <!-- Lista języków -->
          <div
            class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-4"
          >
            <div class="p-2 xs:p-3 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer">
              <div class="font-medium text-sm xs:text-base">Polski</div>
              <div class="text-xs text-gray-500">PL</div>
            </div>
          </div>
        </div>

        <!-- Waluty -->
        <div v-if="activeTab === 'currency'" class="dropdown-content">
          <h3 class="font-medium mb-2 xs:mb-4 text-sm xs:text-base">Wybierz walutę</h3>

          <!-- Lista walut -->
          <div
            class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-4"
          >
            <div class="p-2 xs:p-3 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer">
              <div class="font-medium text-sm xs:text-base">Polski Złoty</div>
              <div class="text-xs text-gray-500">PLN</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stopka -->
      <div class="p-2 xs:p-4 border-t border-gray-200 text-xs text-gray-500">
        Zmiany będą aktywne podczas tej sesji.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Nawigacja */
.nav-header {
  overflow-x: hidden;
  max-width: 100vw;
}

.nav-container {
  max-width: min(1184px, 100vw);
  overflow-x: hidden;
}

/* Animacja podkreślenia */
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  background-color: #10b981; /* primary-500 */
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Aktywna strona */
.router-link-active.nav-link::after {
  width: 100%;
}

.router-link-active.nav-link {
  color: #059669; /* primary-600 */
  font-weight: 600;
}

/* Style dla linków mobilnych */
.mobile-active {
  color: #059669;
  font-weight: 600;
  border-left: 3px solid #10b981;
  padding-left: calc(0.75rem - 3px);
  background-color: #f0fdf4; /* green-50 */
}

/* Menu mobilne */
.mobile-menu {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  background-color: white;
  width: 100vw;
  max-width: 100vw;
}

/* Modal */
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  max-width: 100vw;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  max-width: 100vw;
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: min(600px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Responsywne style dla małych ekranów */
@media (max-width: 320px) {
  .nav-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    max-width: 320px;
  }

  .logo-icon {
    height: 2rem;
    width: 2rem;
    font-size: 0.75rem;
  }

  .logo-text {
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }

  .auth-btn {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    min-width: 50px;
    font-size: 0.75rem;
  }

  .currency-dropdown {
    min-width: 50px;
    font-size: 0.75rem;
  }

  .mobile-menu {
    width: 320px;
    max-width: 320px;
  }

  .modal-content {
    max-width: calc(320px - 2rem);
  }
}

@media (max-width: 375px) {
  .nav-container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .mobile-menu {
    max-width: 375px;
  }
}

/* Animacje */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s ease;
  overflow-x: hidden;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Flex zabezpieczenia */
.flex {
  min-width: 0;
  max-width: 100%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
