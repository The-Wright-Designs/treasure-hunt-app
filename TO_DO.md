# To Do

## Build

- [x] **5. Per-hunt prize amount (30 min)**
  - Remove the hardcoded `prizeAmount = 500` in `_actions/admin-actions.ts` (~line 281)
  - Add a prize field to `_components/admin/hunt-form.tsx` and validate it in `createHunt`
  - Replace the hardcoded "R500" in `app/(dashboard)/active-hunt/page.tsx` (lines 27 and 138) with `activeHunt.prizeAmount`
- [x] **6. Small cleanups (15 min)**
  - Delete the unused `heroSlider` key from `_data/general-data.json`
  - Add `"typecheck": "tsc --noEmit"` to `package.json` scripts
- [x] **7. Install to home screen (1h)**
  - Add `app/manifest.ts`, `app/icon.png` and `app/apple-icon.png`

## Test

- [ ] **Map location:** on a real phone over HTTPS
  - Dot sits correctly inside and outside the orange circle
  - Denying location shows the explanation message
  - Leaving the page and coming back doesn't leave location tracking running
- [ ] **Loading and error pages**
  - Force an error to check the error page and its retry button
  - Visit a bad URL to check the not-found page
  - Slow the connection to check the loading spinner shows
- [ ] **WhatsApp share:** from a phone, the message is filled in and the link shows the preview image
- [ ] **Guess limit**
  - After 5 wrong codes, the 6th try shows the wait message
  - The input and button lock, then unlock after the hour
- [ ] **Prize:** create a hunt with a prize other than R500 and check it shows everywhere
- [ ] **Lint:** fix the errors from `functions/lib/index.js` and the unused import warning in the profile page

## Housekeeping

- [ ] Commit the guess limit work
- [ ] In `DEVELOPMENT-PLAN.md`, mark the join button spinner (item 4) as not needed, since it already has one
- [ ] In `DEVELOPMENT-PLAN.md`, update the deferred admin editing item: editing is done (commit 9324ff0), but deleting hunts and a participant list are still open
