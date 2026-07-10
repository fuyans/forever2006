<script setup lang="ts">
const audioEl = ref<HTMLAudioElement | null>(null)

const wantPlaying = useLocalStorage('memorial:music', false)
const volume = useLocalStorage('memorial:volume', 0.5)
const lastTrack = useLocalStorage('memorial:track', 0)

const playing = ref(false)
const tracks = ref<string[]>([])
const current = ref(lastTrack.value)

// Fetch playlist: try live /api/music (SSR/local), fall back to static
// /api/music.json (GitHub Pages — no server).
const { data } = await useAsyncData('music-tracks', async () => {
  try {
    return await $fetch<string[]>('/api/music')
  } catch {
    const base = import.meta.env.BASE_URL ?? '/'
    return $fetch<string[]>(`${base}api/music.json`)
  }
})
if (data.value?.length) tracks.value = data.value

const hasPlaylist = computed(() => tracks.value.length > 1)
const trackSrc = computed(() => tracks.value[current.value] ?? '')

async function toggle() {
  const el = audioEl.value
  if (!el || !trackSrc.value) return
  if (playing.value) {
    el.pause()
    playing.value = false
    wantPlaying.value = false
  } else {
    try {
      if (el.src !== trackSrc.value) el.src = trackSrc.value
      el.volume = volume.value
      await el.play()
      playing.value = true
      wantPlaying.value = true
    } catch {
      playing.value = false
    }
  }
}

function nextTrack() {
  if (!tracks.value.length) return
  current.value = (current.value + 1) % tracks.value.length
  lastTrack.value = current.value
  const el = audioEl.value
  if (!el) return
  el.src = tracks.value[current.value]!
  el.volume = volume.value
  if (wantPlaying.value) el.play().catch(() => {})
}

function prevTrack() {
  if (!tracks.value.length) return
  current.value = (current.value - 1 + tracks.value.length) % tracks.value.length
  lastTrack.value = current.value
  const el = audioEl.value
  if (!el) return
  el.src = tracks.value[current.value]!
  el.volume = volume.value
  if (wantPlaying.value) el.play().catch(() => {})
}

function onEnded() {
  if (hasPlaylist.value) {
    nextTrack()
  } else {
    playing.value = false
  }
}

function onVolume() {
  if (audioEl.value) audioEl.value.volume = volume.value
}

onMounted(() => {
  const el = audioEl.value
  if (!el || !trackSrc.value) return
  el.volume = volume.value
  el.loop = false // always false — we handle looping via playlist
  if (tracks.value.length > 1) el.src = trackSrc.value

  if (wantPlaying.value) {
    const startOnce = async () => {
      try {
        el.volume = volume.value
        await el.play()
        playing.value = true
      } catch { /* blocked */ }
      window.removeEventListener('pointerdown', startOnce)
    }
    window.addEventListener('pointerdown', startOnce, { once: true })
  }
})
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-default bg-default/80 backdrop-blur-md shadow-lg px-2 py-1.5"
  >
    <audio
      ref="audioEl"
      preload="none"
      @volumechange="onVolume"
      @ended="onEnded"
    />

    <!-- Prev track (only shown with playlist) -->
    <UButton
      v-if="hasPlaylist"
      icon="i-lucide-skip-back"
      color="neutral"
      variant="ghost"
      size="xs"
      class="rounded-full"
      aria-label="上一首"
      @click="prevTrack"
    />

    <UButton
      :icon="playing ? 'i-lucide-pause' : 'i-lucide-music'"
      :aria-label="playing ? '暂停音乐' : '播放音乐'"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-full"
      :class="playing ? 'text-primary' : ''"
      @click="toggle"
    >
      <span
        v-if="playing"
        class="flex items-end gap-0.5 h-4 ml-1"
        aria-hidden="true"
      >
        <span
          class="w-0.5 bg-primary rounded-full animate-equalize"
          style="height: 40%"
        />
        <span
          class="w-0.5 bg-primary rounded-full animate-equalize"
          style="height: 80%; animation-delay: 0.15s"
        />
        <span
          class="w-0.5 bg-primary rounded-full animate-equalize"
          style="height: 60%; animation-delay: 0.3s"
        />
      </span>
    </UButton>

    <!-- Next track (only shown with playlist) -->
    <UButton
      v-if="hasPlaylist"
      icon="i-lucide-skip-forward"
      color="neutral"
      variant="ghost"
      size="xs"
      class="rounded-full"
      aria-label="下一首"
      @click="nextTrack"
    />

    <input
      v-model="volume"
      type="range"
      min="0"
      max="1"
      step="0.05"
      class="hidden sm:block w-16 accent-primary"
      aria-label="音量"
      @input="onVolume"
    >
  </div>
</template>

<style scoped>
@keyframes equalize {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
.animate-equalize {
  animation: equalize 0.8s ease-in-out infinite;
  transform-origin: bottom;
}
</style>
