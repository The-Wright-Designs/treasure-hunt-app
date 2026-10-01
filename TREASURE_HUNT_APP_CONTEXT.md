# Treasure Hunt App: Context

This is the source of truth for what the app is, how it works and where it stands. Update it in the same change as any code or setup it describes. See [Maintaining this document](#16-maintaining-this-document).

Last updated: 1 October 2026

---

## 1. What the app is

A mobile-first web app (installable as a PWA) that runs a **weekly real-world treasure hunt for teens in Plettenberg Bay**. Each week an item carrying a printed code is hidden inside a marked area. Registered players get clues and a map, go out and find the item, then type its code into the app while standing at the location. Everyone who finds it goes into a random draw for a cash prize. The winner collects it in person with a parent or guardian.

- **Client:** the hunt organiser, who hides the item, runs the draw and pays the prize.
- **Sponsors:** SMHART Security and Plett Security. Their logos appear on the first-visit splash, on `/sponsors` and on `/contact`.
- **Developer:** Chad Wright (The Wright Designs), who builds and runs the app. All content (hunts, announcements, safety tips, contacts) is managed on the developer's side.
- **Live URL:** https://www.treasure-hunt-app.com
- **Repo:** https://github.com/The-Wright-Designs/treasure-hunt-app

## 2. Project status

### Phase 1: the game (current)

Built and working end to end: sign-up, dashboard, weekly hunt with clues and map, code entry with anti-cheat checks, automatic open and close, random winner, owner email, achievements, sharing, admin panel.

Items from the original client brief:

| Brief item                                                            | Status                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Register with name, email, phone (optional age, school, address)      | Done                                                                           |
| Login leads to dashboard                                              | Done                                                                           |
| Sponsor logos on first visit only                                     | Done (remembered per browser)                                                  |
| Dashboard: current hunt, safety tips, messages                        | Done. Admin announcements replace the proposed WordPress integration           |
| Hunt screen: clues, Google Map with radius, rules, how the draw works | Done. Radius is set per hunt; the default is 200 m, not the 150 m in the brief |
| Hidden item with a QR code **or** number                              | Done. Each hunt is set to a typed code or a QR code                            |
| "Congratulations, you're in the draw" screen                          | Done                                                                           |
| Random draw, names sent to client weekly                              | Done, automatically at close, by email                                         |
| Winner collects with parent/guardian                                  | Stated in the rules; handled offline                                           |
| New hunt each week                                                    | Done via the admin queue                                                       |
| Share button                                                          | Done                                                                           |
| Achievements: date, location, completed, winner                       | Done                                                                           |

Remaining before Phase 1 sign-off: see [Open items](#15-open-items-and-known-limitations).

### Phase 2: safety and security (not started)

General security contact info (the `/contact` page already exists as an early start), abuse and cyber-bullying reporting by email, and push notifications (e.g. missing children).

---

## 3. How a hunt week works

All times SAST (UTC+2). The scheduled jobs run in UTC.

| When             | What happens                                                                                                          | Triggered by                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Any time before  | Admin creates the hunt on `/admin`; it waits in the queue, hidden from players                                        | Admin                                    |
| **Monday 07:05** | `open-hunts` finds the earliest queued hunt whose start time has passed and makes it live                             | `openHunts` function, hourly at :05 UTC  |
| Mon–Sun          | Players join, read the clues, search, and enter the code                                                              | Players                                  |
| **Sunday 17:00** | `close-hunts` closes the hunt, picks a random winner from everyone who entered the correct code, and emails the owner | `closeHunts` function, hourly at :00 UTC |
| Next hourly runs | If the email failed, it's retried every hour until it sends                                                           | `closeHunts`                             |
| After close      | Owner contacts the winner to arrange collection with a parent or guardian                                             | Client, offline                          |

Only one hunt can be live at a time. If a hunt is still live, `open-hunts` does nothing.

---

## 4. Player experience

### Sign-up and login (`/register`, `/login`)

- **Register** has three steps:
  1. Name, SA phone number (`0` or `+27`, then 6–8, then 8 digits), email and **date of birth** (required; only ages 13–18 are allowed, computed in SAST by `_lib/utils/age.ts`), plus optional school and address, which are labelled as being for future safety support.
  2. For under-18s: the **parent or guardian's** name, relationship (Mother / Father / Legal guardian), email (must differ from the teen's) and SA phone. Everyone ticks a box accepting the Terms and Privacy Policy.
  3. A password, which must contain upper-case, lower-case, a number and a special character, and a confirmation.
- A verification email is sent on sign-up. For under-18s, a **parental consent email** is also sent to the parent (see below).
- `/privacy` and `/terms` are public pages, linked from login, register, the header menu and the consent page. Both show `LEGAL_UPDATED` from `_lib/utils/legal-version.ts`.

### Parental consent

- Under-18 accounts are created with `consent.status: "pending"`; 18-year-olds get `"self"`. The registration fields are only written once. `createSession` ignores `details` if the doc already has `consent`, so a pending teen can't re-submit an adult date of birth.
- `requestParentalConsent()` creates a random token, stores `consentRequests/{sha256(token)} = { uid, expiresAt (+7 days) }`, deleting any earlier request, and emails the parent a `/consent/{token}` link. Resending has a 60-second server-side cooldown (`consent.emailSentAt`).
- On `/consent/[token]` (public, noindex, no-referrer), the parent reads a summary, ticks four boxes (guardian, privacy, terms, prize collection with ID) and types their name:
  - **Give consent** replaces `consent` with `{ status: "granted", grantedAt, signedName, ip, userAgent, legalVersion }` and deletes the request.
  - **Decline** deletes the account through `deleteUserData`.
- Until consent is granted, the dashboard shows `ParentalConsentBanner` (resend and re-check). `joinHunt` and `submitHuntEntry` refuse unless the status is `granted` or `self`. Admins are exempt. An account with no consent record, such as an old test account or one whose registration was interrupted, sees "Registration incomplete" instead.
- `close-hunts` deletes up to 10 `pending` users per run whose `createdAt` is more than 7 days old.
- The in-person check happens only at **prize collection**: the owner email's winner panel shows the parent's name, relationship and phone, and the parent must bring ID.
- Login has a "Forgot password" flow that uses Firebase's reset email.
- reCAPTCHA v3 runs on login, register and password reset. The score must be at least 0.6.
- A logged-in user who visits `/login` is sent to `/dashboard`. `/` always redirects to `/login`.

### Email verification

Until they verify, users see a banner above every dashboard page with a resend button (60-second cooldown). They can browse and see the active hunt, but **cannot join it or enter a code**. The banner detects verification by itself and refreshes the session.

### Layout

- **Header:** logo and a menu with Profile, Sponsors, Announcements, Safety Tips, Contact, Admin (admins only), Logout, and an **Install** button (native prompt on Android/desktop, instructions on iOS).
- **Footer tab bar:** Dashboard, Active Hunt, Achievements, Share.

### Screens

- **Sponsor splash:** full-screen sponsor logos with a Continue button, shown the first time a browser opens the dashboard.
- **Dashboard (`/dashboard`):**
  - An active hunt card with a live countdown, the deadline, the prize and the number of hunters, plus a Join/View button.
  - The latest announcement.
  - A safety tips slider.
- **Active Hunt (`/active-hunt`):**
  - An intro, the hunt card and the full rules.
  - Before joining: a Join button.
  - After joining: the clues, and a map showing the search circle, the player's live location and how far they are from the area, with "Hunt area" and "My location" buttons. Below that is the code entry form: a text input for written-code hunts, or a **Scan QR code** button that opens the rear camera for QR hunts (scanning submits straight away, no typing fallback).
  - After a correct code: a congratulations panel replaces the clues and map.
- **Achievements (`/achievements`):** every closed hunt the player joined, newest first. Each card shows the date, location, whether they completed it, the number of hunters, and a Winner badge if they won.
- **Announcements (`/announcements`):** all announcements, newest first.
- **Safety Tips (`/safety-tips`):** the full list.
- **Contact (`/contact`):** security and support contacts with phone links, WhatsApp links for some, and logos.
- **Sponsors (`/sponsors`):** sponsor logos.
- **Profile (`/profile`):**
  - Name is read-only. Phone and email can be edited, with a confirm step and an unsaved-changes guard.
  - Changing email logs the user out and requires them to verify the new address.
  - **Delete account** permanently deletes the account (see §8).
- **Share (footer):** a modal with a native share sheet (falls back to copying the link) and a WhatsApp link. The message is "Join the Plett treasure hunt! https://www.treasure-hunt-app.com".
- **Error, loading and 404 pages** exist for the dashboard area and globally.

### Rules shown to players (summary)

Teens registered on the app only. Each hunt runs 7 days. One entry per hunt. Sharing the code gets you disqualified. Enter before the deadline. One random winner from everyone who found the item. The winner is contacted using their sign-up details and collects the cash prize in person with a parent or guardian. Stay in the search area, stay off private property, and take part at your own risk.

---

## 5. Entry checks and anti-cheat

`submitHuntEntry` checks the following on the server, in this order. The first failure returns a friendly error.

1. Session is valid, **the email is verified**, and **parental consent is `granted` or `self`** (admins are exempt). `joinHunt` checks the same things.
2. Hunt exists, is live, and its deadline hasn't passed
3. The player hasn't already completed this hunt
4. The player has joined this hunt
5. **Location:** latitude and longitude were sent, and the player is within the circle radius (default 200 m) **plus a 100 m GPS accuracy buffer** of the circle centre (or the map centre if no circle is set)
6. **Device:** this device hasn't already completed this hunt. Each browser gets a random `deviceId` cookie (HTTP-only, 1 year), which stops one phone completing under several accounts.
7. **Wrong-guess limit:** a maximum of 5 wrong codes per player per hunt per hour. After that, the form locks until the hour is up.
8. The code matches. It's trimmed, upper-cased, and compared on the server; players never receive it.

If every check passes, the player is added to `completedBy` and the device to `completedDevices`. `completedBy` is the pool the winner is drawn from.

For QR hunts the QR simply encodes `entryCode`, so a scan goes through exactly the same checks as a typed code.

On the client, the code input (or Scan QR button) until the browser grants location access. If access is blocked, the form shows device-specific instructions (iOS, Android, desktop). This only improves the experience; the server checks are what enforce the rules.

---

## 6. Admin experience (`/admin`)

Admins have the Firebase custom claim `admin: true`. It's set outside the app; there's no UI for granting it. The admin page contains:

- **New Hunt form:**
  - Start date: must be a Monday. It starts at 07:00, and the deadline is set automatically to the following Sunday at 17:00.
  - Prize: R1–R1000.
  - Map: centre latitude and longitude, and zoom (15, 15.5 or 16).
  - Optional search circle: centre and radius (1–5000 m).
  - A live map preview.
  - An optional location note (shown on achievements and in the owner email).
  - One or more clues.
  - An entry type: **Written code** or **QR code**.
  - An entry code of at least 4 characters, stored in upper case. For QR hunts this is the value the QR encodes.
- **Needs Attention:** closed hunts whose owner email hasn't sent yet, each with a **Resend email** button.
- **Active Hunt:**
  - Shows the dates, prize, hunter and completion counts, and entry code. QR hunts also show the QR with a **Download QR** (PNG) button, as do queued QR hunts.
  - Actions: view or edit the clues, **Close hunt now** (asks for confirmation, then draws a winner and emails the owner), and a link to the hunt in the Firestore console.
- **Queued Hunts:** each queued hunt can be edited (all fields) or deleted.
- **Announcements:** create, edit and delete. The newest one appears on the dashboard.

---

## 7. Architecture

| Layer          | Technology                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router), React 19, TypeScript (strict)                                                             |
| Styling        | Tailwind CSS v4 with a custom theme in `_styles/globals.css` (default colours, text sizes and breakpoints removed) |
| Auth           | Firebase Authentication (email/password). The client SDK is used for auth only                                     |
| Database       | Cloud Firestore, accessed **only on the server** through the Firebase Admin SDK                                    |
| Hosting        | Vercel (Node 22.x)                                                                                                 |
| Scheduling     | Firebase Functions v2 (`europe-west1`) calling the app's `/api/cron/*` routes                                      |
| Email          | Nodemailer over SMTP (port 587, STARTTLS)                                                                          |
| Maps           | Google Maps JavaScript API (`@react-google-maps/api`)                                                              |
| QR codes       | `qrcode.react` (admin QR image) and `qr-scanner` (camera scanning on `/active-hunt`)                               |
| Bot protection | reCAPTCHA v3                                                                                                       |
| Monitoring     | Google Cloud Monitoring log-based metric and alert (§11)                                                           |

