# Wirkungsticker: hidden cards and pagination

Date: 2026-09-08

## Confirmed defect

The mixed overview uses `data-news-card` and the `hidden` property for both
news and editorial analysis cards. The stylesheet only hid `.news-card[hidden]`.
The author's `.news-editorial-card { display: grid }` therefore overrode the
browser's default hidden behavior. On the inspected live revision, 31 cards
were displayed instead of 10: 21 extra editorial cards were marked hidden but
still visible. This also affected search and topic filters.

## Scoped correction

- Apply `display: none` to `[data-news-card][hidden]` for all card variants.
- Bump the generated public asset revision to `20260908-visibility1` so the
  installed app requests the corrected CSS, not an exact old cached revision.
- Keep the existing mixed reading order, ten-card page size and navigation.
- No changes to article content, case membership, histories, source activation,
  collection schedules, AI generation or budget settings.

## Verification before release

- New regression test failed on the old CSS and passed after correction.
- Four new tests cover the shared visibility contract, pagination, search with
  no matches, and topic changes resetting pagination for both card types.
- `npm run news:test`: 633 passed, zero failed.
- `npm run news:build`: successful; `npm run news:validate`: successful.
- `npm run typecheck`: successful.
- `npm run lint`: exited successfully; the existing site-wide audit still
  reports 25 visible findings. This patch does not change reader copy.
- Real browser, local desktop: initially 10 visible cards, 20 after load-more,
  no hidden-but-displayed cards, no mismatched visible cards in the economic
  topic, and zero cards for a search without results.
- Mobile viewport 390 x 844: 10 visible cards, one editorial analysis in the
  first page, zero hidden-but-displayed cards, no document-width overflow.
- Opening an analysis from the overview works, with no recorded browser
  errors and no horizontal overflow at 390 pixels.

## Publication

Use the existing serial GitHub Pages ticker release and its public-artifact
checks. No Vercel build and no paid news analysis are required. Verify the
live CSS revision, ten-card pagination, search, topic filter and detail link
after deployment. Story-consolidation candidates remain a separate change.
