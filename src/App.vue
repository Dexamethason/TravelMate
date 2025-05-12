<script setup lang="ts">
import AppNavigation from './components/layout/AppNavigation.vue'
</script>

<template>
  <div class="min-w-[250px]">
    <!-- Komponent nawigacyjny -->
    <AppNavigation />

    <!-- Główny obszar treści z widokiem routera -->
    <main
      class="w-full mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8"
      :class="{
        'max-w-full': true,
        'lg:max-w-[90%]': true,
        'xl:max-w-[85%]': true,
        '2xl:max-w-7xl': true,
      }"
    >
      <router-view />
    </main>
  </div>
</template>

<style>
/* Style globalne */
body {
  background-color: #f0f9ff;
  font-family: 'Inter', sans-serif;
  min-width: 250px;
  overflow-x: hidden;
}

</style>
