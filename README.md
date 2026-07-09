# Dan Rocca — Author Website

Static site for GitHub Pages, live at **https://rupambhattacharya.github.io/danrocca-site**. Author info, upcoming book, and two QR-gated song download pages.

```
index.html            Homepage (author, book, soundtrack)
song1.html            "The Quiet Hours" — QR code 1 lands here
song2.html            "Paper Cities"   — QR code 2 lands here
assets/audio/         Dummy MP3s (replace with real songs, keep filenames)
assets/qr/            Print-ready QR PNGs (1640px) + regenerate script
assets/css/style.css  All styling
```

## 1. Deploy to GitHub Pages

The repo already exists at `github.com/rupambhattacharya/danrocca-site`. Push any updates from this folder:

```
cd dan-rocca-site
git add -A && git commit -m "Update site"
git push
```

Then enable Pages (one-time): repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save. Site goes live at `https://rupambhattacharya.github.io/danrocca-site/` within a minute or two.

To move to `danrocca.github.io` later: create a GitHub account named **danrocca**, create a repo in it named exactly `danrocca.github.io`, push the same files, and regenerate the QR codes (step 4).

Note: do NOT add a CNAME file or custom domain setting — that redirects the github.io URL away. Only add it if you later buy a domain (see below).

## 2. (Later, optional) Custom GoDaddy domain

1. Repo **Settings → Pages → Custom domain** → enter the domain → Save.
2. In **GoDaddy → My Products → DNS**, add:

   | Type  | Name | Value              |
   |-------|------|--------------------|
   | A     | @    | 185.199.108.153    |
   | A     | @    | 185.199.109.153    |
   | A     | @    | 185.199.110.153    |
   | A     | @    | 185.199.111.153    |
   | CNAME | www  | danrocca.github.io |

   Delete any conflicting GoDaddy "parked" A records for `@`.
3. Tick **Enforce HTTPS** once DNS propagates.
4. **Regenerate and reprint the QR codes** (step 4 below) — though the old github.io links keep redirecting to the new domain, so already-printed books keep working.

## 3. Hook up the Google Form (email capture)

1. Create a Google Form with three short-answer questions: **Name**, **Email**, **Song**.
2. Link it to a Sheet (Responses tab → Sheets icon) — this is where signups land.
3. Get the field IDs: open the form's public URL, right-click → View Page Source, search for `entry.` — you'll find IDs like `entry.1234567890` for each question. The form ID is the long string in the URL between `/d/e/` and `/viewform`.
4. In **both** `song1.html` and `song2.html`, edit the `GOOGLE_FORM` block near the bottom:
   ```js
   const GOOGLE_FORM = {
     formId:     "1FAIpQL...your-id...",
     nameEntry:  "entry.1234567890",
     emailEntry: "entry.0987654321",
     songField:  "entry.5678901234"   // or null
   };
   ```

Until you do this, the pages still work — visitors can unlock and download the songs — but submissions aren't recorded.

## 4. QR codes for print

`assets/qr/qr-song1-print.png` and `qr-song2-print.png` are 1640×1640 px with high error correction — sharp at any book print size (keep ≥ 2 cm on the page). They point to:

- `https://rupambhattacharya.github.io/danrocca-site/song1.html`
- `https://rupambhattacharya.github.io/danrocca-site/song2.html`

**Domain changed?** Regenerate before printing:
```
cd assets/qr
pip install qrcode pillow
python regenerate_qr.py rupambhattacharya.github.io/danrocca-site
```
Test-scan both codes with a phone after the site is live, before sending to the printer.

## 5. Replace the placeholders

- Author bio and hobbies: `index.html`, About section (marked `[Placeholder ...]`)
- Author photo: add `assets/img/dan.jpg`, then swap the `.portrait` div for `<img src="assets/img/dan.jpg" alt="Dan Rocca">`
- Book title, blurb, genre, cover: `index.html`, Book section (the cover is pure CSS — replace with a real cover image when ready)
- Song titles/descriptions: `index.html` + both song pages
- Real MP3s: drop into `assets/audio/` with the same filenames
- Social links: footer of `index.html`
