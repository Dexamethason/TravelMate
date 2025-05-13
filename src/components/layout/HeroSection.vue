<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const router = useRouter()

const navigateToPlanner = () => {
  router.push('/planner')
}
</script>

<template>
  <!-- Hero section z tłem zdjęciowym - pełna szerokość i wysokość -->
  <div
    class="relative w-full hero-height flex flex-col items-center justify-center text-center overflow-hidden"
  >
    <!-- Tło -->
    <div class="absolute inset-0 w-full h-full">
      <!-- Zdjęcie desktop (ukryte na małych ekranach) -->
      <div
        class="hidden md:block w-full h-full bg-cover bg-center"
        :style="{
          backgroundImage: 'url(/src/assets/images/hero/mainPage-hero-big.jpg)',
          backgroundAttachment: 'fixed',
        }"
      ></div>
      <!-- Zdjęcie mobile (widoczne tylko na małych ekranach) -->
      <div
        class="md:hidden w-full h-full bg-cover bg-center"
        :style="{
          backgroundImage: 'url(/src/assets/images/hero/mainPage-hero-small.jpg)',
          backgroundAttachment: 'fixed',
        }"
      ></div>
      <!-- Przyciemnione tło obrazka (jedna warstwa) -->
      <div class="absolute inset-0 bg-black opacity-35"></div>
    </div>

    <div class="relative z-10 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 hero-shadow">
        Odkrywaj świat z TravelMate
      </h1>
      <p class="text-lg md:text-xl text-white mb-10 max-w-xl mx-auto hero-shadow">
        Zaplanuj swoją wymarzoną podróż bez stresu. Wszystko czego potrzebujesz w jednym miejscu:
        loty, noclegi i atrakcje z najlepszymi cenami.
      </p>

      <!-- Przycisk z animacją -->
      <AnimatedButton
        variant="primary"
        size="default"
        animation-color="rgba(255, 255, 255, 0.2)"
        @click="navigateToPlanner"
      >
        Zaplanuj podróż teraz!
      </AnimatedButton>
    </div>
  </div>
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
  margin-left: calc(-50vw + 50%)
}

/* Dla mniejszych ekranów  */
@media (max-width: 768px) {
  .hero-height {
    height: calc(100vh - 5rem);
    min-height: 400px;
  }
}

/* Dla bardzo małych ekranów */
@media (max-width: 640px) {
  .hero-height {
    min-height: 350px;
  }
}
</style>
