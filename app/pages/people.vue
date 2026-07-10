<script setup lang="ts">
const { data: page } = await useAsyncData('people-page', () => {
  return queryCollection('people').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

interface Person {
  id: string
  name: string
  bio: string
  photo?: string
  createdAt: string
  updatedAt: string
}

// Forward cookies on SSR so the auth gate lets the internal fetch through.
const fetchPeople = (): Promise<Person[]> =>
  $fetch<Person[]>('/api/people.json')
    .catch(() => $fetch<Person[]>('/api/people', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
    }))
    .catch((): Person[] => [])

const { data: people, refresh } = await useAsyncData('people', () =>
  fetchPeople().catch(() => [] as Person[])
)

// ---- Admin state ----
// Admin edit/delete controls show only after the admin has unlocked (same
// separate admin password as the guestbook moderation page).
const adminUnlocked = ref(false)
const showAdminLogin = ref(false)
const adminPassword = ref('')
const adminError = ref('')

async function unlockAdmin() {
  adminError.value = ''
  try {
    await $fetch('/api/auth/admin', {
      method: 'POST',
      body: { password: adminPassword.value }
    })
    adminUnlocked.value = true
  } catch (e: unknown) {
    adminError.value = (e as { statusMessage?: string })?.statusMessage || '密码错误。'
  }
}

// ---- Edit modal ----
const editOpen = ref(false)
const editForm = reactive({ id: '', name: '', bio: '', photo: null as File | null })
const editError = ref('')
const editLoading = ref(false)

function startEdit(person: Person) {
  editForm.id = person.id
  editForm.name = person.name
  editForm.bio = person.bio
  editForm.photo = null
  editError.value = ''
  editOpen.value = true
}

async function submitEdit() {
  editError.value = ''
  editLoading.value = true
  try {
    const fd = new FormData()
    fd.append('name', editForm.name)
    fd.append('bio', editForm.bio)
    if (editForm.photo) fd.append('photo', editForm.photo)

    await $fetch(`/api/people/${editForm.id}`, { method: 'PUT', body: fd })
    editOpen.value = false
    await refresh()
  } catch (e: unknown) {
    editError.value = (e as { statusMessage?: string })?.statusMessage || '保存失败，请重试。'
  } finally {
    editLoading.value = false
  }
}

function onEditPhotoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  editForm.photo = input.files?.[0] ?? null
}

// ---- Delete ----
const deletingId = ref<string | null>(null)

async function confirmDelete(person: Person) {
  if (!confirm(`确定删除「${person.name}」吗？此操作不可撤销。`)) return
  deletingId.value = person.id
  try {
    await $fetch(`/api/people/${person.id}`, { method: 'DELETE' })
    await refresh()
  } catch {
    // keep the card
  } finally {
    deletingId.value = null
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

    <UPageSection :ui="{ container: 'pt-0!' }">
      <!-- Card wall: the "add yourself" form is the first card, visually
           matching the existing cards so filling it feels like completing one. -->
      <div
        class="grid gap-4"
        :class="people?.length
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'max-w-xs mx-auto'"
      >
        <!-- Add-yourself card (first) -->
        <PeopleFormCard @submitted="refresh" />

        <!-- Existing people -->
        <PeopleCard
          v-for="person in people"
          :key="person.id"
          :person="person"
          :admin="adminUnlocked"
          @edit="startEdit"
          @delete="confirmDelete"
        />
      </div>

      <!-- Admin entry, at the very bottom -->
      <div class="mt-12 pt-8 border-t border-default">
        <div
          v-if="!adminUnlocked"
          class="text-center"
        >
          <UButton
            v-if="!showAdminLogin"
            icon="i-lucide-lock"
            color="neutral"
            variant="ghost"
            size="xs"
            label="管理员入口"
            @click="showAdminLogin = true"
          />
          <div
            v-else
            class="max-w-xs mx-auto flex gap-2 items-start"
          >
            <UInput
              v-model="adminPassword"
              type="password"
              placeholder="管理员密码"
              class="flex-1"
              @keydown.enter="unlockAdmin"
            />
            <UButton
              size="sm"
              label="解锁"
              @click="unlockAdmin"
            />
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="取消"
              @click="showAdminLogin = false; adminError = ''"
            />
          </div>
          <p
            v-if="adminError"
            class="text-xs text-error mt-2"
          >
            {{ adminError }}
          </p>
        </div>
        <div
          v-else
          class="text-center"
        >
          <UButton
            icon="i-lucide-lock-open"
            color="success"
            variant="soft"
            size="xs"
            label="管理员已解锁 · 可编辑/删除卡片"
            disabled
          />
        </div>
      </div>
    </UPageSection>

    <!-- Edit modal -->
    <UModal
      v-model:open="editOpen"
      title="编辑同学"
      :ui="{ content: 'max-w-lg' }"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="姓名">
            <UInput
              v-model="editForm.name"
              class="w-full"
              maxlength="50"
            />
          </UFormField>
          <UFormField label="简介">
            <UTextarea
              v-model="editForm.bio"
              :rows="3"
              class="w-full"
              maxlength="300"
              autoresize
            />
          </UFormField>
          <UFormField label="更换照片">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-white file:px-3 file:py-1.5"
              @change="onEditPhotoSelect"
            >
          </UFormField>
          <p
            v-if="editError"
            class="text-sm text-error"
          >
            {{ editError }}
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              label="取消"
              @click="editOpen = false"
            />
            <UButton
              :loading="editLoading"
              label="保存"
              @click="submitEdit"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
