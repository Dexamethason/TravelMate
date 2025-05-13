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

// Blokada scrollowania przy otwartym menu/modalu
const setBodyOverflow = (isLocked: boolean) => {
  document.body.style.overflow = isLocked ? 'hidden' : ''
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

// Obsługa przewijania - dodawanie cienia przy scrollowaniu
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

  <header
    class="fixed top-0 left-0 right-0 bg-white w-full z-50 transition-shadow duration-300"
    :class="{ 'shadow-md': isScrolled || isMobileMenuOpen }"
  >
    <!-- Główny wrapper -->
    <div class="w-full">
      <!-- Container z dostosowaniem do różnych ekranów -->
      <div
        class="w-full px-1 sm:px-4 md:px-6 mx-auto"
        :class="{
          'max-w-full': true,
          'lg:max-w-[60%]': true,
          'xl:max-w-[60%]': true,
          '2xl:max-w-[60%]': true,
        }"
      >
        <div class="flex justify-between h-20">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center" @click="handleLogoClick">
              <div
                class="h-10 w-10 xs:h-12 xs:w-12 bg-green-500 rounded-md flex items-center justify-center logo-icon flex-shrink-0"
              >
                <span class="text-white font-bold text-sm xs:text-lg">TM</span>
              </div>
              <span class="ml-2 xs:ml-3 text-base xs:text-xl font-semibold text-gray-900 logo-text"
                >TravelMate</span
              >
            </router-link>
          </div>

          <!-- Menu nawigacyjne (widoczne od LG w górę) -->
          <nav class="hidden lg:flex items-center ml-4 lg:ml-8 xl:ml-16 flex-shrink">
            <div class="flex space-x-1 lg:space-x-6 xl:space-x-10">
              <router-link
                to="/planner"
                class="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm lg:text-base font-medium nav-link"
              >
                Planer
              </router-link>
              <router-link
                to="/flights"
                class="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm lg:text-base font-medium nav-link"
              >
                Loty
              </router-link>
              <router-link
                to="/accommodations"
                class="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm lg:text-base font-medium nav-link"
              >
                Noclegi
              </router-link>
              <router-link
                to="/attractions"
                class="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm lg:text-base font-medium nav-link"
              >
                Atrakcje
              </router-link>
            </div>
          </nav>

          <!-- Przyciski prawej strony -->
          <div
            class="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0"
          >
            <!-- Dropdown języka/waluty (tylko na desktop) -->
            <div class="hidden lg:block relative">
              <button
                ref="currencyButtonRef"
                @click="toggleLanguageCurrency()"
                class="flex items-center text-sm lg:text-base text-gray-700 hover:text-gray-900 px-2 lg:px-2 py-2 cursor-pointer nav-link"
              >
                <span>PL / PLN</span>
                <span class="text-xs ml-1">▼</span>
              </button>
            </div>

            <!-- Przyciski logowania -->
            <template v-if="isLoggedIn">
  <!-- Wyloguj na dużych ekranach, ikona na małych -->
  <AnimatedButton
    variant="secondary"
    size="small"
    @click="toggleLogin"
    class="hidden md:inline-flex nav-btn"
  >
    Wyloguj
  </AnimatedButton>
  <router-link
    to="/profile"
    @click="handleAuthClick"
    class="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
  >
    <i class="fas fa-user text-gray-600"></i>
  </router-link>
</template>
            <template v-else>
              <!-- Przyciski na dużych ekranach -->
              <div class="hidden md:flex space-x-1 md:space-x-1 lg:space-x-2">
                <AnimatedButton
                  variant="secondary"
                  size="small"
                  @click="toggleLogin"
                  class="nav-btn"
                >
                  Zaloguj
                </AnimatedButton>
                <router-link to="/auth/register" @click="handleAuthClick">
                  <AnimatedButton variant="primary" size="small" class="nav-btn">
                    <span class="hidden sm:inline">Załóż konto</span>
                    <span class="sm:hidden">Rejestracja</span>
                  </AnimatedButton>
                </router-link>
              </div>
              <!-- Ikona na małych ekranach -->
              <router-link
                to="/auth/login"
                @click="handleAuthClick"
                class="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                <i class="fas fa-user text-gray-600"></i>
              </router-link>
            </template>

            <!-- Hamburger -->
            <div class="flex items-center lg:hidden ml-1 sm:ml-2">
              <button
                ref="mobileButtonRef"
                @click="toggleMobileMenu"
                class="inline-flex items-center justify-center p-1 xs:p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer w-10 h-10"
              >
                <div class="flex items-center justify-center w-full h-full">
                  <i
                    :class="[
                      'fas',
                      isMobileMenuOpen ? 'fa-times' : 'fa-bars',
                      'text-lg xs:text-xl',
                    ]"
                  ></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu na mobilce -->
      <transition name="mobile-nav">
        <div v-if="isMobileMenuOpen" class="lg:hidden bg-white mobile-menu">
          <div
            class="mx-auto"
            :class="{
              'max-w-full': true,
              'lg:max-w-[60%]': true,
              'xl:max-w-[60%]': true,
              '2xl:max-w-[60%]': true,
            }"
          >
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
    </div>
  </header>

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
header.fixed {
  transition: box-shadow 0.3s ease;
}

/* Podkreślenie pod linkami */
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
  background-color: #000000;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Indykator aktywnej strony */
.router-link-active.nav-link::after {
  width: 100%;
}

/* Pogrubienie aktywnej strony */
.router-link-active.nav-link {
  color: #1f2937;
  font-weight: 600;
}

/* Wyróżnienie aktywnej strony w menu na mobilce */
.mobile-active {
  color: #1f2937;
  font-weight: 600;
  border-left: 3px solid #10b981;
  padding-left: calc(0.75rem - 3px);
  background-color: #f3f4f6;
}

/* Animacja menu na mobilce */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.mobile-nav-enter-to,
.mobile-nav-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

/* Menu mobilne z maksymalną wysokością, aby umożliwić scrollowanie */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: calc(100vh - 5rem);
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Style dla modalki */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 999;
  padding-top: 50px;
  pointer-events: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.25);
  pointer-events: auto;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  pointer-events: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* Responsywność modala */
@media (max-width: 850px) {
  .modal-content {
    max-width: 95%;
    max-height: 90vh;
  }
}



/* Fixy responsywności dla breakpointów między LG i XL */
@media (min-width: 1024px) and (max-width: 1059px) {
  .nav-link {
    padding-left: 0.5rem ;
    padding-right: 0.5rem ;
  }

  .nav-btn {
    padding-left: 0.5rem ;
    padding-right: 0.5rem ;
  }
}
</style>
