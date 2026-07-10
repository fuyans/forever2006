<script setup lang="ts">
import type { MediaItem } from '~/components/MediaGallery.vue'

interface Memory {
  slug: string
  date: string
  title: string
  period: string
  category: string
  description: string
  cover: string
  gallery: Array<{ type: string, src: string, alt?: string, caption?: string }>
}

const props = defineProps<{
  milestone: Memory
}>()

const mediaItems = computed<MediaItem[]>(() => {
  const cover: MediaItem = {
    type: 'image',
    src: props.milestone.cover,
    alt: props.milestone.title,
    caption: props.milestone.title
  }
  const rest: MediaItem[] = (props.milestone.gallery ?? []).map(g => ({
    type: g.type as 'image' | 'video',
    src: g.src,
    alt: g.alt,
    caption: g.caption,
    poster: (g as { poster?: string }).poster
  }))
  return [cover, ...rest]
})
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
    :transition="{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }"
    :in-view-options="{ once: true, margin: '-80px' }"
    class="timeline-row pb-8 md:pb-10 last:pb-0"
  >
    <!-- Spine column: dot centered on the vertical line -->
    <div class="timeline-spine-col relative">
      <div
        class="timeline-dot absolute"
        aria-hidden="true"
      />
    </div>

    <article class="rounded-2xl bg-elevated/40 shadow-sm min-w-0 transition-shadow duration-500 hover:shadow-md p-5 sm:p-6">
      <h3 class="text-xl sm:text-2xl font-semibold text-highlighted font-serif leading-tight">
        {{ milestone.title }}
      </h3>

      <p class="mt-1 text-sm font-medium text-primary">
        {{ milestone.period }}
      </p>

      <p class="mt-3 text-sm sm:text-base text-muted leading-relaxed whitespace-pre-wrap">
        {{ milestone.description }}
      </p>

      <MediaCarousel :items="mediaItems" />
    </article>
  </Motion>
</template>
