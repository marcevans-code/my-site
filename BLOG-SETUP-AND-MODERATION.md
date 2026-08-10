# Power Grab TX Community Blog — Setup & Moderation Guide

## What was built

A new **Community Blog** section where site visitors can submit posts, and nothing goes
live until you personally approve it.

- `/blog` — public list of published posts (starts with one welcome post)
- `/blog/[slug]` — individual post pages
- `/blog/submit` — public submission form (name optional/anonymous, email private, title + body required)
- A moderation queue built into your existing `powergrabtx-forms-worker` Cloudflare Worker —
  no new services, no database, no admin login page to build or maintain.

### How a submission flows

1. Someone fills out `/blog/submit`. The form posts to your Worker, which checks the
   honeypot field, verifies Turnstile, and rate-limits by IP (max 3 submissions per 10
   minutes per visitor) — the same anti-spam pattern your contact form already uses.
2. The full submission is stored in a new KV namespace (`BLOG_SUBMISSIONS_KV`) for 60 days,
   tagged with a random one-time review token.
3. You get an emailed notification with the title, a short preview, and a **private review
   link**.
4. Clicking the link opens a page (served by the Worker, not the public site) showing the
   full post text and two buttons: **Approve & Publish** and **Reject**.
   - The link itself only *reads* the submission (safe for email security scanners that
     "click" links automatically) — nothing is published or discarded until you actually
     press a button on that page.
5. **Approve** → the Worker commits a new Markdown file straight to the `my-site` GitHub
   repo (`src/content/blog/`) via the GitHub API. Cloudflare Pages sees the new commit on
   `main` and rebuilds automatically, same as any other push. The post is live at
   `powergrabtx.com/blog/<slug>` about a minute later.
   **Reject** → the submission is deleted from KV. Nothing is published, no trace left on
   the site.
6. If you do nothing, the submission simply expires out of KV after 60 days.

### Day-to-day moderation

You don't need to log into anything to moderate — just watch your `marc@powergrabtx.com`
inbox for "New blog submission: ..." emails and click through. If you ever want to see
what's still sitting unreviewed, you can list it from KV (see "Useful commands" below).

To edit or take down a post after it's published, edit or delete its file in
`src/content/blog/` in the `my-site` repo and push — same workflow as any other content
change on the site.

---

## One-time setup (you need to do these — they require your own Cloudflare/GitHub logins)

Run these from a real Terminal window on your Mac (not through any bridge), in the
`powergrabtx-forms-worker` folder, the same way you already deploy that Worker.

### 1. Create the new KV namespace

```
cd ~/powergrabtx-forms-worker
npx wrangler kv namespace create BLOG_SUBMISSIONS_KV
```

This prints an `id`. Open `wrangler.jsonc` and replace
`REPLACE_WITH_NEW_KV_NAMESPACE_ID` with that id (I've already added the binding entry —
you just need to swap in the real id).

### 2. Create a GitHub token so the Worker can publish approved posts

The Worker needs permission to commit files into your `my-site` repo. Use a
**fine-grained personal access token** scoped to just that one repo:

1. Go to https://github.com/settings/personal-access-tokens/new
2. **Resource owner:** `marcevans-code`
3. **Repository access:** "Only select repositories" → choose `my-site`
4. **Permissions:** under "Repository permissions," set **Contents** to **Read and write**
   (leave everything else at "No access")
5. Set an expiration you're comfortable with (you'll get a GitHub email reminder before it
   expires, and can generate a fresh one anytime)
6. Generate the token and copy it — GitHub only shows it once

### 3. Add the secrets to the Worker

```
cd ~/powergrabtx-forms-worker
npx wrangler secret put GITHUB_TOKEN
```

Paste the token from step 2 when prompted. (Your existing `TURNSTILE_SECRET_KEY` and
`ZOHO_APP_PASSWORD` secrets are reused as-is — nothing to redo there.)

### 4. Deploy the Worker

```
npx wrangler deploy
```

### 5. Add the Turnstile widget to the new form's allowed domains (if needed)

The submit form reuses your existing Turnstile site key
(`0x4AAAAAADwCpEAeGLLtdeFU`), so if that key is already scoped to `powergrabtx.com` in
your Cloudflare dashboard, there's nothing to do here.

### 6. Push the Astro changes and let Cloudflare Pages build

```
cd ~/my-site
git add -A
git commit -m "Add community blog with moderation queue"
git push
```

Cloudflare Pages will pick this up automatically like any other push. Once it's live,
visit `/blog` and `/blog/submit` to confirm they render.

---

## Testing it end-to-end

1. Visit `https://powergrabtx.com/blog/submit` and submit a test post.
2. You should land on the `/thank-you` page, and an email should arrive within a few
   seconds with a review link.
3. Click the review link, read the test post, click **Approve & Publish**.
4. Wait about a minute, then check `https://powergrabtx.com/blog/` — your test post
   should appear. Then delete its file from `src/content/blog/` in GitHub (or locally +
   push) to remove the test content.
5. Submit a second test post and click **Reject** instead, to confirm rejected posts never
   appear anywhere.

