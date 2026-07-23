# Changelog

All notable changes to the Elevated Lighthouse site are logged here, newest first.

## 2026-07-23 — Final Sun & Me masters, White Rose Lullaby pages

- Replaced the two placeholder Sun & Me mp3s (`song-1-high-noon.mp3`, `song-2-after-the-rain.mp3`) with final masters.
- Added four new gated song pages for the White Rose Lullaby, in story order: Female Vocal (`song3.html`), Male Vocal (`song4.html`), Duet (`song5.html`), Piano Sing-Along (`song6.html`). Each follows the existing name/email-unlock pattern and reuses the site's Google Form.
- Added `vote.html` — an anonymous poll page for readers to vote between the two Sun & Me songs, with live vote counters. (Voting won't actually work until the Apps Script backend is deployed — see next entry.)
- Updated the homepage soundtrack section to list all six songs across two groups, updated copy from "two-song" to "six-song" soundtrack, and added a "Vote for your favorite" link to the new voting page.
- Regenerated all QR codes with descriptive filenames (e.g. `qr-song3-white-rose-female-print.png` instead of `qr-song3-print.png`) and added QR codes for the 4 new song pages and the vote page.
- Deployed the Apps Script vote backend and wired `vote.html` to it. Voting is now live: one vote per IP, two running counters. Also patched a formula-injection risk — the backend now whitelists the client-supplied `ip` value to look like a real IP address before writing it into the Sheet, rather than trusting it as-is.
- Repointed `vote.html` at a fresh Apps Script deployment URL after redeploying with the formula-injection fix.
- Merged an earlier remote fix pointing QR codes at the `www` subdomain (bare `elevatedlighthouse.com` 404s — CNAME only registers `www`) and regenerated all 7 QR codes against `www.elevatedlighthouse.com` so none of them 404.