**Design principle:** there is no client-side database access at all. Every read and write goes through a server action or route that checks the session cookie first. Firestore security rules block all client access.

### Directory layout

```
app/                Routes: (auth) login/register, (dashboard) player pages,
                    (admin) admin page, api/cron/*, public privacy, terms
                    and consent/[token], plus root layout, manifest,
                    OG image, icons, global error and not-found
_actions/           Server actions (auth, active hunt, achievements, admin,
                    announcements, consent, profile, hunt-closed email)
_components/        UI by feature: admin/, auth/, layout/, navigation/, ui/
_context/           Auth state, header menu, share modal
_data/              Static JSON: nav, safety tips, contacts
_lib/               Firebase client/admin, reCAPTCHA, utils (hunt-notify,
                    geo-distance, format-deadline, page-wrapper, email templates)
_styles/            globals.css theme, button style maps
_types/             Hunt and view types, announcement and button types
functions/          Separate npm project: the two scheduled Firebase Functions
public/             Logo, PWA icons, sponsor logos, WhatsApp icon
firestore.rules     Deny-all client rules
```

Route protection happens in the layouts. There is no middleware:

- `(dashboard)`: requires a valid session and passes `isAdmin` to the header.
- `(admin)`: also requires the `admin` claim.
- `(auth)`: public, and wrapped in the reCAPTCHA provider.
- `/privacy`, `/terms` and `/consent/[token]` sit outside the groups and are public.

