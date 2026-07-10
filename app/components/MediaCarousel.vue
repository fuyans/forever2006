<script setup lang="ts">
import type { MediaItem } from '~/components/MediaGallery.vue'
import { embedUrl } from '~/utils/media'

const props = defineProps<{
  items: MediaItem[]
}>()

const hasMany = computed(() => props.items.length > 1)

// Autoplay muted video when the carousel scrolls into view.
const container = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// Click-to-zoom: opens MediaGallery lightbox.
const galleryOpen = ref<number | null>(null)

onMounted(() => {
  const el = container.value
  if (!el) return
  const io = new IntersectionObserver(
    ([entry]) => { isVisible.value = entry?.isIntersecting ?? false },
    { threshold: 0.3 }
  )
  io.observe(el)
  onUnmounted(() => io.disconnect())
})

// Play / pause the first video found in the container.
watch(isVisible, (v) => {
  const video = container.value?.querySelector<HTMLVideoElement>('video')
  if (!video) return
  if (v) {
    video.muted = true
    video.play().catch(() => {})
  } else {
    video.pause()
  }
})
</script>

<template>
  <div
    v-if="items.length"
    ref="container"
    class="mt-4 rounded-xl overflow-hidden border border-default bg-muted/20"
  >
    <UCarousel
      v-slot="{ item, index }"
      :items="items"
      :arrows="hasMany"
      :dots="false"
      :loop="hasMany"
      :wheel-gestures="hasMany"
      :ui="{
        root: 'relative',
        viewport: 'overflow-hidden',
        item: 'basis-full min-w-0 ps-0',
        container: 'ms-0',
        prev: 'bg-black/60 hover:bg-black/80 text-white border-0 disabled:opacity-100',
        next: 'bg-black/60 hover:bg-black/80 text-white border-0 disabled:opacity-100'
      }"
    >
      <div class="relative">
        <div
          class="aspect-video bg-black/5 dark:bg-black/40 group/click cursor-zoom-in"
          @click="galleryOpen = index"
        >
          <img
            v-if="item.type === 'image'"
            :src="assetUrl(item.src)"
            :alt="item.alt || item.caption || ''"
            class="h-full w-full object-contain"
          >

          <template v-else>
            <iframe
              v-if="embedUrl(item.src)"
              :src="embedUrl(item.src)!"
              class="h-full w-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              :title="item.caption || item.alt || '视频'"
            />
            <video
              v-else
              :src="assetUrl(item.src)"
              :poster="item.poster ? assetUrl(item.poster) : undefined"
              muted
              loop
              playsinline
              class="h-full w-full object-contain bg-black"
            />
          </template>
        </div>

        <p
          v-if="item.caption"
          class="px-3 py-2 text-xs text-muted leading-relaxed border-t border-default/50 bg-default/50"
        >
          {{ item.caption }}
        </p>
      </div>
    </UCarousel>

    <!-- Click-to-zoom lightbox -->
    <MediaGallery
      v-if="items.length"
      v-model="galleryOpen"
      :items="items"
    />
  </div>
</template>
