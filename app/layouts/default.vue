<script setup lang="ts">
</script>

<template>
  <div>
    <UContainer class="sm:border-x border-default pt-10">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>

    <!-- Background music control, persists across pages. -->
    <MusicPlayer />
  </div>
</template>
