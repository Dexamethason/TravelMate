<script setup lang="ts">
// przycisk z animacja
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
</script>

<template>
  <section class="py-8 bg-white shadow-md">
    <!-- Stała szerokość 1184px, płynne przesuwanie poniżej -->
    <div class="w-full mx-auto px-4 sm:px-6 md:px-8" style="width: min(1184px, 100vw)">
      <form class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- pole na miasto -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Lokalizacja</label>
          <input
            type="text"
            placeholder="Gdzie chcesz nocować?"
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <!-- kiedy sie melduje -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Zameldowanie</label>
          <input type="date" class="w-full p-2 border rounded-lg" />
        </div>

        <!-- kiedy wyjezdza -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Wymeldowanie</label>
          <input type="date" class="w-full p-2 border rounded-lg" />
        </div>

        <!-- ile ludzi jedzie -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Liczba gości</label>
          <select class="w-full p-2 border rounded-lg">
            <option value="1">1 osoba</option>
            <option value="2">2 osoby</option>
            <option value="3">3 osoby</option>
            <option value="4">4 osoby</option>
          </select>
        </div>

        <!-- guzik do szukania -->
        <div class="md:col-span-4 flex justify-center mt-4">
          <AnimatedButton>Szukaj</AnimatedButton>
        </div>
      </form>
    </div>
  </section>
</template>
