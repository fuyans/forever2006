<script setup lang="ts">
interface Person {
  id: string
  name: string
  bio: string
  photo?: string
  createdAt: string
  updatedAt: string
}

defineProps<{
  person: Person
  // Show admin controls (edit / delete).
  admin?: boolean
}>()

const emit = defineEmits<{
  edit: [person: Person]
  delete: [person: Person]
}>()

// Colored avatar initials when there's no photo. Mirrors the guestbook logic.
const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300',
  'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
  'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300',
  'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300',
  'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300'
]

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!
}

function mark(name: string): string {
  const n = name.trim()
  if (!n) return '?'
  if (/[\u4e00-\u9fff]/.test(n)) return n.length <= 2 ? n : n.slice(-2)
  return n.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'
}
</script>

<template>
  <div
    class="group relative flex flex-col items-center text-center rounded-2xl border border-default bg-elevated/40 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
  >
    <!-- Admin controls -->
    <div
      v-if="admin"
      class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <UButton
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="编辑"
        @click="emit('edit', person)"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="xs"
        aria-label="删除"
        @click="emit('delete', person)"
      />
    </div>

    <!-- Photo or colored avatar -->
    <div class="size-28 rounded-full overflow-hidden ring-4 ring-default shadow-sm mb-4 shrink-0">
      <img
        v-if="person.photo"
        :src="assetUrl(person.photo)"
        :alt="person.name"
        class="w-full h-full object-cover"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-2xl font-semibold"
        :class="colorFor(person.id)"
      >
        {{ mark(person.name) }}
      </div>
    </div>

    <!-- Name -->
    <h3 class="font-medium text-highlighted">
      {{ person.name }}
    </h3>

    <!-- Bio -->
    <p class="mt-2 text-sm text-muted leading-relaxed line-clamp-4">
      {{ person.bio }}
    </p>
  </div>
</template>
