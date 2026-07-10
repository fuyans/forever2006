<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => {
  return queryCollection('index').first()
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

// Memories from the folder-based structure, served by the memories API.
const { data: memories } = await useAsyncData<Memory[]>('memories', () => {
  // Try static JSON first (exists in static builds), fall back to live API.
  return $fetch<Memory[]>('/api/memories.json')
    .catch(() => useRequestFetch()<Memory[]>('/api/memories'))
    .catch(() => [] as Memory[])
})

interface YearGroup {
  year: number
  milestones: Memory[]
}

// Group by year. Date is "2003-09-01", so extract the first 4 chars.
const yearGroups = computed<YearGroup[]>(() => {
  const map = new Map<number, Memory[]>()
  for (const m of (memories.value ?? [])) {
    const year = parseInt(m.date.slice(0, 4), 10)
    const list = map.get(year) ?? []
    list.push(m)
    map.set(year, list)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, items]) => ({ year, milestones: items }))
})

// One continuous spine from the first dot centre to the last — measured after layout.
const timelineEl = ref<HTMLElement | null>(null)
const spineLine = ref<{ top: number, height: number } | null>(null)

function updateSpineLine() {
  const root = timelineEl.value
  if (!root) return

  const dots = root.querySelectorAll<HTMLElement>('.timeline-dot')
  if (dots.length < 2) {
    spineLine.value = null
    return
  }

  const rootTop = root.getBoundingClientRect().top
  const first = dots[0]!.getBoundingClientRect()
  const last = dots[dots.length - 1]!.getBoundingClientRect()
  const top = first.top + first.height / 2 - rootTop
  const bottom = last.top + last.height / 2 - rootTop

  spineLine.value = { top, height: Math.max(0, bottom - top) }
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  updateSpineLine()
  resizeObserver = new ResizeObserver(() => updateSpineLine())
  if (timelineEl.value) resizeObserver.observe(timelineEl.value)
  // Re-measure once enter animations and images have settled.
  nextTick(() => {
    updateSpineLine()
    requestAnimationFrame(updateSpineLine)
  })
})

onUnmounted(() => resizeObserver?.disconnect())

watch(yearGroups, () => nextTick(updateSpineLine))

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <div v-if="page">
    <!-- Hero -->
    <UPageHero
      :ui="{
        container: 'py-28 sm:py-36 lg:py-48',
        title: 'text-4xl sm:text-5xl lg:text-6xl font-serif font-medium max-w-2xl mx-auto',
        description: 'mt-4 text-lg sm:text-xl max-w-2xl mx-auto text-muted'
      }"
    >
      <template #title>
        <Motion
          :initial="{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' }"
          :animate="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
          :transition="{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }"
        >
          {{ page.title }}
        </Motion>
      </template>

      <template #description>
        <Motion
          :initial="{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' }"
          :animate="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
          :transition="{ duration: 1.0, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }"
        >
          {{ page.description }}
        </Motion>
      </template>

      <template #links>
        <Motion
          :initial="{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' }"
          :animate="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
          :transition="{ duration: 1.0, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }"
        >
          <UButton
            v-for="link in page.hero?.links"
            :key="link.label"
            v-bind="link"
            size="lg"
          />
        </Motion>
      </template>
    </UPageHero>

    <!-- Intro -->
    <UPageSection
      v-if="page.intro"
      :ui="{ container: 'pt-0! pb-8' }"
    >
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-serif text-primary">
          {{ page.intro.title }}
        </h2>
        <p class="mt-2 text-muted">
          {{ page.intro.description }}
        </p>
      </div>
    </UPageSection>

    <!-- Timeline -->
    <UPageSection
      id="timeline"
      :ui="{ container: 'pt-4! pb-16' }"
    >
      <!-- Shared grid: 2rem spine column + content. Line sits at the column centre. -->
      <div
        ref="timelineEl"
        class="timeline relative max-w-3xl"
      >
        <div
          v-if="spineLine"
          class="timeline-line"
          :style="{ top: `${spineLine.top}px`, height: `${spineLine.height}px` }"
          aria-hidden="true"
        />

        <div
          v-for="group in yearGroups"
          :key="group.year"
        >
          <!-- Same vertical band as the fixed nav pill (top-2 / top-4, ~40px tall) -->
          <div class="timeline-year sticky top-14 sm:top-16 z-20 timeline-row h-10 sm:h-11 items-center mb-3">
            <div
              class="timeline-spine-col"
              aria-hidden="true"
            />
            <p class="timeline-year-label min-w-0 font-serif text-2xl sm:text-3xl text-primary tabular-nums leading-none">
              {{ group.year }}
              <span class="text-sm sm:text-base text-muted font-sans font-normal ml-1">年</span>
            </p>
          </div>

          <TimelineItem
            v-for="milestone in group.milestones"
            :key="milestone.slug"
            :milestone="milestone"
          />
        </div>
      </div>
    </UPageSection>

    <!-- 结语 -->
    <UPageSection
      :ui="{
        container: 'pt-0! pb-0! bg-gradient-to-b from-transparent via-amber-50/30 to-amber-50/50 dark:via-amber-950/10 dark:to-amber-950/20'
      }"
    >
      <div class="text-center max-w-xl mx-auto py-20 sm:py-28">
        <!-- Decorative line -->
        <div
          class="mx-auto mb-8 w-12 h-px bg-primary/30"
          aria-hidden="true"
        />

        <Motion
          :initial="{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(8px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
          :transition="{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }"
          :in-view-options="{ once: true }"
        >
          <p class="font-serif text-2xl sm:text-3xl lg:text-4xl text-highlighted leading-relaxed tracking-tight">
            时光会走远，<br class="sm:hidden">但那些年不会。
          </p>
          <p class="mt-5 text-sm sm:text-base text-muted leading-relaxed max-w-md mx-auto">
            二十年了。无论你如今身在何处，<br class="sm:hidden">这里永远有你的位置。
          </p>
          <UButton
            to="/guestbook"
            icon="i-lucide-message-circle"
            variant="soft"
            color="primary"
            size="lg"
            class="mt-8"
            label="给老同学们留句话"
          />
        </Motion>
      </div>
    </UPageSection>
  </div>
</template>
