import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(['project', 'writing', 'note', 'media', 'document']).default('note'),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    cover: z.string().optional(),
    // Free downloads: files placed in public/files/
    files: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    // Approval-required downloads. The real link is NOT stored in the repo;
    // the admin page maps `id` -> share link at runtime.
    locked: z
      .array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries };
