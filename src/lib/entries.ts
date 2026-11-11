import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;

/** All published entries (drafts are never built), newest first. */
export async function getEntries(filter?: (e: Entry) => boolean): Promise<Entry[]> {
  const all = await getCollection('entries', (e) => !e.data.draft);
  return all
    .filter((e) => (filter ? filter(e) : true))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const hasTag = (e: Entry, ...tags: string[]) => tags.some((t) => e.data.tags.includes(t));
