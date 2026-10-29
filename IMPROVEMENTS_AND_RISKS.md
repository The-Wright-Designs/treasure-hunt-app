# Treasure Hunt App: Improvements and Risks

A review of the whole codebase as of 28 October 2026, covering the Next.js app, the server actions, the Firebase Functions, the Firestore rules and the project configuration. It lists what should be improved and what could go wrong, now or later. `TREASURE_HUNT_APP_CONTEXT.md` describes how the app works; this document only covers what to change.

Each item has a priority:

- **P0**: fix before the next deploy or before launch.
- **P1**: fix soon; a real problem that will bite within months.
- **P2**: worth doing; improves robustness, cost or maintainability.
- **P3**: nice to have.

---

## 1. Summary

The app is in good shape for its size. The design principle of "no client database access, everything through a session-checked server action" is applied consistently, `entryCode` never reaches a player, consent tokens are hashed at rest, email templates escape their inputs, and no secrets have ever been committed. The main findings are:

1. **Dependencies carry known critical advisories** (P0). `next@16.2.6` has twenty published advisories including remote code execution in the image optimiser and in `next/og`, which this app uses for its OpenGraph image. `nodemailer@8.0.7` and `firebase@12.15.0` also have high-severity advisories.
2. **The "no hunt queued" and "owner email failed" alerts almost certainly never fire** (P0). The `console.error` lines that are meant to trigger them run on Vercel, but the Cloud Monitoring metric only counts logs from the Cloud Run services that host the Firebase Functions.
3. **Registration is a five-step client-side sequence with no rollback** (P1). A failure after the Firebase user is created leaves an account that can neither finish registering nor register again.
4. **Core game logic is not transactional** (P1). The join, the entry, the wrong-guess counter and the device check all read then write, so concurrent requests can bypass them.
5. **Legal and compliance work is unfinished** (P0 for launch). Fifteen `[PLACEHOLDER]` gaps remain in the privacy policy and terms, and the app collects children's home addresses and school names it doesn't yet use.
6. **There is no CI, no automated test and no versioned Firestore index file** (P1). `npm run typecheck` fails on a fresh clone.

---

## 2. Security

### 2.1 Vulnerable dependencies (P0)

`npm audit --omit=dev` reports 21 vulnerabilities (1 critical, 12 high). The ones in direct dependencies:

