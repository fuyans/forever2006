import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Shared, reusable schema fragments -------------------------------------------

const createImageSchema = () => z.object({
  src: z.string().editor({ input: 'media' }),
  alt: z.string().optional()
})

const createButtonSchema = () => z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string().optional(),
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
  target: z.enum(['_blank', '_self']).optional()
})

export default defineContentConfig({
  collections: {
    // The landing page hero + intro text.
    index: defineCollection({
      type: 'page',
      source: 'index.yml',
      schema: z.object({
        hero: z.object({
          links: z.array(createButtonSchema()).optional(),
          images: z.array(createImageSchema()).optional()
        }),
        intro: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),

    // Memories are defined as folders under content/memories/. Each folder is
    // one timeline event/album. The folder contains an index.md with YAML
    // frontmatter and image files. Non-programmers can just drop files in.
    memories: defineCollection({
      type: 'page',
      source: 'memories/*/index.md',
      schema: z.object({
        title: z.string().nonempty(),
        period: z.string(),
        category: z.enum(['milestone', 'event', 'memory', 'trip', 'reunion']).optional()
      })
    }),

    // Page-config collections (title / description / links) for each route,
    // following the pattern the template already used for projects/blog pages.
    timeline: defineCollection({
      type: 'page',
      source: 'timeline.yml',
      schema: z.object({
        links: z.array(createButtonSchema()).optional()
      })
    }),

    album: defineCollection({
      type: 'page',
      source: 'album.yml',
      schema: z.object({
        links: z.array(createButtonSchema()).optional()
      })
    }),

    guestbook: defineCollection({
      type: 'page',
      source: 'guestbook.yml',
      schema: z.object({
        links: z.array(createButtonSchema()).optional()
      })
    }),

    people: defineCollection({
      type: 'page',
      source: 'people.yml',
      schema: z.object({
        links: z.array(createButtonSchema()).optional()
      })
    })
  }
})
