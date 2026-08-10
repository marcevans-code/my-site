import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Community Blog posts. Files land here automatically — the
// powergrabtx-forms-worker Cloudflare Worker commits a new Markdown
// file into this folder via the GitHub API whenever Marc approves a
// submission from the moderation review page. Astro (and Cloudflare
// Pages' build) picks them up on the next deploy with no other changes
// needed here.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("Community Submission"),
    summary: z.string().optional(),
  }),
});

export const collections = { blog };
