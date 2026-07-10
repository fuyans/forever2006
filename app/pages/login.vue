<script setup lang="ts">
definePageMeta({
  layout: false
})

const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const route = useRoute()
const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' ? r : '/'
})

async function submit() {
  if (!password.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value }
    })
    window.location.href = redirect.value
  } catch (e: unknown) {
    errorMsg.value = (e as { statusMessage?: string })?.statusMessage || '密码错误'
    password.value = ''
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: '登录 — 求实中学东校 2006届一班'
})
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-gradient-to-b from-amber-50/80 via-stone-50 to-stone-100 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900 p-6">
    <div class="w-full max-w-sm">
      <!-- Slow reveal -->
      <Motion
        :initial="{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(16px)' }"
        :animate="{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }"
        :transition="{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }"
      >
        <!-- Decorative line -->
        <div
          class="mx-auto mb-8 w-12 h-px bg-primary/40"
          aria-hidden="true"
        />

        <!-- Title -->
        <h1 class="text-center font-serif text-3xl sm:text-4xl font-medium text-highlighted leading-tight tracking-tight">
          求实中学 东校
          <span class="block text-primary">2006 届 一班</span>
        </h1>

        <!-- Subtitle badge -->
        <p class="mt-4 text-center">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary/80">
            二十周年 · 2003 — 2006
          </span>
        </p>

        <!-- Password input -->
        <form
          class="mt-10"
          @submit.prevent="submit"
        >
          <div class="relative">
            <input
              v-model="password"
              type="password"
              placeholder="输入密码"
              maxlength="64"
              class="peer w-full border-b border-default bg-transparent py-3 text-center text-lg text-highlighted placeholder:text-muted/40 outline-none transition-colors focus:border-primary"
              autofocus
              @keydown.enter="submit"
            >
            <!-- Underline extension on focus -->
            <span
              class="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-primary transition-all duration-500 peer-focus:w-full"
              aria-hidden="true"
            />
          </div>

          <!-- Error -->
          <p
            v-if="errorMsg"
            class="mt-4 text-center text-sm text-error"
          >
            {{ errorMsg }}
          </p>

          <!-- Submit -->
          <div class="mt-8 text-center">
            <UButton
              :loading="loading"
              size="lg"
              class="px-8"
              label="进入"
              @click="submit"
            />
          </div>
        </form>

        <!-- Footer hint -->
        <p class="mt-10 text-center text-xs text-muted/50">
          没有密码？在同学群里问一下。
        </p>
      </Motion>
    </div>
  </div>
</template>
