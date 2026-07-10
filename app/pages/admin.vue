<script setup lang="ts">
// Admin page — not linked in the main nav, reachable only at /admin. Used to
// moderate the guestbook. Protected by a separate admin password (set via
// NUXT_ADMIN_PASSWORD) which sets a distinct admin cookie. The site password is
// still required to reach this page at all (server middleware gate).

definePageMeta({
  layout: 'default'
})

interface Message {
  id: string
  name: string
  body: string
  createdAt: string
  avatarColor: string
}

const authed = ref(false)
const adminPassword = ref('')
const authError = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  authError.value = ''
  try {
    await $fetch('/api/auth/admin', {
      method: 'POST',
      body: { password: adminPassword.value }
    })
    authed.value = true
    await refresh()
  } catch (e: unknown) {
    authError.value = (e as { statusMessage?: string })?.statusMessage || '登录失败。'
  } finally {
    loading.value = false
  }
}

const { data: messages, refresh } = await useAsyncData('admin-messages', () =>
  $fetch('/api/messages', { headers: import.meta.server ? useRequestHeaders(['cookie']) : {} }).catch(() => [] as Message[])
)

const deletingId = ref<string | null>(null)
async function remove(id: string) {
  deletingId.value = id
  try {
    await $fetch(`/api/messages/${id}`, { method: 'DELETE' })
    await refresh()
  } catch {
    // surface nothing fancy; the row stays.
  } finally {
    deletingId.value = null
  }
}

useSeoMeta({ title: '管理 — 求实中学东校 2006届一班', robots: 'noindex, nofollow' })
</script>

<template>
  <UPage>
    <UPageHero
      title="管理"
      description="审核留言簿的留言。"
      :ui="{
        container: 'pt-20 sm:pt-24',
        title: 'mx-0! text-left text-2xl sm:text-3xl font-serif',
        description: 'mx-0! text-left'
      }"
    />

    <UPageSection :ui="{ container: 'pt-0!' }">
      <!-- Admin login -->
      <div
        v-if="!authed"
        class="max-w-sm"
      >
        <UFormField
          label="管理员密码"
          :error="authError"
        >
          <UInput
            v-model="adminPassword"
            type="password"
            placeholder="••••••••"
            class="w-full"
            @keydown.enter="login"
          />
        </UFormField>
        <UButton
          class="mt-3"
          :loading="loading"
          label="解锁"
          @click="login"
        />
      </div>

      <!-- Message moderation -->
      <div
        v-else
        class="flex flex-col gap-3"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex items-start gap-3 rounded-xl border border-default bg-elevated/40 p-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-highlighted truncate">
                {{ msg.name }}
              </span>
              <span class="text-xs text-muted shrink-0">{{ new Date(msg.createdAt).toLocaleString('zh-CN') }}</span>
            </div>
            <p class="mt-1 text-sm text-default whitespace-pre-wrap break-words">
              {{ msg.body }}
            </p>
          </div>
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :loading="deletingId === msg.id"
            aria-label="删除留言"
            @click="remove(msg.id)"
          />
        </div>
        <div
          v-if="!messages?.length"
          class="text-center py-12 text-muted"
        >
          暂无留言需要审核。
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