---

## 8. Auth and accounts

- **Session:** after a Firebase login, the ID token is exchanged for an HTTP-only `session` cookie (7 days, `sameSite: lax`, `secure` in production). Every server action re-checks the cookie, including whether it has been revoked.
- **Users doc:** each login creates or updates `users/{uid}`. The email is only written the first time, so a changed email is written by the profile update instead.
- **Logout:** revokes the Firebase refresh tokens and deletes the cookie.
- **Email change:** updates Firebase Auth with `emailVerified: false`, updates the users doc, deletes the session and sends the user to login. The verification banner then applies.
- **Delete account** does the following, in order:
  1. Removes the user from any live hunt's `participants` and `completedBy`, so they can't win.
  2. Deletes any `consentRequests` for the user, then `users/{uid}`.
  3. **Deletes** the Firebase user, so the email can register again.

  This lives in `_lib/utils/delete-user-data.ts` (deliberately not a server action, since it takes a uid). The same code runs when a parent declines consent and in the 7-day cleanup of unconsented accounts.

  Closed hunts keep the uid in their history, and `completedDevices` keeps the device.

- **Disabled accounts** (disabled by hand in the Firebase console) see "This account has been disabled." at login.

---

## 9. Data model (Firestore)

| Collection                    | Fields                                                                                                                                                                                                                                                                                                    | Notes                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `users/{uid}`                 | `name`, `phone`, `email`, `emailVerified`, `dateOfBirth`, `school?`, `address?`, `parent?` (`name`, `email`, `phone`, `relationship`; under-18s only), `consent` (`status`: `pending`/`granted`/`self`, plus `emailSentAt?` or the grant record), `termsAcceptedAt`, `legalVersion`, `createdAt`                                                                                                                                                                                                                                  | Optional fields are only stored when given                   |
| `hunts/{id}`                  | `ongoing`, `startsAt`, `deadline`, `clues[]`, `entryCode`, `entryType?` (`"code"` or `"qr"`, missing = `"code"`), `prizeAmount`, `participants[]`, `completedBy[]`, `completedDevices?[]`, `winner` (uid or null), `closedAt?`, `notifiedAt?`, `mapLatitude`, `mapLongitude`, `mapZoom`, `circleLatitude?`, `circleLongitude?`, `circleRadius?`, `locationNote?` | Dates are ISO strings                                        |
| `announcements/{id}`          | `heading`, `body`, `createdAt`                                                                                                                                                                                                                                                                            |                                                              |
| `huntAttempts/{huntId}_{uid}` | `count`, `windowStart` (ms), `expiresAt` (Timestamp)                                                                                                                                                                                                                                                      | Wrong-guess limit. Cleaned up by a TTL policy on `expiresAt` |
| `consentRequests/{sha256(token)}` | `uid`, `expiresAt` (Timestamp, +7 days) | Parental consent links. Needs a TTL policy on `expiresAt` (**not yet created**) |

