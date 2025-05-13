<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import DiagonalBlocks from '@/components/ui/DiagonalBlocks.vue'

const router = useRouter()

const navigateToPlanner = () => {
  router.push('/planner')
}

const bigHeroImage = new URL('@/assets/images/hero/mainPage-hero-big.jpg', import.meta.url).href
const smallHeroImage = new URL('@/assets/images/hero/mainPage-hero-small.jpg', import.meta.url).href
</script>

<template>
  <!-- Hero section z tłem zdjęciowym - pełna szerokość i wysokość -->
  <div
    class="relative w-full hero-height flex flex-col items-center justify-center text-center overflow-hidden"
  >
    <!-- Ukośne bloki dekoracyjne - teraz tylko ostre kreski -->
    <DiagonalBlocks topColor="#ffffff" bottomColor="#1f2937" />

    <!-- Tło -->
    <div class="absolute inset-0 w-full h-full">
      <!-- Zdjęcie desktop (ukryte na małych ekranach) -->
      <div
        class="hidden md:block w-full h-full bg-cover bg-center"
        :style="{
          backgroundImage: `url(${bigHeroImage})`,
          backgroundAttachment: 'fixed',
        }"
      ></div>
      <!-- Zdjęcie mobile (widoczne tylko na małych ekranach) -->
      <div
        class="md:hidden w-full h-full bg-cover bg-center"
        :style="{
          backgroundImage: `url(${smallHeroImage})`,
          backgroundAttachment: 'scroll',
        }"
      ></div>
      <!-- Przyciemnione tło obrazka (jedna warstwa) -->
      <div class="absolute inset-0 bg-black opacity-35"></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
      ></div>
    </div>
    <div
      class="relative z-10 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto flex flex-col justify-between gap-8"
    >
      <div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 hero-shadow">
          Odkrywaj świat z TravelMate
        </h1>
        <p class="text-lg md:text-xl text-white max-w-xl mx-auto hero-shadow">
          Zaplanuj swoją wymarzoną podróż bez stresu. Wszystko czego potrzebujesz w jednym miejscu:
          loty, noclegi i atrakcje z najlepszymi cenami.
        </p>
      </div>

      <!-- Przycisk z animacją -->
      <div>
        <AnimatedButton
          variant="primary"
          size="default"
          animation-color="rgba(255, 255, 255, 0.2)"
          @click="navigateToPlanner"
          class="py-3.5 px-7"
        >
          Zaplanuj podróż teraz!
        </AnimatedButton>
      </div>
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
  margin-left: calc(-50vw + 50%);
}

/* Responsywny odstęp dla różnych rozmiarów ekranu */
@media (max-width: 768px) {
  .gap-8 {
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .gap-8 {
    gap: 1.25rem;
  }
}
</style>
