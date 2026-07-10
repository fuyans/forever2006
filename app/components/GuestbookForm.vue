<script setup lang="ts">
const emit = defineEmits<{
  posted: []
}>()

const name = ref('')
const body = ref('')
const website = ref('') // honeypot
const loading = ref(false)
const errorMsg = ref('')

const bodyLen = computed(() => body.value.length)

// Quick-pick emoji to append to the message.
const quickEmojis = ['😄', '🫶', '😭', '🎊', '📸', '🎵', '🍻', '✨']

function addEmoji(e: string) {
  body.value += e
}

async function submit() {
  errorMsg.value = ''
  if (!name.value.trim()) {
    errorMsg.value = '请输入你的名字'
    return
  }
  if (!body.value.trim()) {
    errorMsg.value = '请写点什么'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/messages', {
      method: 'POST',
      body: {
        name: name.value,
        body: body.value,
        website: website.value // honeypot
      }
    })
    name.value = ''
    body.value = ''
    emit('posted')
  } catch (e: unknown) {
    errorMsg.value = (e as { statusMessage?: string })?.statusMessage || '发送失败，请再试一次。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="relative mb-4 inline-block w-full break-inside-avoid rounded-sm border-2 border-dashed border-primary/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm"
    style="transform: rotate(-1.5deg)"
    @submit.prevent="submit"
  >
    <div class="px-4 py-3 text-amber-900 dark:text-amber-100">
      <!-- Message body (placeholder acts as label) -->
      <textarea
        v-model="body"
        :rows="3"
        placeholder="分享一段回忆，打个招呼，或者只是签个名……"
        maxlength="500"
        class="w-full bg-transparent border-0 outline-none resize-none text-sm leading-relaxed placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40"
      />

      <!-- Emoji quick-pick -->
      <div class="flex flex-wrap items-center gap-0.5 mt-1">
        <button
          v-for="e in quickEmojis"
          :key="e"
          type="button"
          class="size-7 rounded-md hover:bg-amber-200/40 dark:hover:bg-amber-800/30 text-base leading-none transition-colors"
          :aria-label="`添加表情 ${e}`"
          @click="addEmoji(e)"
        >
          {{ e }}
        </button>
      </div>

      <!-- Footer: name + submit -->
      <div class="mt-3 pt-2 border-t border-current/10 flex items-center gap-2">
        <input
          v-model="name"
          type="text"
          placeholder="你的名字"
          maxlength="50"
          class="flex-1 bg-white/40 dark:bg-black/20 rounded-md px-2 py-1 text-xs font-medium outline-none border-0 placeholder:font-normal placeholder:opacity-50 focus:ring-1 focus:ring-primary/40"
        >
        <UButton
          type="submit"
          :loading="loading"
          icon="i-lucide-send"
          size="xs"
          label="留言"
        />
      </div>

      <!-- Honeypot -->
      <input
        v-model="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
        class="hidden"
        aria-hidden="true"
      >

      <!-- Error + counter -->
      <div class="flex items-center justify-between mt-2">
        <p
          v-if="errorMsg"
          class="text-xs text-error"
        >
          {{ errorMsg }}
        </p>
        <span
          v-else
        />
        <span class="text-[10px] opacity-50">{{ bodyLen }}/500</span>
      </div>
    </div>
  </form>
</template>