**Hunt states:**

- **Queued:** `ongoing: false` with no `closedAt`.
- **Live:** `ongoing: true`.
- **Closed:** `ongoing: false` with `closedAt` set.
- **Notified:** `notifiedAt` is set.

Types live in `_types/past-hunt-types.ts`. `Hunt` is the stored doc shape. The view types (`ActiveHuntView`, `PastHuntView`, `QueuedHuntView`, `ActiveHuntAdminView`, `ClosedHuntAdminView`) control what each screen receives. **`entryCode` is never in a player-facing view.**

---

## 10. Server actions and routes

| File                        | Exports                                                                                                                                                                                   | Used by                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `auth-actions.ts`           | `verifyAuthRecaptcha`, `createSession`, `requireVerifiedSession` (currently unused), `deleteSession`, `deleteAccount`                                                                     | Login, register, verify banner, header, profile |
| `active-hunt-actions.ts`    | `getActiveHunt`, `joinHunt`, `submitHuntEntry`                                                                                                                                            | Dashboard, active hunt page                     |
| `achievements-actions.ts`   | `getPastHunts`                                                                                                                                                                            | Achievements                                    |
| `profile-actions.ts`        | `getProfile`, `saveProfile`                                                                                                                                                               | Profile                                         |
| `announcement-actions.ts`   | `getAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`                                                                                                      | Dashboard, announcements, admin                 |
| `admin-actions.ts`          | `isAdmin`, `getQueuedHunts`, `getActiveHuntAdmin`, `getClosedHuntsNeedingAttention`, `createHunt`, `updateHunt`, `updateHuntClues`, `deleteQueuedHunt`, `closeHuntNow`, `resendHuntEmail` | Admin                                           |
| `consent-actions.ts`        | `requestParentalConsent`, `getConsentRequest`, `grantParentalConsent`, `declineParentalConsent` | Register, consent banner, `/consent/[token]` |
| `send-hunt-closed-email.ts` | `sendHuntClosedEmail`                                                                                                                                                                     | `hunt-notify.ts`                                |
| `app/api/cron/open-hunts`   | GET, requires `Authorization: Bearer CRON_SECRET`                                                                                                                                         | `openHunts` function                            |
| `app/api/cron/close-hunts`  | GET, requires the same bearer token                                                                                                                                                       | `closeHunts` function                           |

