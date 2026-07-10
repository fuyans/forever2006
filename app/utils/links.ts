import type { NavigationMenuItem } from '@nuxt/ui'

export const navLinks: NavigationMenuItem[] = [{
  label: '首页',
  icon: 'i-lucide-clock',
  to: '/'
}, {
  label: '相册',
  icon: 'i-lucide-images',
  to: '/album'
}, {
  label: '同学录',
  icon: 'i-lucide-users',
  to: '/people'
}, {
  label: '留言簿',
  icon: 'i-lucide-message-circle',
  to: '/guestbook'
}]
