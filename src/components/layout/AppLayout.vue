<script setup lang="ts"></script>

<template>
  <div>
    <!-- utrzymanie stalych wymiarow na stronie -->
    <div
      class="w-full mx-auto px-4 sm:px-6"
      :class="{
        'max-w-full': true,
        'lg:max-w-[90%]': true,
        'xl:max-w-[80%]': true,
        '2xl:max-w-[60%]': true,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>