Shared hunt logic lives in `_lib/utils/hunt-notify.ts`:

- `pickWinner()`: keeps an existing winner, otherwise picks at random from `completedBy`.
- `resolveParticipants()`: looks up players in the users docs, falling back to Firebase Auth.
- `notifyHuntClosed()`: sends the email, then stamps `notifiedAt`.

---

## 11. Scheduled jobs, notifications and alerting

- **Functions** (`functions/src/index.ts`):
  - `closeHunts` runs at `0 * * * *` and `openHunts` at `5 * * * *`, both UTC.
  - Each calls its route with the `CRON_SECRET` bearer token, a 240 s timeout and 2 retries.
  - They're built and deployed separately: `firebase deploy --only functions`.
- **close-hunts:**
  1. Closes every overdue live hunt and picks its winner in one batch.
  2. Sweeps up to 10 closed hunts that haven't been notified and emails the owner for each. `notifiedAt` makes this safe to retry.
- **Owner email:** sent to `SMTP_SEND_TO` with the subject "Hunt closed - winner: {name}". It contains:
  - A winner panel with the winner's phone and email.
  - A hunt overview: dates, prize, clue count, participant counts, and the location note or a map link.
  - A table of everyone who completed the hunt.

  **Players receive no emails from the app** apart from Firebase's verification and password-reset emails.

