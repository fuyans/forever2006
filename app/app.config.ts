export default defineAppConfig({
  global: {
    // Reunion-specific settings. Swap the picture for a real class photo when
    // ready (light + dark variants).
    picture: {
      dark: '/photos/placeholder-1.svg',
      light: '/photos/placeholder-1.svg',
      alt: '求实中学东校 2006届一班'
    }
  },
  ui: {
    colors: {
      // Warm amber primary for a nostalgic feel. Change freely.
      primary: 'amber',
      neutral: 'stone'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    credits: `开封 · 求实中学东校 · 一班 · 2006届`,
    colorMode: false,
    links: [] as Array<Record<string, unknown>>
  }
})
