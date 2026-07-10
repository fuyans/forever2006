<script setup lang="ts">
// A "fill-in" card that visually mirrors PeopleCard, so adding yourself feels
// like completing a card already in the grid — not filling a separate form.

const emit = defineEmits<{
  submitted: []
}>()

const form = reactive({
  name: '',
  bio: '',
  photo: null as File | null
})
const errorMsg = ref('')
const loading = ref(false)

// Live preview of the chosen photo (object URL), cleared on submit.
const photoPreview = ref<string>('')
const photoInput = ref<HTMLInputElement | null>(null)

function onPhotoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  form.photo = file
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
  photoPreview.value = file ? URL.createObjectURL(file) : ''
}

function triggerUpload() {
  photoInput.value?.click()
}

async function submit() {
  errorMsg.value = ''
  if (!form.name.trim()) {
    errorMsg.value = '请输入姓名'
    return
  }
  if (!form.bio.trim()) {
    errorMsg.value = '请写一句简介'
    return
  }
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('bio', form.bio)
    if (form.photo) fd.append('photo', form.photo)
    await $fetch('/api/people', { method: 'POST', body: fd })
    // Reset
    form.name = ''
    form.bio = ''
    form.photo = null
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value)
      photoPreview.value = ''
    }
    if (photoInput.value) photoInput.value.value = ''
    emit('submitted')
  } catch (e: unknown) {
    errorMsg.value = (e as { statusMessage?: string })?.statusMessage || '提交失败，请重试。'
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
})
</script>

<template>
  <form
    class="flex flex-col items-center text-center rounded-2xl border-2 border-dashed border-primary/30 bg-elevated/20 p-5 shadow-sm"
    @submit.prevent="submit"
  >
    <!-- Clickable circular photo upload -->
    <button
      type="button"
      class="size-28 rounded-full overflow-hidden ring-4 ring-default shadow-sm mb-4 shrink-0 flex items-center justify-center group/photo transition-all duration-500 hover:ring-primary/40"
      :class="!photoPreview ? 'bg-muted/50 border-2 border-dashed border-primary/40' : ''"
      aria-label="上传照片"
      @click="triggerUpload"
    >
      <img
        v-if="photoPreview"
        :src="photoPreview"
        alt="预览"
        class="w-full h-full object-cover"
      >
      <div
        v-else
        class="flex flex-col items-center gap-1 text-primary/60 group-hover:text-primary/80"
      >
        <UIcon
          name="i-lucide-camera"
          class="size-7"
        />
        <span class="text-[10px]">上传照片</span>
      </div>
    </button>
    <input
      ref="photoInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="onPhotoSelect"
    >

    <!-- Name (placeholder acts as label) -->
    <input
      v-model="form.name"
      type="text"
      placeholder="你的名字"
      maxlength="50"
      class="text-center font-medium text-highlighted bg-transparent border-b border-transparent focus:border-primary outline-none px-2 py-0.5 w-full max-w-[10rem]"
    >

    <!-- Bio (placeholder acts as label) -->
    <textarea
      v-model="form.bio"
      :rows="2"
      placeholder="当年印象最深的事 / 如今在做什么…"
      maxlength="300"
      class="mt-2 text-sm text-muted text-center bg-transparent border border-dashed border-default focus:border-primary/50 rounded-lg outline-none px-3 py-2 w-full resize-none"
    />

    <!-- Error -->
    <p
      v-if="errorMsg"
      class="text-xs text-error mt-2"
    >
      {{ errorMsg }}
    </p>

    <!-- Submit -->
    <UButton
      type="submit"
      :loading="loading"
      icon="i-lucide-plus"
      label="加入同学录"
      size="sm"
      class="mt-3"
    />
  </form>
</template>