- **Failure alerting** is set up in Google Cloud (project `treasure-hunt-app-ef86f`), not in code:
  - The log-based counter metric `hunt_cron_errors` (label `job`) counts `resource.type="cloud_run_revision"` entries with `service_name` `closehunts` or `openhunts` and `severity>=ERROR`.
  - The alert policy **Hunt cron errors** (Critical) fires when the 5-minute sum is above 0 and emails the developer (channel "Chad"). It auto-closes after 30 minutes.
  - Both routes still return 200 for these business-logic outcomes, but now log an `ERROR` line that feeds the same metric/alert:
    - **No hunt queued:** `close-hunts` checks at 17:00 and 19:00 SAST (the hunt-close run and 2 hours later) whether anything is queued for next Monday; `open-hunts` checks at 07:05, 08:05 and 09:05 SAST (the open run and the next two hourly runs) whether a hunt was due to open. Either logs `console.error` if the queue is empty.
    - **Failed owner email:** `close-hunts` logs `console.error` for each hunt whose notification email fails during the hourly retry sweep. The admin Needs Attention list also shows these.
  - Because both cron jobs run hourly, a persisting failure re-triggers the alert roughly every hour until it's resolved.
  - **To test:** write an ERROR log entry with that resource through the Logging API `entries.write` "Try this method" panel.

---

## 12. Content management

| Content       | Where it lives                                                                          | How to change it             |
| ------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| Hunts         | Firestore `hunts`                                                                       | `/admin`                     |
| Announcements | Firestore `announcements`                                                               | `/admin`                     |
| Safety tips   | `_data/general-data.json` → `safetyTips`                                                | Edit the JSON and deploy     |
| Contacts      | `_data/general-data.json` → `contacts`                                                  | Edit the JSON and deploy     |
| Navigation    | `_data/nav-data.json`                                                                   | Edit the JSON and deploy     |
| Sponsor logos | `public/images/sponsors/` plus `_components/ui/sponsor-logos.tsx` and the contacts JSON | Replace the files and deploy |
| Rules text    | `app/(dashboard)/active-hunt/page.tsx`                                                  | Edit and deploy              |
| Share message | `_components/ui/share-modal.tsx`                                                        | Edit and deploy              |

---

## 13. Infrastructure and configuration

- **Vercel:** hosts the Next.js app on Node 22.x. `vercel.json` only sets long-lived caching for `/_next/static`.
- **Firebase** (project `treasure-hunt-app-ef86f`) provides:
  - Auth.
  - Firestore, with deny-all `firestore.rules` deployed through `firebase deploy --only firestore:rules` and a TTL policy on `huntAttempts.expiresAt` (created 30 Sep 2026; deletes docs within about 24 hours of expiry).
  - The two scheduled Functions.
- **Google Cloud:** Cloud Monitoring holds the metric and alert policy from §11.
- **PWA:**
  - `app/manifest.ts`: standalone display, start page `/dashboard`, theme colour `#E37434`, and 192 px, 512 px and maskable icons.
  - `appleWebApp` metadata in the root layout.
  - An OG image generated in `app/opengraph-image.tsx`.
  - No service worker, so every launch loads from the network. `_components/layout/version-check.tsx` (in the root layout) refreshes a backgrounded app after a deploy: when the page becomes visible it fetches `/api/version` and reloads if the id differs from its own `BUILD_ID` (`VERCEL_GIT_COMMIT_SHA`, inlined via `env` in `next.config.ts`). It does nothing locally, where `BUILD_ID` is empty.
