<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const router = useRouter()
const currentYear = ref(new Date().getFullYear()) // Pobieranie aktualnego roku

// Linki do social media - możesz dodać swoje
const socialLinks = [
  { icon: 'fa-facebook-f', url: '#', label: 'Facebook' },
  { icon: 'fa-twitter', url: '#', label: 'Twitter' },
  { icon: 'fa-instagram', url: '#', label: 'Instagram' }
]

// Nawigacja do strony planera
const navigateToPlanner = () => {
  router.push('/planner')
}
</script>

<template>
  <footer class="bg-gray-800 text-white">
    <!-- Górna sekcja footer -->
    <div class="w-full px-4 sm:px-6 md:px-8 py-12 mx-auto">
      <div
        class="mx-auto"
        :class="{
          'max-w-full': true,
          'lg:max-w-[90%]': true,
          'xl:max-w-[80%]': true,
          '2xl:max-w-[60%]': true,
        }"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Logo i opis -->
          <div>
            <div class="flex items-center mb-4">
              <div class="h-10 w-10 bg-green-500 rounded-md flex items-center justify-center">
                <span class="text-white font-bold">TM</span>
              </div>
              <span class="ml-2 text-xl font-semibold text-white">TravelMate</span>
            </div>
            <p class="text-gray-300 mb-4">
              Planuj podróże bez stresu. TravelMate pomaga znaleźć najlepsze loty, noclegi i atrakcje w jednym miejscu.
            </p>
            <!-- Social media -->
            <div class="flex space-x-4 mt-4">
              <a 
                v-for="social in socialLinks" 
                :key="social.icon" 
                :href="social.url" 
                :aria-label="social.label"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <i :class="['fab', social.icon]"></i>
              </a>
            </div>
          </div>

          <!-- Sekcje nawigacyjne -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Odkrywaj</h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/planner" class="text-gray-300 hover:text-white transition-colors">
                  Planer podróży
                </router-link>
              </li>
              <li>
                <router-link to="/flights" class="text-gray-300 hover:text-white transition-colors">
                  Loty
                </router-link>
              </li>
              <li>
                <router-link to="/accommodations" class="text-gray-300 hover:text-white transition-colors">
                  Noclegi
                </router-link>
              </li>
              <li>
                <router-link to="/attractions" class="text-gray-300 hover:text-white transition-colors">
                  Atrakcje
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Pomoc -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Pomoc</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-300 hover:text-white transition-colors">
                  Centrum pomocy
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white transition-colors">
                  Regulamin
                </a>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Bądź na bieżąco</h3>
            <p class="text-gray-300 mb-4">
              Zapisz się do naszego newslettera, aby otrzymywać najlepsze oferty podróży.
            </p>
            <div class="mt-4">
              <AnimatedButton 
                variant="primary" 
                size="default" 
                animation-color="rgba(255, 255, 255, 0.2)"
                @click="navigateToPlanner"
              >
                Zaplanuj podróż
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dolny pasek copyright -->
    <div class="w-full bg-gray-900 py-4">
      <div
        class="mx-auto px-4 sm:px-6 md:px-8"
        :class="{
          'max-w-full': true,
          'lg:max-w-[90%]': true,
          'xl:max-w-[80%]': true,
          '2xl:max-w-[60%]': true,
        }"
      >
        <div class="flex flex-col md:flex-row justify-between items-center">
          <!-- Copyright -->
          <p class="text-sm text-gray-400">
            &copy; {{ currentYear }} TravelMate. Wszelkie prawa zastrzeżone.
          </p>
          
          <!-- Dodatkowe linki -->
          <div class="flex space-x-4 mt-2 md:mt-0">
            <a href="#" class="text-sm text-gray-400 hover:text-white transition-colors">
              Polityka prywatności
            </a>
            <a href="#" class="text-sm text-gray-400 hover:text-white transition-colors">
              Polityka cookies
            </a>
            <a href="#" class="text-sm text-gray-400 hover:text-white transition-colors">
              Mapa strony
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Tu możemy dodać style specyficzne dla footera */
</style>