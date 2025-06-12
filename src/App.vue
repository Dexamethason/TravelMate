<script setup lang="ts">
import AppNavigation from './components/layout/AppNavigation.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-w-[250px] flex flex-col min-h-screen">
    <!-- Komponent nawigacyjny - szerokość 100% -->
    <AppNavigation />

    <!-- Główny obszar treści z widokiem routera - pełna szerokość -->
    <main class="w-full flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <AppFooter class="mt-0" />
  </div>
</template>

<style>
/* Globalna blokada poziomego przewijania */
html,
body {
  background-color: #f0f9ff;
  font-family: 'Inter', sans-serif;
  min-width: 250px;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

/* Zapobiegaj poziomemu przewijaniu na wszystkich elementach */
* {
  margin-block-end: 0;
  margin-block-start: 0;
  box-sizing: border-box;
}

/* Dodatkowa kontrola szerokości */
body {
  max-width: 100vw;
}
</style>
