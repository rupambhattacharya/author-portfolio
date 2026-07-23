# Add 6 songs + song-voting feature — Design

Date: 2026-07-23

## Summary

Two related additions to the static Elevated Lighthouse site:

1. **Content update** — replace the two Sun & Me placeholder mp3s with final masters, and add four new gated song pages + QR codes for the White Rose Lullaby (female, male, duet, piano sing-along), which belongs to the same book.
2. **Voting feature** — a new `vote.html` page where readers vote for their favorite of the two Sun & Me songs ("High Noon" vs "After the Rain"), with one vote per IP address and two live running counters.

The site remains 100% static (GitHub Pages, custom domain `www.elevatedlighthouse.com`). No new hosting is introduced. The voting feature's "backend" is a Google Apps Script Web App reading/writing a Google Sheet — the same Google ecosystem the site already uses for its Google Form email capture on the song pages.

## Part A — Song content update

### Sun & Me (existing pages, real audio)

- `assets/audio/song-1-high-noon.mp3` and `assets/audio/song-2-after-the-rain.mp3` are overwritten with the final masters.
- **Match files by song title, not by the user's session/track numbering.** The site's own "Track 01"/"Track 02" display labels (`song1.html` = High Noon = "Track 01", `song2.html` = After the Rain = "Track 02") are already correct and unrelated to how the source files were numbered during recording. No HTML changes needed for these two pages beyond the swapped audio bytes.

### White Rose Lullaby (new pages)

Four new pages, each a clone of the existing `song1.html`/`song2.html` pattern (name/email gate → submit to the existing Google Form → reveal player + download), in story order:

| Page | Title | Audio file |
|---|---|---|
| `song3.html` | White Rose Lullaby — Female Vocal | `assets/audio/song-3-white-rose-female.mp3` |
| `song4.html` | White Rose Lullaby — Male Vocal | `assets/audio/song-4-white-rose-male.mp3` |
| `song5.html` | White Rose Lullaby — Duet | `assets/audio/song-5-white-rose-duet.mp3` |
| `song6.html` | White Rose Lullaby — Piano Sing-Along | `assets/audio/song-6-white-rose-piano-singalong.mp3` |

Each page reuses the existing `GOOGLE_FORM` config block (same form, same `songField`), with its own `SONG_NAME` and a unique `localStorage` key (`dr_unlocked_song3`…`dr_unlocked_song6`).

### `index.html` soundtrack section

Add a second track group, "White Rose Lullaby," below the existing "Sun & Me" pair, with 4 track cards in story order. Each links to its `songN.html` page like the existing cards do.

### QR codes

`assets/qr/regenerate_qr.py` is extended to generate QR PNGs for `song3`–`song6` (and `vote`, see Part B) in the same style (`qr-song3-print.png` … `qr-song6-print.png`, `qr-vote-print.png`).

## Part B — Voting feature

### Page: `vote.html`

- No name/email gate — anonymous quick vote.
- Two options: "The Sun & Me; High Noon" vs "The Sun & Me; After the Rain," each with a short description (reusing existing copy), a select control, and a "Vote" button.
- Two visible running counters, one per song.

### Vote flow

1. On page load, check `localStorage` for a `dr_voted_song` flag.
   - If present: skip the picker, show "You voted for `<song>`" plus a fetch of current counts (read-only, no vote attempt).
   - If absent: show the picker.
2. On clicking "Vote":
   - Disable the button (prevents double-submit while in flight).
   - Look up the browser's public IP via a free public IP API (e.g. `api.ipify.org`).
   - Send a `GET` request to the Apps Script Web App URL with query params `action=vote`, `song=<highNoon|afterTheRain>`, `ip=<ip>`. **GET with query params, not a JSON POST body** — this keeps the request a CORS "simple request" and avoids the preflight `OPTIONS` failures Apps Script Web Apps are known to have with POST + `application/json`.
   - The script checks the Sheet for an existing row with that IP:
     - Not found → appends a row (`timestamp`, `song`, `ip`), returns updated totals and `alreadyVoted: false`.
     - Found → does not append, returns current totals and `alreadyVoted: true`.
   - The page sets the `dr_voted_song` localStorage flag regardless of `alreadyVoted` (so a repeat visit never re-attempts), shows both counters, and — if `alreadyVoted` was true — a small note that this IP had already voted.
3. If the public-IP lookup fails (network blocked, API down): the vote still proceeds, sent with `ip=unknown`. Server-side dedup for that request effectively falls back to best-effort; the browser's own localStorage flag still prevents that same browser from voting again. This tradeoff (best-effort, not tamper-proof, dedup) was discussed and accepted — this is a casual reader poll, not a high-stakes vote.

### Apps Script Web App (backend)

- New Google Sheet, e.g. "Song Vote Log," with columns: `timestamp`, `song`, `ip`.
- Apps Script `doGet(e)` handles two actions via `e.parameter.action`:
  - `"vote"` — validates `song` is one of the two allowed values, checks for an existing row with the given `ip`, appends if new, and returns JSON `{ highNoon: N, afterTheRain: M, alreadyVoted: bool }`.
  - `"counts"` — returns the same JSON shape without writing, for the "already voted" read-only path.
- Deployed as a Web App, "Execute as: Me," "Who has access: Anyone" — this is what makes the URL callable from the static site without Google auth on the reader's side.
- The resulting Web App URL is pasted into a `VOTE_ENDPOINT` config constant at the top of `vote.html`'s script block, following the same "placeholder config, page still renders without it" pattern as `GOOGLE_FORM` in the existing song pages. If unset, the vote button is disabled with a short note instead of erroring.

### `index.html`

Add a link/card in or near the soundtrack section inviting readers to "Vote for your favorite" → `vote.html`.

## One-time manual setup (user, with guidance)

1. Copy the 6 mp3 files into `assets/audio/` under the filenames above (or grant folder access so this can be done directly).
2. Create the Google Sheet, paste the provided Apps Script code, deploy as a Web App, and paste the URL into `vote.html`.
3. Regenerate and re-print QR codes for `song3`–`song6` and `vote`.

## Testing

No automated test framework exists in this static-HTML repo (consistent with the existing project). Verification is manual:

- Deploy the Apps Script test/production deployment.
- Open `vote.html`, cast a vote, confirm a row appears in the Sheet and both counters update.
- Reload and confirm a second vote attempt from the same browser is blocked (shown as "already voted") without a new Sheet row.
- Confirm all 6 new/updated QR codes resolve to the correct pages.
- Confirm the 4 new song pages gate/unlock/play/download correctly, matching existing `song1`/`song2` behavior.
