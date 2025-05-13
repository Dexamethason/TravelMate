<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'default', 
  },
  animationColor: {
    type: String,
    default: '', 
  },
})
</script>

<template>
  <button
    class="btn-special-animation relative overflow-hidden z-0"
    :class="{
      'bg-green-500 hover:bg-green-600 text-white': variant === 'primary',
      'bg-gray-500 hover:bg-gray-600 text-white': variant === 'secondary',
      'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700':
        variant === 'outline',
      'px-2 py-1 text-xs sm:text-sm': size === 'small',
      'px-4 sm:px-6 py-3 font-medium': size === 'default',
      'px-6 sm:px-8 py-4 text-lg font-medium': size === 'large',
      'rounded-lg shadow-lg hover:shadow-xl': true,
    }"
    :style="animationColor ? `--animation-color: ${animationColor};` : ''"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.btn-special-animation {
  position: relative;
  transition:
    background-color 0.3s,
    transform 0.2s,
    box-shadow 0.3s;
  overflow: hidden;
  z-index: 0;
}

.btn-special-animation::before {
  display: block;
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--animation-color, rgba(255, 255, 255, 0.1));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s;
  z-index: -1;
}

.btn-special-animation:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}
</style>
