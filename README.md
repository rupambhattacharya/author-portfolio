# Elevated Lighthouse

Static site for GitHub Pages with a homepage, author/book information, six QR-gated song pages, and a song-voting page.

## Project structure

- index.html — homepage content for the author, book, and soundtrack
- song1.html – song6.html — song pages for QR code access (song1/2: Sun & Me; song3–6: White Rose Lullaby)
- vote.html — anonymous poll page: vote for your favorite Sun & Me song, with live counters
- assets/audio/ — the real MP3 files
- assets/qr/ — print-ready QR images and regeneration script
- assets/apps-script/vote-backend.gs — source for the vote page's Google Apps Script backend (paste into the Apps Script editor; see "Set up voting" below)
- assets/css/style.css — site styling
- CHANGELOG.md — dated log of site changes

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Open the repository on GitHub and enable Pages in Settings.
3. Choose the main branch (or the branch you are using) as the source.
4. Save the settings and wait for the site to publish.

## Update the content

- Replace placeholder text and copy in index.html.
- Replace MP3 files in assets/audio/ (keep the same filenames, or update the `src`/`download` attributes in the matching songN.html if you rename them).
- Update the Google Form settings in songN.html files if you want submissions recorded — all 6 pages share the same form, only `SONG_NAME` differs.
- Regenerate the QR images in assets/qr/ if the URL changes: `cd assets/qr && python3 regenerate_qr.py yourdomain.com`.

## Set up voting

The vote page (vote.html) needs a one-time Google Apps Script deployment:

1. Create a new Google Sheet.
2. Extensions → Apps Script, paste the contents of `assets/apps-script/vote-backend.gs`, save.
3. Deploy → New deployment → Web app. Execute as "Me", access "Anyone". Deploy and authorize.
4. Copy the resulting `/exec` URL into the `VOTE_ENDPOINT` constant near the top of vote.html's script block.

Votes are logged as rows (timestamp, song, IP) in the Sheet — that's also your audit trail if you ever need to double-check the counts.
