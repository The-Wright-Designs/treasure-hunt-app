# August 2026 — Development Plan (10h budget)

## Context

July 2026 delivered 9 commits across 5 working days (27–31 July) and closed out the **core gameplay loop**:

| Commit | What landed |
|---|---|
| `d817561` | Admin page, `(admin)` route group, hunt create form, open/close cron routes, `vercel.json` schedules |
| `2274f08` | Admin form tightened — Monday-only starts, derived deadlines, map/circle inputs, `select-input` |
| `86e7424` | Hunt-closed email template + `send-hunt-closed-email` action |
| `aed8a8f` | Email retry mechanism — `hunt-notify.ts`, `notifiedAt` idempotency stamp, `hunt-attention-list`, manual close button |
| `332be81` | Announcements CRUD — migrated from static JSON to Firestore with admin UI |
| `547f272` / `880306e` / `ad6ed48` | Email verification onboarding, reset-on-email-change, rate-limit fix |
| `9ccf8f3` | **Join hunt + entry code** — `joinHunt`, `submitHuntEntry`, `hunt-entry-form`, `join-hunt-button` |

The loop now works end to end: join → see clues + map → find the item → submit the hunt-wide entry code → land in `completedBy` → cron closes the hunt, picks a random winner, emails the owner. Achievements reads real Firestore data.

**So the feature question is answered. This month's question is different: does a teenager standing in a Plett car park on one bar of 3G actually succeed with this app?**

Three things break that today:
1. She opens the map and cannot tell whether she is inside the orange search circle.
2. She taps a page and gets a white screen while Firestore round-trips — and an unrecoverable one if it throws.
3. The share button, one of four primary tab-bar destinations, is `<Link href="#">` and does nothing.

This plan spends the month on the field experience, not on breadth.

**Decisions taken:** geolocation is the headline item and gets ~3h. The placeholder emergency numbers on `/contact` are being **left as-is for now** at your direction — noted in Deferred below.

---

## The work, in order

### 1. Live user position on the hunt map — 3h ✅ DONE

The hunt already stores a search circle (`circleLatitude/Longitude/Radius`, radius validated 1–5000 m in `createHunt`). That circle is the entire spatial contract with the hunter, and she currently cannot locate herself against it. `@react-google-maps/api` and `@types/google.maps` are already installed, and the map already manages the circle imperatively via a ref — so this is additive, not a rewrite.

**File:** [google-map.tsx](_components/ui/google-map.tsx), called from [active-hunt/page.tsx](app/(dashboard)/active-hunt/page.tsx)

- Add an opt-in `showUserLocation?: boolean` prop; pass it only from the active-hunt page so no other caller changes behaviour.
- Add a second `map`-gated `useEffect` calling `navigator.geolocation.watchPosition` with `{ enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }`. Store the watch id in a ref; clear it in the effect cleanup **and** in the existing `onUnmount` callback.
- Render the hunter as a second imperative overlay held in a ref, **mirroring the existing `circleRef` pattern exactly**: a small teal (`#4B9DA9`) `google.maps.Circle` for the dot, plus a larger translucent one whose radius is `position.coords.accuracy`. Deliberately reuse `google.maps.Circle` rather than `AdvancedMarkerElement` — zero new import surface, and identical cleanup semantics to the code already in the file.
- Handle all three failure states with a status string rendered as a `<p>` under the map: permission denied ("Turn on location in your browser settings to see where you are on the map"), position unavailable, timeout. Teens deny the prompt by accident constantly; a dead map with no explanation is worse than no feature.
- ~~**Pan once on the first fix, then never again.**~~ **Changed during implementation:** auto-pan removed entirely. The map now stays centred on the hunt area and never moves on its own; two buttons under the map ("Hunt area" / "My location") let the hunter pan to either on demand. "My location" is disabled until a fix arrives.

**Stretch — NOT done, deliberately deferred.** Distance readout via `google.maps.geometry.spherical.computeDistanceBetween` — "You're 240 m from the search area" / "You're inside the search area". Requires adding `"geometry"` to the `libraries` array; note it is declared module-level as `const libraries: never[] = []` specifically so the array identity stays stable across renders — change the type, keep it module-level, or `useJsApiLoader` will thrash.

**Risk:** geolocation requires HTTPS. Fine on Vercel and `localhost`, broken over a LAN IP on plain HTTP. Budget for `next dev --experimental-https` or a tunnel — and test on a **real handset**, since desktop Chrome's geolocation is a lie.

### 2. Route-level loading and error boundaries — 1.5h ✅ DONE

There is currently no `loading.tsx`, `error.tsx`, `not-found.tsx`, or `global-error.tsx` anywhere in [app/](app/). Every dashboard page is an async server component doing a blocking Firestore round-trip. This is the cheapest reliability-per-hour item on the board and targets the outdoor-bad-signal case directly.

