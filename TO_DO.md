## Registration delay for consent

- Research adding forced delay between when a user registers and when they are allowed to enter a hunt. To prevent teens sharing out the location and registering with multiple devices within the hunt area.

## Google map simplification

- Reduce unnecessary google map options to make it more user friendly (ie: street view & directions & zoom buttons)

## Privacy policy / T&Cs for minors

`/privacy`, `/terms`, the age check (13–18) and the parental-consent email flow are built. Still to do before launch:

- [ ] **Fill every `[PLACEHOLDER: …]` in `app/privacy/page.tsx` and `app/terms/page.tsx`.** They must not go live with gaps:
  - Organiser's full legal name, contact email and phone
  - Information Officer's name (and register them with the Information Regulator)
  - Email provider name (the SMTP host)
  - Whether relatives or employees of the organiser and sponsors may enter
  - Prize collection office address
  - Who funds the prize
  - Any limit on how often the same player may win
  - Who receives the results email, and how long it and winner records are kept
  - The sponsors' role (what they are and aren't responsible for), and written approval to use their logos
- [ ] **Have a South African attorney review both documents**, including whether the hunt counts as a promotional competition under Consumer Protection Act s36
- [ ] **Terms now promise things the code doesn't do yet:** admins can still enter and be drawn (exclude them in `pickWinner()`), and there is no redraw feature for an unclaimed prize after 7 days
- [ ] Bump `LEGAL_VERSION` / `LEGAL_UPDATED` in `_lib/utils/legal-version.ts` whenever the text changes
- [ ] **Firebase console:** add a TTL policy on `consentRequests.expiresAt`
- [ ] Delete the old test accounts (they have no consent record, so they see "Registration incomplete" and can't join hunts)
- [ ] **Test end to end:** register as a 15-year-old with a real parent inbox → email arrives → banner shows and join is refused → give consent → join works. Also check that decline deletes the account, an expired or reused link shows "Link expired", and an 18-year-old skips the parent step

- [ ] **Real emergency numbers on `/contact`** (15 min): three entries in `_data/general-data.json` are placeholders. Do this first thing in September
- [ ] Add new logo

## Test

- [ ] **Map location:** on a real phone over HTTPS
  - Dot sits correctly inside and outside the orange circle
  - Denying location shows the explanation message
  - Leaving the page and coming back doesn't leave location tracking running
- [ ] **Loading and error pages**
  - Force an error to check the error page and its retry button
  - Visit a bad URL to check the not-found page
  - Slow the connection to check the loading spinner shows
- [ ] **QR hunt:** on a real phone over HTTPS
  - Create a QR hunt, download the QR from the admin queue and print or display it
  - "Scan QR code" opens the rear camera and a scan enters the draw
  - Denying camera access shows the explanation message
- [ ] **WhatsApp share:** from a phone, the message is filled in and the link shows the preview image
- [ ] **Guess limit**
  - After 5 wrong codes, the 6th try shows the wait message
  - The input and button lock, then unlock after the hour
- [ ] **Prize:** create a hunt with a prize other than R500 and check it shows everywhere
- [ ] **Lint:** fix the errors from `functions/lib/index.js` and the unused import warning in the profile page
