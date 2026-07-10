<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <footer class="py-6 text-center text-xs text-muted">
    {{ footer.credits }}
  </footer>
</template>
