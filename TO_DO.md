## Privacy policy / T&Cs for minors

- The rules say the hunt is for teens only and pays a cash prize. There is no privacy policy, no terms page, no age check and no parental-consent checkbox at sign-up. Under POPIA, processing children's data needs parental consent. This probably matters more than any code item before launch.

## QR code option

- Not built. The notes say "QR code or number", and typing the number is covered, so this is optional.

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
- [ ] **WhatsApp share:** from a phone, the message is filled in and the link shows the preview image
- [ ] **Guess limit**
  - After 5 wrong codes, the 6th try shows the wait message
  - The input and button lock, then unlock after the hour
- [ ] **Prize:** create a hunt with a prize other than R500 and check it shows everywhere
- [ ] **Lint:** fix the errors from `functions/lib/index.js` and the unused import warning in the profile page
