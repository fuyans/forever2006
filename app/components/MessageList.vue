<script setup lang="ts">
interface Message {
  id: string
  name: string
  body: string
  createdAt: string
  avatarColor: string
}

const props = defineProps<{
  messages: Message[]
}>()

// Show "5分钟前" style relative timestamps in Chinese.
function relative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const sec = Math.round(diff / 1000)
  if (sec < 60) return '刚刚'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}分钟前`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}小时前`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}天前`
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Avatar mark for the bubble. For CJK names, take the last 1–2 characters;
// for Latin names, take initials.
function avatarMark(name: string): string {
  const n = name.trim()
  if (!n) return '?'
  if (/[\u4e00-\u9fff]/.test(n)) {
    return n.length <= 2 ? n : n.slice(-2)
  }
  return n.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'
}

// A stable pseudo-random value per message, so each note gets a consistent
// rotation and paper color rather than jumping around on re-render. Derived
// from the id so it survives the SSR→client hydration.
function seed(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Six warm paper colors, cycled deterministically.
const PAPERS = [
  { bg: 'bg-amber-50 dark:bg-amber-950/40', ink: 'text-amber-900 dark:text-amber-100' },
  { bg: 'bg-rose-50 dark:bg-rose-950/40', ink: 'text-rose-900 dark:text-rose-100' },
  { bg: 'bg-sky-50 dark:bg-sky-950/40', ink: 'text-sky-900 dark:text-sky-100' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', ink: 'text-emerald-900 dark:text-emerald-100' },
  { bg: 'bg-violet-50 dark:bg-violet-950/40', ink: 'text-violet-900 dark:text-violet-100' },
  { bg: 'bg-orange-50 dark:bg-orange-950/40', ink: 'text-orange-900 dark:text-orange-100' }
]

function paper(id: string) {
  return PAPERS[seed(id) % PAPERS.length] ?? PAPERS[0]!
}

// Small rotation between -4deg and +4deg, deterministic per message.
function rotation(id: string): string {
  const r = (seed(id) % 900) / 100 - 4.5 // -4.5 .. +4.5
  return `${r.toFixed(1)}deg`
}
</script>

<template>
  <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
    <!-- Optional leading slot (used for the "add a note" form card) -->
    <slot />

    <Motion
      v-for="msg in props.messages"
      :key="msg.id"
      :initial="{ opacity: 0, transform: 'translateY(12px) scale(0.96)' }"
      :animate="{ opacity: 1, transform: 'translateY(0) scale(1)' }"
      :transition="{ duration: 0.35 }"
      class="group relative mb-4 inline-block w-full break-inside-avoid"
      :style="{ transform: `rotate(${rotation(msg.id)})` }"
    >
      <!-- The sticky note -->
      <div
        class="rounded-sm shadow-md shadow-black/5 dark:shadow-black/30 transition-all duration-300 group-hover:rotate-0 group-hover:scale-[1.03] group-hover:shadow-xl group-hover:z-10"
        :class="paper(msg.id).bg"
      >
        <div
          class="px-4 pt-3 pb-2"
          :class="paper(msg.id).ink"
        >
          <!-- Body text, the heart of the note -->
          <p class="text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[2.5rem]">
            {{ msg.body }}
          </p>
        </div>

        <!-- Full-width separator -->
        <hr
          class="border-current/10"
          aria-hidden="true"
        >

        <!-- Footer: avatar + name + time -->
        <div
          class="px-4 py-2 flex items-center gap-2"
          :class="paper(msg.id).ink"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/60 dark:bg-black/30 text-xs font-semibold"
            :class="msg.avatarColor"
          >
            {{ avatarMark(msg.name) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium truncate">
              {{ msg.name }}
            </p>
          </div>
          <span class="text-[10px] opacity-50 shrink-0">{{ relative(msg.createdAt) }}</span>
        </div>
      </div>
    </Motion>
  </div>
</template>
