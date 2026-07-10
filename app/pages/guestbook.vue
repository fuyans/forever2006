<script setup lang="ts">
const { data: page } = await useAsyncData('guestbook-page', () => {
  return queryCollection('guestbook').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

// Fetch messages. Refreshable after a new post. During SSR we must forward the
// incoming request's cookies so the server-middleware auth gate lets the
// internal $fetch through (otherwise it 401s and we silently render empty).
const fetchMessages = (): Promise<Array<{ id: string, name: string, body: string, createdAt: string, avatarColor: string }>> =>
  $fetch<Array<{ id: string, name: string, body: string, createdAt: string, avatarColor: string }>>('/api/messages.json')
    .catch(() => $fetch<Array<{ id: string, name: string, body: string, createdAt: string, avatarColor: string }>>('/api/messages', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
    }))
    .catch((): Array<{ id: string, name: string, body: string, createdAt: string, avatarColor: string }> => [])
const { data: messages, refresh } = await useAsyncData('messages', () =>
  fetchMessages().catch(() => [] as Array<{ id: string, name: string, body: string, createdAt: string, avatarColor: string }>)
)

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

    <UPageSection :ui="{ container: 'pt-0!' }">
      <!-- The wall: the "leave a note" form is always the first card -->
      <MessageList :messages="messages ?? []">
        <GuestbookForm @posted="refresh" />
      </MessageList>

      <p
        v-if="!messages?.length"
        class="text-center py-8 text-muted text-sm"
      >
        来贴第一张便签吧。
      </p>
    </UPageSection>
  </UPage>
</template>