- **`next.config.ts`:**
  - `firebase-admin` is treated as an external server package.
  - Image `deviceSizes` are `[425, 800, 1280]`, matching the breakpoints.
  - Optimised images are cached for 1 year.

### Environment variables

| Where                                | Variables                                                                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel and `.env.local`, client side | `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Vercel and `.env.local`, server side | `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `RECAPTCHA_SECRET_KEY`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SEND_TO`, `CRON_SECRET`   |
| Firebase Functions                   | `CRON_SECRET` (secret; must match the Vercel value) and `APP_BASE_URL` (param)                                                                                                           |

`.env.local` never reaches production. Keep the Vercel and Firebase copies of `CRON_SECRET` in sync. Changing a Functions secret only takes effect after a redeploy.

### Commands

```
npm run dev | build | start | lint | typecheck
firebase deploy --only functions
firebase deploy --only firestore:rules
```

There is no test framework; testing is manual (see `TO_DO.md`).

---

## 14. Code conventions (summary)

Full detail is in `CLAUDE.md` and the developer's global instructions. In short:

- Components take a `cssClasses` prop instead of `className`.
- Use `classnames` rather than template-literal class strings.
- Use `next/image` and `next/link` only.
- Forms use form actions (`useActionState`), not `onSubmit`.
- Only the custom Tailwind tokens exist:
  - Colours: `black`, `orange`, `teal`, `white`, `link`, `error`.
  - Text: `text-heading`, `text-subheading`, `text-paragraph`.
  - Breakpoints: `phone:`, `tablet:`, `desktop:`.
- Hover styles are for `desktop:` only, and clickable elements get `desktop:hover:cursor-pointer`.
- Lucide icons are coloured through the `color` prop.
- Files are named in kebab-case.
- Changes should be as small and simple as possible, with no added comments.

---

## 15. Open items and known limitations

**Before Phase 1 sign-off**

- Legal:
  - `/privacy`, `/terms`, the 13–18 age check and parental consent are built, but **every `[PLACEHOLDER: …]` and gap in the privacy policy and terms must be filled before launch**: the organiser's legal name and contact details, the Information Officer, the email provider, the winner-record retention period, whether relatives or employees may enter, the prize collection office address, the prize claim period and what happens to unclaimed prizes, and the sponsors' role. See `TO_DO.md`.
  - A South African attorney should review both documents, including Consumer Protection Act s36 (promotional competitions). The organiser must register an Information Officer with the Information Regulator.
  - Create the TTL policy on `consentRequests.expiresAt`, and delete the old test accounts (they have no consent record).
- Content:
  - Three `/contact` entries are placeholders.
  - The new logo hasn't been added yet.
- The manual test checklist in `TO_DO.md`: map location on a real phone, error, loading and 404 pages, WhatsApp share preview, the wrong-guess lock, and a prize other than R500.
- Lint:
  - Ignore `functions/lib/**` in `eslint.config.mjs`.
  - Remove the unused `ButtonType` import from the profile page.

**Known limitations**

- The optional sign-up fields are stored but not shown on the profile page or in the owner email.
- Sponsor splash "seen" is stored per browser, so a new device shows it once more.
- Location and device checks raise the bar but don't make cheating impossible: GPS can be spoofed and cookies cleared.
- reCAPTCHA is checked in a separate server call before the Firebase login or registration, not by Firebase itself.
- The join and entry flow isn't transactional, so two requests racing each other could get past the device check or the guess limit. The risk is low.

---

## 16. Maintaining this document

- Update this file **in the same change** as any feature, data-model, route, business-rule, infrastructure or status change it describes.
- Keep the "Last updated" date at the top current.
- When an open item is done, move it into the relevant section, or remove it if it no longer matters.
- `CLAUDE.md` holds agent working instructions and more code-level detail; this file describes the product and how it runs. If the two disagree, fix both.