- `app/(dashboard)/loading.tsx` — one shared route-group loading UI. `globals.css` already ships an unused `.spinner` / `.spinner-black` utility; this is what it was written for. Wrap in [page-wrapper.tsx](_lib/utils/page-wrapper.tsx) so it matches page padding and avoids layout shift.
- `app/(dashboard)/error.tsx` — `"use client"`, takes `{ error, reset }`, plain apology plus a `ButtonType` wired to `reset()`. **Do not render `error.message`** — Firestore and server-action errors leak internals and a teen can't act on them.
- `app/global-error.tsx` — minimal, renders its own `<html>`/`<body>`.
- `app/not-found.tsx` — short, with a `ButtonLink` back to `/dashboard`.

**Do this alongside or before item 1**, not after: geolocation adds a new client-side failure mode to the active-hunt page, and the boundary makes that safer to ship.

### 3. Working WhatsApp share + real OG image — 1h — ✅ DONE

The share button has a whole context provider ([share-modal-context.tsx](_context/share-modal-context.tsx)) and modal behind it, is wired through [footer-component.tsx](_components/navigation/footer-component.tsx), and terminates in `href="#"`. It is 25% of the primary navigation doing nothing. For a teen-to-teen app in one small town, WhatsApp sharing *is* the growth mechanism.

- [share-modal.tsx](_components/ui/share-modal.tsx) — replace `href="#"` with `https://wa.me/?text=${encodeURIComponent(...)}` carrying the site URL plus a line of hook copy. Add `target="_blank" rel="noopener noreferrer"`.
- [app/layout.tsx](app/layout.tsx) references `/open-graph-image.webp`, which **does not exist** — `public/` holds only `whatsapp.svg`, two sponsor logos and one logo PNG. A WhatsApp share with a broken OG image renders as a grey box, which visibly kills the share. Prefer `app/opengraph-image.tsx` using Next's `ImageResponse`, generated from the existing logo and brand tokens, then drop the manual `images` entry from the metadata object. Self-maintaining, no design round-trip.

These two ship as one unit — the share button without a working preview is half a feature.

### 4. Rate-limit `submitHuntEntry` — 1h — ✅ DONE

There is a single hunt-wide `entryCode` and unlimited guesses in [active-hunt-actions.ts](_actions/active-hunt-actions.ts). The rules text on the active-hunt page threatens disqualification for code-sharing — the code's secrecy is load-bearing for fairness — while the action lets any joined participant brute-force it. Codes like `TEAL-4471` are short.

- Track attempts in a separate `huntAttempts/{huntId}_{uid}` doc as `{ count, windowStart }`. **Do not** put a per-user map on the hunt doc — `submitHuntEntry` already does read-then-`update` with no transaction, and that would turn a hot document into a contention point.
- Increment on **failed code match only**, before returning "That code isn't right". Allow ~10 attempts/hour, then a friendly cooldown message. Don't count session-expiry, already-entered, or not-joined rejections.
- No existing rate-limit utility to copy — July's `ad6ed48` fix was purely client-side in `verify-email-banner.tsx`. This is a genuinely new server-side pattern, hence the full hour.

While in this file: confirm the `await new Promise(r => setTimeout(r, 1000))` in `joinHunt` is an intentional UX beat and not leftover debug code. `join-hunt-button.tsx` has no `useFormStatus` pending state, so the button currently looks broken for that full second — add pending state either way (~10 min).

### 5. De-hardcode the prize amount — 30min — ⬜ NOT STARTED

