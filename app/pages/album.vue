<script setup lang="ts">
import type { MediaItem } from '~/components/MediaGallery.vue'

const { data: page } = await useAsyncData('album-page', () => {
  return queryCollection('album').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

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

interface AlbumItem extends MediaItem {
  year: number
  category: string
  milestoneTitle: string
  milestonePeriod: string
}

// Fetch from the folder-based memories API.
const { data: memories } = await useAsyncData('album-memories', () => {
  const base = import.meta.env.BASE_URL ?? '/'
  return $fetch<Memory[]>(`${base}api/memories.json`)
    .catch(() => useRequestFetch()<Memory[]>('/api/memories'))
    .catch(() => [] as Memory[])
})

const allItems = computed<AlbumItem[]>(() => {
  const out: AlbumItem[] = []
  for (const m of memories.value ?? []) {
    const year = parseInt(m.date.slice(0, 4), 10)
    const base: Omit<AlbumItem, 'type' | 'src'> = {
      year,
      category: m.category || 'milestone',
      milestoneTitle: m.title,
      milestonePeriod: m.period
    }
    // Cover image
    if (m.cover) {
      out.push({
        ...base,
        type: 'image',
        src: m.cover,
        alt: m.title,
        caption: `${m.title}`
      })
    }
    // Gallery (skip items that duplicate the cover)
    for (const g of m.gallery ?? []) {
      if (g.src === m.cover) continue
      out.push({
        ...base,
        type: g.type as 'image' | 'video',
        src: g.src,
        alt: g.alt,
        caption: g.caption
      })
    }
  }
  return out
})

// Distinct filter option lists, derived from the data.
const years = computed(() => [...new Set(allItems.value.map(i => i.year))].sort())
const categories = computed(() => [...new Set(allItems.value.map(i => i.category))].sort())

// Active filters (null = "all").
const yearFilter = ref<number | null>(null)
const categoryFilter = ref<string | null>(null)
const typeFilter = ref<'all' | 'image' | 'video'>('all')

const filtered = computed(() => {
  return allItems.value.filter((i) => {
    if (yearFilter.value !== null && i.year !== yearFilter.value) return false
    if (categoryFilter.value !== null && i.category !== categoryFilter.value) return false
    if (typeFilter.value !== 'all' && i.type !== typeFilter.value) return false
    return true
  })
})

// Gallery modal — opens at the clicked item's index within the *filtered* list.
const galleryOpen = ref<number | null>(null)
const galleryItems = computed(() => filtered.value.map(({ type, src, alt, caption, poster }) => ({
  type, src, alt, caption, poster
})) as MediaItem[])

function openAt(index: number) {
  galleryOpen.value = index
}

// Map internal category values to Chinese display labels.
function categoryLabel(c: string): string {
  switch (c) {
    case 'milestone': return '里程碑'
    case 'event': return '活动'
    case 'trip': return '出游'
    case 'memory': return '回忆'
    case 'reunion': return '重聚'
    default: return c
  }
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :ui="{
        container: 'pt-20 sm:pt-24',
        title: 'mx-0! text-left text-3xl sm:text-4xl font-serif',
        description: 'mx-0! text-left'
      }"
    />

    <!-- Filters -->
    <UPageSection :ui="{ container: 'pt-0!' }">
      <div class="flex flex-col gap-1">
        <div class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-muted mr-1">年份：</span>
          <UButton
            size="xs"
            :variant="yearFilter === null ? 'solid' : 'soft'"
            color="primary"
            label="全部"
            @click="yearFilter = null"
          />
          <UButton
            v-for="y in years"
            :key="y"
            size="xs"
            :variant="yearFilter === y ? 'solid' : 'soft'"
            color="primary"
            :label="String(y)"
            @click="yearFilter = y"
          />
        </div>
        <div class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-muted mr-1">类型：</span>
          <UButton
            v-for="t in [{ k: 'all', l: '全部' }, { k: 'image', l: '照片' }, { k: 'video', l: '视频' }]"
            :key="t.k"
            size="xs"
            :variant="typeFilter === t.k ? 'solid' : 'soft'"
            color="neutral"
            :label="t.l"
            @click="typeFilter = t.k as 'all' | 'image' | 'video'"
          />
        </div>
        <div class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-muted mr-1">类别：</span>
          <UButton
            size="xs"
            :variant="categoryFilter === null ? 'solid' : 'soft'"
            color="neutral"
            label="全部"
            @click="categoryFilter = null"
          />
          <UButton
            v-for="c in categories"
            :key="c"
            size="xs"
            :variant="categoryFilter === c ? 'solid' : 'soft'"
            color="neutral"
            :label="categoryLabel(c)"
            @click="categoryFilter = c"
          />
        </div>
      </div>

      <!-- Grid -->
      <div
        v-if="filtered.length"
        class="columns-2 sm:columns-3 lg:columns-4 gap-3 [&>*]:mb-3"
      >
        <button
          v-for="(item, index) in filtered"
          :key="index"
          type="button"
          class="group relative block w-full overflow-hidden rounded-2xl border border-default shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary break-inside-avoid transition-shadow duration-500 hover:shadow-md"
          @click="openAt(index)"
        >
          <img
            v-if="item.type === 'image'"
            :src="item.src"
            :alt="item.alt || item.milestoneTitle"
            class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          >
          <!-- Video: show poster (or a neutral block) with a play badge -->
          <template v-else>
            <img
              v-if="item.poster"
              :src="item.poster"
              :alt="item.alt || item.milestoneTitle"
              class="w-full object-cover"
            >
            <div
              v-else
              class="w-full aspect-video bg-elevated flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-film"
                class="size-10 text-muted"
              />
            </div>
            <span
              class="absolute inset-0 flex items-center justify-center"
            >
              <span class="flex size-12 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                <UIcon
                  name="i-lucide-play"
                  class="size-6 text-white"
                />
              </span>
            </span>
          </template>

          <!-- Hover overlay with the milestone title -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div class="absolute bottom-0 inset-x-0 p-3 text-left">
              <p class="text-[11px] tracking-wide text-white/70">
                {{ item.milestonePeriod }}
              </p>
              <p class="text-sm font-medium text-white leading-tight mt-0.5 line-clamp-2">
                {{ item.caption || item.milestoneTitle }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="text-center py-16 text-muted border border-dashed border-default rounded-2xl"
      >
        <UIcon
          name="i-lucide-image-off"
          class="size-10 mx-auto mb-3"
        />
        <p class="text-sm">
          没有符合筛选条件的照片或视频。
        </p>
        <p class="text-xs mt-1 opacity-60">
          试试放宽年份或类型筛选。
        </p>
      </div>
    </UPageSection>

    <!-- Gallery modal -->
    <MediaGallery
      v-if="galleryItems.length"
      v-model="galleryOpen"
      :items="galleryItems"
    />
  </UPage>
</template>
