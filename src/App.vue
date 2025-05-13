<script setup lang="ts">
import AppNavigation from './components/layout/AppNavigation.vue'
</script>

<template>
  <div class="min-w-[250px]">
    <!-- Komponent nawigacyjny - szerokość 100% -->
    <AppNavigation />

    <!-- Główny obszar treści z widokiem routera - pełna szerokość -->
    <main class="w-full py-0 sm:py-0 md:py-0">
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