## Useful commands

List everything currently sitting in the moderation queue:

```
npx wrangler kv key list --binding=BLOG_SUBMISSIONS_KV --remote
```

Read one submission's full content by key (useful if an email notification gets lost):

```
npx wrangler kv key get "sub:<id>" --binding=BLOG_SUBMISSIONS_KV --remote
```

## Notes / things worth knowing

- **Cost:** everything here runs on free tiers — Cloudflare Pages, Workers, KV, and
  Turnstile, plus GitHub's API. There's nothing new to pay for.
- **Spam defense:** honeypot field + Turnstile + per-IP rate limit, same as your existing
  forms. If spam becomes a problem later, the rate limit (currently 3 submissions per 10
  minutes per IP) is the first knob to tighten.
- **Submitter emails are never published** — they're only visible to you, in the
  notification email and the review page, so you can follow up with someone if needed.
- **No new login or admin dashboard** — moderation happens entirely through the emailed
  review link, so there's nothing extra to secure or remember a password for. The review
  link's security comes from a 256-bit random token that's only ever sent to your inbox.
- Renaming the section (e.g. "Community Voices" instead of "Blog") just means editing the
  page titles/headings and, if you want the URL to change too, renaming the
  `src/pages/blog` folder — happy to do that if you'd rather it be called something else.

---

# Comments

Every blog post now has a comments section underneath it. Comments post live immediately
after passing automated checks — you don't approve each one — but you get pulled in
automatically if something's actually a problem, and you can browse/delete anything,
anytime, from one page.

## How it works

1. A reader fills out the comment form at the bottom of a post. It's checked with the same
   Turnstile + honeypot + rate limit pattern as everything else, then run through a simple
   keyword/spam filter.
2. **Passes the filter** → posts immediately, visible to everyone right away.
3. **Trips the filter** (spam keywords, multiple links, profanity) → held, not shown
   publicly, and you get an email with a review link — same one-click-link style as blog
   post approval, with **Publish** and **Delete** buttons.
4. **Any reader can click "Report"** under any comment. That doesn't hide it, but it
   immediately emails you a review link with a **Delete** button, so you can pull it if it's
   genuinely a problem.
5. **You can also just browse everything, anytime** at a private admin URL (see setup below)
   — every comment across every post, newest first, each with its own Delete button. No
   approval required to check it, and nothing is required of you regularly — it's there for
   whenever you want to skim.

Nothing here required changing how blog post moderation works — that's untouched.

## One-time setup

### 1. Create the comments KV namespace

```
cd ~/powergrabtx-forms-worker
npx wrangler kv namespace create COMMENTS_KV
```

Same as before — say yes when it offers to fill in the id for you.

### 2. Set the admin key

This is the "password" for your private browse-all-comments page. I generated one for you
already, so there's no website signup for this step — just run this one line, typed by hand
(not copied, to avoid the clipboard issue from earlier):

```
npx wrangler secret put ADMIN_KEY <<< "3ff54f7f32cd7d91bd10aff4493136c284b36c77a3777f59bdf5c00f846afd06"
```

### 3. Deploy

```
npx wrangler deploy
```

### 4. Push the Astro changes

```
cd ~/my-site
git pull
git add .
git commit -m "Add comments to blog posts"
git push origin main
```

## Your private comments page

Bookmark this — it's the one URL that shows you every comment on the site with a Delete
button next to each:

```
https://forms-worker.marc-897.workers.dev/comments/admin?key=3ff54f7f32cd7d91bd10aff4493136c284b36c77a3777f59bdf5c00f846afd06
```

Treat that link like a password — anyone with it can delete comments. Don't post it
publicly or forward it. If it ever leaks, generate a new random value (ask me, or run
`openssl rand -hex 32` yourself) and redo step 2 above with the new value.

## Testing it end-to-end

1. Visit a published post (e.g. `/blog/welcome-to-the-community-blog`) and post a test
   comment. It should appear immediately below the form.
2. Click **Report** on it. You should get an email within a few seconds with a review
   link — open it and click **Delete**, then refresh the post page to confirm it's gone.
3. Post another test comment containing an obvious spam word (e.g. "viagra") — it should
   *not* appear on the page, and you should get a "held for review" email instead. Open
   that link and try **Publish & Show Comment**, then check it now appears on the post.
4. Visit your admin browse page (above) and confirm you can see all your test comments
   there, and that Delete works from that page too.
5. Clean up any test comments when you're done.

## Notes

- The spam/profanity filter is a short, plain-English word list living in
  `powergrabtx-forms-worker/src/comments.js` (the `BLOCKED_WORDS` array near the top) — easy
  to add words to later if something keeps slipping through.
- Comments don't rebuild the site or touch GitHub at all — they live entirely in the
  `COMMENTS_KV` namespace and load into the page live via a small script, which is why they
  show up instantly instead of waiting on a Cloudflare Pages build.
- This is currently only wired into `/blog/*` posts, not the `/posts/*` articles — let me
  know if you'd like those to have comments too.
