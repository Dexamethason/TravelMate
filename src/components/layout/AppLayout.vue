<script setup lang="ts"></script>

<template>
  <!-- Stała szerokość 1184px, płynne przesuwanie poniżej -->
  <div class="w-full mx-auto px-4 sm:px-6 md:px-8" style="width: min(1184px, 100vw)">
    <slot></slot>
  </div>
</template>
