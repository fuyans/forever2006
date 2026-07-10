<script setup lang="ts">
import { embedUrl } from '~/utils/media'

// Shared type for any media item rendered in a gallery. Kept here (and mirrored
// by the Zod schema in content.config.ts) so both the timeline and album pages
// can pass typed items without importing server-side collection types.
export interface MediaItem {
  type: 'image' | 'video'
  src: string
  alt?: string
  caption?: string
  poster?: string
}

const props = defineProps<{
  items: MediaItem[]
  // Index of the item to open at. Use null to keep closed.
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

// Internal index while the modal is open.
const index = ref(0)

// Bridge the number|null modelValue to UModal's boolean open state.
const isOpen = computed({
  get: () => props.modelValue !== null,
  set: (v) => {
    emit('update:modelValue', v ? index.value : null)
  }
})

// Keep the internal index in sync when the parent opens at a specific index.
watch(() => props.modelValue, (v) => {
  if (v !== null) index.value = v
}, { immediate: true })

const current = computed(() => props.items[index.value] ?? null)

const isFirst = computed(() => index.value <= 0)
const isLast = computed(() => index.value >= props.items.length - 1)

function close() {
  emit('update:modelValue', null)
}
function next() {
  index.value = Math.min(index.value + 1, props.items.length - 1)
}
function prev() {
  index.value = Math.max(index.value - 1, 0)
}

// Keyboard navigation. defineShortcuts is provided by Nuxt UI.
defineShortcuts({
  escape: close,
  arrowleft: prev,
  arrowright: next
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: 'max-w-4xl', body: 'p-0 sm:p-0' }"
    title="Memory"
    :description="current?.caption ?? undefined"
  >
    <template #body>
      <div
        v-if="current"
        class="relative bg-black/95 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]"
      >
        <!-- Image -->
        <img
          v-if="current.type === 'image'"
          :src="current.src"
          :alt="current.alt || current.caption || ''"
          class="max-h-[70vh] w-auto max-w-full object-contain"
        >

        <!-- Video: embed if known host, else direct file -->
        <template v-else>
          <iframe
            v-if="embedUrl(current.src)"
            :src="embedUrl(current.src)"
            class="w-full aspect-video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <video
            v-else
            :src="current.src"
            :poster="current.poster"
            controls
            autoplay
            class="max-h-[70vh] w-auto max-w-full"
          />
        </template>

        <!-- Prev / next -->
        <UButton
          v-if="!isFirst"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="solid"
          class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
          size="lg"
          aria-label="上一张"
          @click="prev"
        />
        <UButton
          v-if="!isLast"
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="solid"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
          size="lg"
          aria-label="下一张"
          @click="next"
        />

        <!-- Caption + counter -->
        <div
          v-if="current.caption || items.length > 1"
          class="absolute bottom-0 inset-x-0 flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent text-white text-sm"
        >
          <span class="opacity-90 line-clamp-2">
            {{ current.caption }}
          </span>
          <span
            v-if="items.length > 1"
            class="opacity-70 text-nowrap"
          >
            {{ index + 1 }} / {{ items.length }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>
