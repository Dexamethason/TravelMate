<script setup lang="ts">
import SectionHeading from '@/components/layout/SectionHeading.vue'

interface HeroProps {
  title: string
  subtitle: string
  smallImage: string
  bigImage: string
}

defineProps<HeroProps>()
</script>

<template>
  <section class="relative h-[500px] lg:h-[600px] overflow-hidden">
    <!-- hero background with responsive images -->
    <div class="absolute inset-0">
      <picture>
        <source
          media="(min-width: 1024px)"
          :srcset="bigImage"
        />
        <source
          media="(max-width: 1023px)"
          :srcset="smallImage"
        />
        <img
          :src="bigImage"
          alt="Accommodation hero"
          class="w-full h-full object-cover object-center"
        />
      </picture>
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
    </div>

    <!-- hero content -->
    <div class="relative h-full z-10">
      <div class="container mx-auto px-4 h-full flex flex-col justify-center items-center">
        <SectionHeading 
          :title="title" 
          :subtitle="subtitle" 
          class="text-white text-center"
        />
      </div>
    </div>

    <!-- search overlay -->
    <div class="absolute -bottom-20 left-0 right-0 z-20">
      <div class="container mx-auto px-4">
        <div class="bg-white rounded-lg shadow-xl p-6">
          <slot name="search"></slot>
        </div>
      </div>
    </div>
  </section>
</template>