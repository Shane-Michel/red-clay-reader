# Red Clay Reader — One-Page Project Brief

## Overview

**Red Clay Reader** is a fast, beautiful, fully in-site reader for **public-domain books**, powered by Open Library (catalog/search/covers) and Internet Archive BookReader (embedded reading experience). Southern-modern vibe; zero-friction access across desktop/TV/phone.

## Goals

* Frictionless **search → open → read** flow (no login required).
* Embed **public-domain** editions on your domain.
* “**Continue reading**” across sessions (local; optional account later).
* Curated **Shelves** (e.g., Georgia Authors, Southern Cooking, Small Biz Classics).

## Non-Goals

* No hosting of copyrighted texts or DRM.
* No full social network; keep features light (favorites, simple lists first).

## Audience

Casual readers and students who want instant access to classics, plus your local/curated flavor.

## Brand

* Name: **Red Clay Reader**
* Tone: Warm, Southern, uncluttered.
* Attribution: “Data & reader courtesy of Open Library / Internet Archive.”

## Stack

* **Frontend:** React + Tailwind (responsive for TV/desktop/phone).
* **Reader:** Internet Archive **BookReader** (iframe).
* **Data:** Open Library **Search / Works / Editions / Covers** APIs.
* **Backend:** PHP 7.4 thin proxy + caching (A2 Hosting).
* **DB:** MySQL (optional for accounts, shelves, progress).

## Core Flows

1. **Search/Explore** → Results grid (cover, title, author, year).
2. **Book Detail** → Resolve IA identifier; show **Read** CTA.
3. **Reader** `/read/<edition-olid>#page=###` → Embedded BookReader; auto-bookmark page.
4. **Continue Reading** banner on return; **QR handoff** from desktop to phone.

## Milestones

### Phase 1 — MVP (Public Domain Reader)

* Search & filters (title/author/subject/language).
* Book detail with cover, metadata, and **Read** CTA.
* Reader route with IA BookReader iframe (public-domain only).
* Local “last page read” (per title) + basic **Continue** CTA.
* Basic Shelves (curated lists; static config or simple JSON).
* PHP proxy for OL/IA + simple response caching.
* Footer attribution & PD-only guard rails (fallback link for non-PD).

### Phase 2 — Quality & Depth

* MySQL persistence for **favorites**, **reading progress**, and **shelves** (per user).
* Lightweight accounts (email-magic link or simple username/PIN).
* Reading **streaks** & minutes-read stats.
* Better error states (no IA id, restricted, image-only scan warnings).
* Accessibility polish (keyboard shortcuts sending `postMessage` to iframe; contrast mode).

### Phase 3 — Curation & “Read Together”

* Themed landing pages (e.g., “Peachtree Classics,” “BBQ & Southern Cooking”).
* “Read Together” TV mode (large display chrome; phone as remote for page turns).
* Public shelf sharing (slug URLs) + simple SEO summaries.
* Optional import/export shelf JSON.

## API Touchpoints (reference)

* **Search:** `/search.json?q=&author=&subject=&language=&limit=&offset=`
* **Works/Editions:** `/works/<OLID>.json`, `/books/<OLID>.json` (resolve IA id)
* **Books (preview):** `/api/books?bibkeys=OLID:<OLID>&format=json&jscmd=data`
* **Covers:** `https://covers.openlibrary.org/b/olid/<OLID>-M.jpg`

## Data Model (minimal)

* `users(id, email, created_at)` *(Phase 2+)*
* `shelves(id, slug, title, description, created_at)`
* `shelf_items(id, shelf_id, work_olid, edition_olid, ia_id, position)`
* `user_favorites(user_id, edition_olid)`
* `reading_progress(user_id, edition_olid, ia_id, page, updated_at)`

## Compliance

* **Inline read = public domain only.**
* For non-PD/loan items, **deep-link** to Open Library borrow page.
* Display attribution to Open Library / Internet Archive on detail & reader pages.

## UX Guidelines

* Keep chrome minimal above the iframe (title, author, page, Continue).
* Show QR for “Continue on phone” with current page in URL hash.
* Use Covers API for fast, stable thumbnails.
* Clean routes:

  * `/books/<work-olid>` (detail)
  * `/read/<edition-olid>#page=###` (reader)
  * `/lists/<slug>` (curated shelves)

## Performance & Ops

* Cache popular search queries on the PHP proxy (keyed by params).
* Lazy-load covers; prefetch reader route shell.
* Simple uptime log (proxy response times, IA failures).

## Success Metrics

* Time to first readable page (<2s perceived).
* % of sessions that trigger **Continue reading**.
* Books opened per session; completion rate per shelf.
* Error rate on reader loads (no IA id / restricted).

## Risks & Mitigations

* **Missing IA ids** → Fallback link to Open Library page.
* **Scan quality varies** → Badge scans with “text layer” vs “image only.”
* **API rate limits** → Add proxy cache; backoff and serve cached results.

## Launch Checklist

* Curate 3 starter shelves (12–24 titles each).
* Verify embed works for all shelf titles.
* Add attribution + PD notice.
* Test reader on TV (Chromecast/Fire/Smart TV browser) and phones.
* Lighthouse pass (performance/accessibility/SEO).