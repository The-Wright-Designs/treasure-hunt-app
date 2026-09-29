# To Do

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