| Package          | Installed | Fix available | Notable advisories                                                                                                                                                 |
| ---------------- | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next`           | 16.2.6    | 16.4.3        | RCE in `next/og` `ImageResponse` (used by `app/opengraph-image.tsx`), RCE in image optimisation with SVG and AVIF, Server Action DoS, SSRF in image optimisation, cache poisoning |
| `nodemailer`     | 8.0.7     | 10.2.1 (major) | CRLF header injection, recipient-domain validation bypasses, TLS validation flaw, several ReDoS                                                                   |
| `firebase`       | 12.15.0   | newer 12.x    | Via `@grpc/grpc-js`: unauthorised certificates reported as authorised                                                                                             |
| `firebase-admin` | 14.0.0    | 14.5.0        | Via `@google-cloud/storage` and `uuid`                                                                                                                             |

Actions:

- Upgrade `next` and `eslint-config-next` to 16.4.3 and redeploy. This is the one that matters most: the OpenGraph route is public and unauthenticated.
- Upgrade `nodemailer` to 10.x. The API used here (`createTransport`, `sendMail`) is unchanged. Bump `@types/nodemailer` to match.
- Run `npm update firebase firebase-admin` and re-run the audit.
- Add a monthly reminder or a Dependabot/Renovate config so this doesn't drift again. The `functions/` package needs the same treatment; it has its own lockfile.

### 2.2 Firebase Auth is reachable without the app's reCAPTCHA gate (P1)

reCAPTCHA is checked by `verifyAuthRecaptcha` before the client calls `createUserWithEmailAndPassword`, but nothing stops a script from calling the Firebase Auth REST API directly with the public API key and skipping that step. The reCAPTCHA gate therefore only slows down casual abuse. Options, cheapest first:

- Turn on **email enumeration protection** in the Firebase Auth console.
- Enable **Firebase App Check** with reCAPTCHA Enterprise for the Auth client, which makes Firebase itself reject calls that didn't come through the app.
- Move registration fully server-side (see 4.1), which also removes this gap because the server action can require a valid reCAPTCHA token before calling `adminAuth.createUser`.

Also in `_lib/verify-recaptcha.ts`:

- The response's `action` is not compared to the expected action, so a token minted for `forgot_password` is accepted for `login`. Pass the expected action in and check `data.action === expected`.
- The `hostname` field is not checked. Verify it matches `www.treasure-hunt-app.com` in production.
- The token is interpolated into the form body without `encodeURIComponent`. Use `URLSearchParams`.

### 2.3 Unvalidated fields on `createSession` (P1)

`createSession` in `_actions/auth-actions.ts` writes `phone` straight to Firestore with no validation and `name` from the ID token's `displayName`, which the client sets via `updateProfile` with no length limit. `saveProfile` validates the phone, so the two paths disagree. Apply the SA phone regex and a name length cap on the server in `createSession`, or better, move the whole registration server-side.

Related: `saveProfile` lets a teen change their email to anything, including the parent's email, which the registration form forbids. Re-apply the "must differ from parent email" rule on email change.

### 2.4 Admin accounts can win the prize (P1)

Admins are exempt from the consent check and can join and complete hunts like any player. They also see the entry code on `/admin`. Nothing stops an admin account from being drawn as the winner. Exclude accounts with the `admin` claim from `participants` and `completedBy`, or at least from `pickWinner`. This matters for the promotional-competition rules in section 6.

### 2.5 Google Maps API key exposure (P1, verify in console)

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is public by design. Make sure the key is restricted in Google Cloud to the `treasure-hunt-app.com` referrers and to the Maps JavaScript API only, with a daily quota cap, otherwise it can be lifted from the bundle and billed to the project.

### 2.6 One-click account deletion from an email link (P1)

On `/consent/[token]`, "Decline and delete account" submits immediately with no confirmation. A parent who mis-taps, or an email security product that renders pages and activates buttons, deletes the teen's account irreversibly. Add a confirm step like the one in `_components/ui/delete-account.tsx`. Consider making a decline mark the account `declined` and leave deletion to the 7-day sweep, so a mistake can be undone.

### 2.7 Smaller items (P2)

- `CRON_SECRET` is compared with `!==`. Use `crypto.timingSafeEqual` on equal-length buffers. Not exploitable in practice over the network, but cheap to fix.
- `getActiveHunt` returns `clues` and the circle coordinates to the client even before the player has joined. The page hides them, but they're in the RSC payload. Joining is free so this is cosmetic, unless a registration delay is added later (see `TO_DO.md`), at which point the clues should only be returned when `joined` is true.
- `revalidatePath` calls after a successful entry invalidate `/dashboard` and `/active-hunt` for everyone, which is fine at this scale but means every entry triggers re-renders for all players. Consider `revalidateTag` or just relying on dynamic rendering.
- The root layout's `keywords` metadata ("family fun", "team building", "geocaching") describes a different product. Trim it to avoid misleading search engines about an app for 13 to 18 year olds.

---

## 3. Alerting, operations and infrastructure

### 3.1 Business-logic alerts never reach Cloud Monitoring (P0)

`TREASURE_HUNT_APP_CONTEXT.md` §11 says the "No hunt queued" and "Owner email failed" cases log an `ERROR` that feeds the `hunt_cron_errors` metric. That metric filters on `resource.type="cloud_run_revision"` with `service_name` `closehunts` or `openhunts`, which are the Firebase Functions. But the `console.error` calls live in `app/api/cron/*/route.ts`, which run on Vercel. Their output goes to Vercel's logs and never to Cloud Logging. Meanwhile `functions/src/index.ts` only logs `logger.info` on a 200 response, which is what those routes return.

So today the alert fires only if a route returns a non-2xx or the function itself crashes. A week with no hunt queued, or a winner email silently failing every hour, raises nothing.

Fix (small): have the routes include a `warnings: string[]` field in their JSON response, and in `callCron` parse the body and call `logger.error` when `warnings.length > 0`. The existing metric then picks it up. Update §11 of the context doc to match.

Also worth adding: an alert for the **absence** of the hourly run (a "metric absent" condition on the function's invocation count), which catches a disabled scheduler or a billing lapse.

### 3.2 Firestore indexes are not in the repo (P1)

Several queries need composite indexes: `ongoing == false` ordered by `startsAt`; `participants array-contains` + `ongoing ==` ordered by `deadline`; `ongoing == false` + `startsAt <=` ordered by `startsAt`; and the `consent.status == "pending"` query. They exist only because someone clicked the console link when a query failed. Export them with `firebase firestore:indexes > firestore.indexes.json`, reference the file in `firebase.json`, and deploy with `firebase deploy --only firestore`. The two TTL policies (`huntAttempts.expiresAt`, and the still-missing `consentRequests.expiresAt`) should be recorded in the same place, or at least scripted with `gcloud firestore fields ttls update`.

### 3.3 No backups (P1)

Firestore does not back itself up. Enable **point-in-time recovery** on the database and schedule a daily export to a Cloud Storage bucket. Without this, an accidental `firebase deploy` against the wrong project, a bad script or a compromised admin account can erase every user, consent record and hunt with no way back.

### 3.4 Closed-hunt queries grow without bound (P2)

`getClosedHuntsNeedingAttention`, `hasQueuedHunt` and the sweep in `close-hunts` all fetch every hunt with `ongoing == false` and filter in memory. That's every closed hunt ever. At one hunt a week it's 52 reads per call per year; fine for a long time but it only gets worse, and `close-hunts` runs hourly. Store an explicit `status: "queued" | "live" | "closed"` field plus `notified: boolean` and query on them, or keep the current fields and add `notified: false` at close time so the sweep can filter server-side.

### 3.5 The cron routes hold their own secrets check and run as GET (P2)

Fine as is, but two improvements: make the routes `POST` so a browser or link scanner can't trigger them by accident, and reject requests with no `Authorization` header before touching Firestore. Also consider Vercel Cron instead of a Firebase Function calling Vercel over the public internet; it removes one moving part, one secret to keep in sync and one project to deploy.

### 3.6 `verifySessionCookie(session, true)` on every call (P2)

The `true` flag checks revocation against Firebase on every call. The dashboard layout does it once per navigation and then every server action does it again. Each is a network round-trip to Firebase Auth. Acceptable now; if latency or Auth quota becomes a problem, check revocation in the layout only and skip it in read-only actions.

### 3.7 Vercel log retention and error visibility (P2)

Every `console.error` in the server actions goes to Vercel's logs, which are retained briefly on the hobby and pro plans. Add an error tracker (Sentry has a free tier and a Next.js integration) so that failed entries, failed emails and thrown server errors are kept and grouped.

### 3.8 Single-developer and secrets risk (P2)

The admin claim is set by a script outside the repo, the SMTP, Firebase Admin and reCAPTCHA secrets live only in Vercel and in one `.env.local`, and the Cloud Monitoring setup is click-ops. Write a short `RUNBOOK.md` covering: how to grant the admin claim, where each secret lives and how to rotate it, how to redeploy Functions and rules, and what to do when the Sunday email doesn't arrive. Keep a copy of the secrets in a password manager the client can reach if the developer is unavailable.

---

## 4. Correctness and robustness

### 4.1 Registration is not atomic (P1)

`RegisterComponent` does, in order: reCAPTCHA check, `createUserWithEmailAndPassword`, `updateProfile`, `sendEmailVerification`, `createSession(details)`, `requestParentalConsent`, redirect. If anything after the first Firebase call fails:

- The Firebase user exists, so pressing Register again gives "An account with this email already exists".
- If `createSession` never ran, there's no users doc and no `consent`, so the next login shows "Registration incomplete" and tells the teen to delete the account and start over.
- If only `requestParentalConsent` failed (SMTP hiccup), the account is fine but the user sees "Something went wrong", the password fields clear, and they're stuck on the register page even though they're logged in.

Recommended fix: a single `registerUser` server action that validates every field, verifies reCAPTCHA, calls `adminAuth.createUser`, writes the users doc, sends the consent email, and only then mints a custom token for the client to sign in with. One request, one place to validate, and a failure before the user is created leaves nothing behind. Short of that: don't treat a consent-email failure as a registration failure (the banner already has Resend), and make "Registration incomplete" self-healing by letting the user re-submit the date-of-birth and parent details.

### 4.2 Join, entry and rate-limit are read-then-write (P1)

Noted as a known limitation in the context doc, but the fix is small and the stakes are a cash prize:

- `submitHuntEntry` reads the hunt, checks `completedBy` and `completedDevices`, reads `huntAttempts`, then writes. Two parallel submissions from the same account (easy from a script) both pass the checks. The `arrayUnion` means the uid is stored once, so a double entry doesn't duplicate the uid, but the device check and the 5-per-hour guess limit can both be exceeded.
- Wrap the attempt counter and the final `completedBy` update in `adminDb.runTransaction`, re-reading the hunt and the attempts doc inside it.

### 4.3 Location check trusts whatever the client sends (P2)

The server receives latitude and longitude as form fields and only checks the distance. It ignores the fix's `accuracy` and `timestamp`. Low-effort improvements:

- Send `accuracy` too and reject fixes worse than, say, 150 m instead of applying a flat 100 m buffer to everyone.
- Reject positions older than a couple of minutes.

GPS spoofing is still possible, as the context doc says. The real deterrent is the in-person prize collection with ID, which is already in place.

### 4.4 Winner draw is not auditable (P2)

`pickWinner` uses `Math.random()` and records only the result. For a cash prize to minors, keep a record: store `drawnAt`, the pool size, and the uids in the pool at draw time, and use `crypto.randomInt` so the draw is at least unpredictable. If the Consumer Protection Act s36 review in `TO_DO.md` concludes this is a promotional competition, an auditable draw is a requirement, not a nicety.

### 4.5 Timezone handling is split between client and server (P2)

The admin hunt form (`_components/admin/hunt-form.tsx`) decides "is this a Monday" and "next Monday" using the browser's local timezone, while `parseHuntForm` decides using a UTC date construction that treats the date string as SAST. They agree when the admin is in South Africa. An admin editing from a different timezone near midnight will see the form accept a date the server rejects, or vice versa. Do the day-of-week check on the server only and surface its error, or pass a fixed `Africa/Johannesburg` zone to both.

Related: `close-hunts` compares `deadline <= now` as ISO strings. It works because both are UTC ISO strings in the same format, but a hunt written with a different offset or precision would sort wrongly. Compare `Date.parse` values.

### 4.6 `deleteUserData` can leave an orphaned Auth user (P2)

It deletes the Firestore doc before the Auth user. If `adminAuth.deleteUser` fails, the next login recreates a users doc without `consent`, which lands the user in "Registration incomplete". Delete the Auth user first, or catch the failure and retry. It also doesn't delete the user's `huntAttempts` docs (the TTL handles them within 24 hours of the window expiring, which is fine) and it doesn't remove the uid from closed hunts, which is intentional but should be stated in the privacy policy as retained hunt history.

### 4.7 `getProfile` returns the whole user document (P3)

It casts `doc.data()` to `{ name; phone; email }`, but the object still contains `parent`, `address`, `school`, `consent` (with the parent's IP and user agent) and more. The profile page only forwards three fields to the client, so nothing leaks today. Pick the fields explicitly so a future change to the page can't leak them by accident.

### 4.8 `VersionCheck` reloads mid-form (P3)

When a deploy happens while a player is filling in the entry form, returning to the tab reloads the page and loses their state. Skip the reload if a form on the page has unsaved input, or show a "new version available" prompt instead.

---

## 5. Code quality, tooling and testing

### 5.1 No CI (P1)

There is no `.github/workflows`. Add one job that runs `npm ci`, `npm run lint`, `npm run typecheck` and `npm run build` on every push and PR. Vercel's build will catch a broken build eventually, but after the merge rather than before.

### 5.2 `npm run typecheck` fails on a fresh clone (P1)

`next-env.d.ts` is gitignored and only generated by `next dev` or `next build`, so `tsc --noEmit` reports three "cannot find module" errors for the PNG imports. Change the script to `"typecheck": "next typegen && tsc --noEmit"`.

### 5.3 No tests (P1)

The pure functions are easy to test and carry the business rules: `ageFromDateOfBirth` (boundary days, leap years, SAST offset), `distanceInMeters`, `parseHuntForm` (Monday rule, prize range, circle validation), `pickWinner`, and the email templates (escaping). Add Vitest and a handful of cases; they cost almost nothing to run in CI and would have caught the timezone split above. A Playwright smoke test against a Firebase emulator (register, join, enter wrong code, enter right code) would cover the flow that matters most.

### 5.4 Lint hygiene (P2)

- `app/(dashboard)/profile/page.tsx` imports `ButtonType` and doesn't use it (the one warning).
- `functions/lib/**` should be in `globalIgnores` in `eslint.config.mjs` so a local Functions build doesn't produce lint errors.
- `requireVerifiedSession` in `auth-actions.ts` is exported but never used. Delete it or use it.
- The `getSession` and `isAdmin` helpers are duplicated across action files. One `_lib/session.ts` with `getSession()`, `requireSession()` and `requireAdmin()` would remove the copies and make the consent and email-verified checks reusable.

### 5.5 Dependencies to watch (P2)

- `qr-scanner@1.4.2` last released in 2022 and is effectively unmaintained. Modern Android Chrome and iOS 17+ Safari expose the native `BarcodeDetector` API; use it when available and keep `qr-scanner` as the fallback, or move to `html5-qrcode` or `@zxing/browser`.
- `@react-google-maps/api` is in maintenance mode; Google's recommended React wrapper is `@vis.gl/react-google-maps`. Not urgent, but plan for it before Phase 2 adds more map work.
- `swiper@12` is only used for the safety-tips slider. A CSS scroll-snap carousel would drop a sizeable dependency.
- Keep an eye on `typescript@6` and `@types/node@25`; both are very new and may lag behind the toolchain.

### 5.6 Documentation drift (P3)

`TREASURE_HUNT_APP_CONTEXT.md` is thorough but its §11 alerting claims are wrong (see 3.1), and `CLAUDE.md` is gitignored so a second developer or a fresh clone has no coding conventions. Either commit `CLAUDE.md` or move its conventions into the context doc.

---

## 6. Legal, privacy and child safety

These are flagged in `TO_DO.md` already; they're repeated here because they block launch and carry the most real-world risk.

### 6.1 Unfilled legal documents (P0 for launch)

Fifteen `[PLACEHOLDER: …]` markers remain across `app/privacy/page.tsx` and `app/terms/page.tsx`. The site must not go live with them.

### 6.2 Data minimisation for minors (P1)

Registration collects a teen's **home address** and **school**, labelled "for future safety support", and nothing uses them. Under POPIA, collecting children's data you don't yet need is hard to justify and raises the stakes of any breach. Remove the two fields until Phase 2 has a defined use, and purge the existing values. If they stay, mention them explicitly in the privacy policy and encrypt or restrict them.

### 6.3 Parental consent is not verifiable (P1)

A 13 to 17 year old can enter any email that differs from their own and "consent" to their own account. The in-person ID check at prize collection is the backstop, and that's reasonable, but it means the consent record has little evidentiary value. Options: an SMS code to the parent's phone number as a second channel; or a short delay plus a phone call from the organiser for first-time winners. State the chosen approach in the terms.

### 6.4 The owner email is a PII export (P2)

Every closed hunt emails the names, phone numbers, email addresses and parents' details of every player who completed it. That mailbox becomes a store of children's data outside the app's control. Consider sending only the winner's details and a link to the admin page for the full list, and agree a retention period for the emails with the client.

### 6.5 Promotional competition rules (P1)

If the attorney review concludes the hunt falls under CPA s36: the draw must be auditable (4.4), the rules must be published in full, winners must be recorded for a set period, and an independent person may need to witness draws over a certain value. Build the audit trail now so it doesn't need retrofitting.

---

## 7. Future risks

Things that aren't problems today but will become problems as the app grows or Phase 2 starts.

- **Push notifications need a service worker.** Phase 2 lists push for missing-child alerts. Web push requires a service worker and FCM, which conflicts with the current "no service worker, reload on version change" design. Plan the migration: a minimal SW for push only, with `VersionCheck` updated to work alongside it. iOS web push also requires the app to be installed to the home screen, so the install prompt becomes mandatory UX.
- **Abuse and bullying reports by email** will contain sensitive content about identifiable children. Decide retention, who reads them, and whether the app should store them at all before building.
- **One live hunt at a time** is baked into `open-hunts`, `getActiveHunt` and the admin page. If the app expands to a second town or a second age group, hunts need a `region` or `group` field and every query needs it too.
- **Hunt documents use arrays for participants.** Firestore documents cap at 1 MiB, which allows tens of thousands of uids per hunt, so this won't be hit in Plettenberg Bay. It will be hit before a national roll-out. A `huntEntries/{huntId}_{uid}` subcollection would also make the transactional fixes in 4.2 simpler.
- **Sharing clues outside the app.** The `TO_DO.md` idea of a registration delay only helps if clues are gated behind `joined` on the server (2.7), not just hidden on the page.
- **Age drift.** An 18-year-old registrant turns 19 and remains eligible. If the rules say 13 to 18, decide whether eligibility is checked at registration only or at each entry, and state it in the terms.
- **Key-person dependency.** One developer holds the Vercel, Firebase, Google Cloud, domain and SMTP accounts. Give the client owner access to each, and keep the runbook from 3.8 current.
- **Costs.** Current usage is tiny, but the public Maps key (2.5), hourly Functions, and image optimisation on an unrestricted `next/image` route are the three places a spike or abuse would show up on a bill. Set budget alerts in both Google Cloud and Vercel.

---

## 8. Suggested order of work

1. Upgrade `next`, `nodemailer`, `firebase`, `firebase-admin`; redeploy. (2.1)
2. Make the cron routes return `warnings` and have the Functions log them as errors; fix the context doc. (3.1)
3. Fix the `typecheck` script, add the CI workflow, commit `firestore.indexes.json`. (5.2, 5.1, 3.2)
4. Enable Firestore PITR and a daily export. (3.3)
5. Add a confirm step to consent decline. (2.6)
6. Wrap entry and attempt-count in a transaction; exclude admins from the draw; record the draw. (4.2, 2.4, 4.4)
7. Move registration into a single server action. (4.1)
8. Remove address and school from registration until needed; fill the legal placeholders; attorney review. (6.2, 6.1, 6.5)
9. Unit tests for the pure functions. (5.3)
10. Everything in P2 and P3 as time allows.
