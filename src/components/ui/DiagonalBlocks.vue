<script setup lang="ts">
const props = defineProps({
  // Kolory bloków
  topColor: {
    type: String,
    default: '#ffffff' // Domyślnie kolor nawigacji
  },
  bottomColor: {
    type: String,
    default: '#1f2937' // Domyślnie kolor footera (bg-gray-800)
  },
  
  // Widoczność bloków
  showTop: {
    type: Boolean,
    default: true
  },
  showBottom: {
    type: Boolean,
    default: true
  },
  
  // Rozmiar i transformacja
  skewAngle: {
    type: String,
    default: '45deg'
  },
  
  // Wysokość bloków
  topHeight: {
    type: [String, Number],
    default: 40 // w pikselach
  },
  bottomHeight: {
    type: [String, Number],
    default: 40 // w pikselach
  },
  
  // Szerokość bloków (jako procent)
  width: {
    type: [String, Number],
    default: 60 // w procentach
  }
})

// Obliczanie wartości skewu jako string z 'deg'
const skewTransform = `skew(${props.skewAngle})`

// Obliczanie wysokości z jednostką
const getHeightWithUnit = (height: string | number): string => {
  return typeof height === 'number' ? `${height}px` : height
}

// Obliczanie szerokości z jednostką
const getWidthWithUnit = (width: string | number): string => {
  return typeof width === 'number' ? `${width}%` : width
}
</script>

<template>
  <div class="diagonal-blocks-container">
    <!-- Górny ukośny blok -->
    <div 
      v-if="showTop" 
      class="diagonal-block diagonal-block-right"
      :style="{
        backgroundColor: topColor,
        transform: skewTransform,
        height: getHeightWithUnit(topHeight),
        width: getWidthWithUnit(width)
      }"
    ></div>
    
    <!-- Dolny ukośny blok -->
    <div 
      v-if="showBottom" 
      class="diagonal-block diagonal-block-left"
      :style="{
        backgroundColor: bottomColor,
        transform: skewTransform,
        height: getHeightWithUnit(bottomHeight),
        width: getWidthWithUnit(width)
      }"
    ></div>
  </div>
</template>

<style scoped>
/* Kontener do poprawnego pozycjonowania bloków */
.diagonal-blocks-container {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none; 
}

/* Style dla ukośnych bloków */
.diagonal-block {
  position: absolute;
  overflow: hidden;
}

/* Pozycjonowanie bloków */
.diagonal-block-left {
  bottom: 0;
  left: -50px;
}

.diagonal-block-right {
  top: 0;
  right: -50px;
}

</style>