`prizeAmount = 500` is hardcoded in [admin-actions.ts:222](_actions/admin-actions.ts#L222) even though `Hunt` stores it per-hunt and every view type already carries it. "R500" is also hardcoded twice in prose in [active-hunt/page.tsx](app/(dashboard)/active-hunt/page.tsx) — at line ~27 and in rule 9 — on a page where `activeHunt.prizeAmount` is in scope. The day a sponsor funds an R1000 hunt, the app shows R500 to every hunter with no way to fix it.

Add a `prizeAmount` field to [hunt-form.tsx](_components/admin/hunt-form.tsx), validate in `createHunt` (positive integer, sane ceiling), and interpolate `activeHunt.prizeAmount` into both prose strings. `HuntCard` already receives the prop and is already correct.

### 6. Drive-by cleanups — 15min — ⬜ NOT STARTED

- Delete the dead `heroSlider` key from [general-data.json](_data/general-data.json) — nothing imports it and the referenced images don't exist.
- Add `"typecheck": "tsc --noEmit"` to `package.json` scripts. Type errors currently only surface during `next build`.
- ~~Correct `CLAUDE.md` re: announcements location.~~ **Stale — no action needed.** `CLAUDE.md:29` already states announcements live in Firestore, not `general-data.json`.

### 7. PWA manifest + icons — 1h, only if 1–6 are genuinely done — ⬜ NOT STARTED

A mobile-first app with a fixed bottom tab bar that can't be installed to a home screen leaves its most natural retention mechanic on the table. `app/manifest.ts` (`display: "standalone"`, `theme_color: "#E37434"`, `background_color: "#FFFFFF"`, `start_url: "/dashboard"`) plus `app/icon.png` and `app/apple-icon.png` derived from the existing logo. Next's file conventions handle the `<link>` tags.

Last because it's a second-session-onward benefit, not a tonight's-hunt benefit. **A half-finished manifest with missing icon sizes is worse than none.**

---

## Budget

| # | Item | Est. | Status |
|---|------|------|--------|
| 1 | Geolocation on hunt map | 3h | ✅ Done |
| 2 | loading / error / not-found boundaries | 1.5h | ✅ Done |
| 3 | WhatsApp share + OG image | 1h | ✅ Done |
| 4 | Rate-limit `submitHuntEntry` (+ join button pending state) | 1h | ⬜ |
| 5 | Per-hunt prize amount | 0.5h | ⬜ |
| 6 | Drive-by cleanups | 0.25h | ⬜ |
| 7 | PWA manifest + icons | 1h | ⬜ |
| | **Total** | **8.25h** | **4.5h done / 3.75h left** |

~1.75h slack held back deliberately. Geolocation has real HTTPS/device-testing risk and is the item most likely to overrun. **If it does, cut item 7 first, then item 5. Never cut 1 or 2.**

---

## Deferred, and why

**Emergency contact numbers on `/contact`.** Three entries in [general-data.json](_data/general-data.json) are sequential-digit placeholders — "Child care protection unit" and "Child Psychologist (Dr. Jane Franks)" both `044 123 4567`, "Cyber bullying unit" `083 123 4567`. Per your instruction these stay as-is this month. Flagging once for the record: the app's own safety-tips copy tells teens to contact a trusted adult, and this page is where they'd look. It's a 15-minute JSON edit whenever you have real numbers — worth putting at the top of September.

**Admin hunt edit/delete + participant list.** The biggest remaining feature hole and the natural September headline: multiple new server actions, new view types, new admin components, destructive-action confirmation UI, and delete semantics that must reckon with `participants`/`completedBy` on a live hunt. Realistically 3–4h alone, which would eat geolocation. The workaround already works — [firestore-console-url.ts](_lib/utils/firestore-console-url.ts) deep-links to the raw doc, and `resolveParticipants()` in [hunt-notify.ts](_lib/utils/hunt-notify.ts) already does the uid→user resolution a participant view needs. Scope it properly rather than squeezing it into a corner.

**Unpinning the five `latest` deps** (`classnames`, `lucide-react`, `nodemailer`, `react-google-recaptcha-v3`, `swiper`). Real supply-chain and reproducibility risk, but pinning means lockfile churn plus a full regression pass. A surprise Swiper major landing mid-month would be a bad way to lose the geolocation budget. Schedule as the **first** item of a month, never the last. Top September hygiene candidate.

**Per-page metadata exports.** The whole app is behind a session-cookie wall; `(dashboard)` and `(admin)` layouts redirect unauthenticated users. No crawler sees those pages, so per-page titles buy little beyond tab labels.

**Tests / CI.** A test suite is a multi-month commitment and shouldn't be started with 30 spare minutes. The `typecheck` script in item 6 is the cheap 80%.

**Offline/service-worker caching.** Genuinely valuable for outdoor use, but a real architectural piece — every page is an RSC requiring a live Firestore round-trip. Item 2's boundaries make failure *graceful*; true offline is a separate project.

---

## Verification

- `npx tsc --noEmit` clean. ✅
- `npm run build` succeeds. ✅
- `npm run lint` — ⚠️ **cannot pass clean.** 3 pre-existing errors in `functions/lib/index.js` (a checked-in build artifact, `require()` style imports) plus 1 unused-import warning in `profile/page.tsx`. Both predate this month's work and are outside every item's scope; either gitignore/eslintignore the artifact or fix separately.
- **Geolocation** — partially verified. ✅ Confirmed working in the iOS Simulator (custom location) and in Chrome on desktop: dot renders, tracks position, and the map stays put. Updated for the design change: confirm the map does **not** auto-pan, and that the "Hunt area" / "My location" buttons each pan correctly, with "My location" disabled until a fix arrives.
  - ⬜ **Still outstanding: test on a real handset over HTTPS.** Desktop/simulator positions come from WiFi/IP or are synthetic, so the core question — does the dot sit correctly inside vs outside the orange circle, and does the accuracy ring scale sensibly — is still unproven. Also still to check: deny the permission prompt and confirm the explanatory message renders instead of a dead map; navigate away and back and confirm no `watchPosition` leak.
- **Boundaries:** ⬜ still to verify at runtime — temporarily throw in `getActiveHunt()` to confirm `error.tsx` renders with a working retry; hit a bad URL for `not-found.tsx`; throttle to Slow 3G in devtools to confirm the spinner appears on navigation. (Files are written and compile; behaviour not yet exercised.)
- **Share:** open the share modal on a phone, tap WhatsApp, confirm it opens with prefilled text and that the pasted link previews with a real OG image (test with the WhatsApp link preview or an OG debugger).
- **Rate limit:** submit a wrong entry code 11 times, confirm the cooldown message; confirm a correct code still works within the window and that already-entered/not-joined rejections don't consume attempts.
- **Prize:** create a hunt with a non-500 prize in admin, confirm the active-hunt page prose and card both show the new value.
- Kill any dev server started during this work.
