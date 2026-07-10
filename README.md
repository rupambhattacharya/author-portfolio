# Elevated Lighthouse — Publishing Website

Static site for GitHub Pages, live at **https://elevatedlighthouse.com** (also https://rupambhattacharya.github.io/danrocca-site/ until DNS is set). Elevated Lighthouse LLC publisher page, D.T. Rocca author/book info, and two QR-gated song download pages.

```
index.html            Homepage (author, book, soundtrack)
song1.html            "The Sun & Me; High Noon" — QR code 1 lands here
song2.html            "The Sun & Me; After the Rain" — QR code 2 lands here
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

Then enable Pages (one-time): repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save. Site goes live within a minute or two.



Note: do NOT add a CNAME file or custom domain setting — that redirects the github.io URL away. Only add it if you later buy a domain (see below).

## 2. Point elevatedlighthouse.com (GoDaddy) at the site

The repo now contains a `CNAME` file with `elevatedlighthouse.com`, so GitHub redirects the github.io URL to that domain. Until DNS is configured, the site is unreachable — so do this right after buying the domain:

1. Repo **Settings → Pages → Custom domain** → confirm it shows `elevatedlighthouse.com` → Save.
2. In **GoDaddy → My Products → DNS**, add:

   | Type  | Name | Value              |
   |-------|------|--------------------|
   | A     | @    | 185.199.108.153    |
   | A     | @    | 185.199.109.153    |
   | A     | @    | 185.199.110.153    |
   | A     | @    | 185.199.111.153    |
   | CNAME | www  | rupambhattacharya.github.io |

   Delete any conflicting GoDaddy "parked" A records for `@`.
3. Tick **Enforce HTTPS** once DNS propagates.
4. Not bought the domain yet and need the site up now? Delete the `CNAME` file from the repo — the site then serves at the github.io URL (but regenerate the QR codes before printing, step 4).

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

- `https://elevatedlighthouse.com/song1.html`
- `https://elevatedlighthouse.com/song2.html`

**Domain changed?** Regenerate before printing:
```
cd assets/qr
pip install qrcode pillow
python regenerate_qr.py elevatedlighthouse.com
```
Test-scan both codes with a phone after the site is live, before sending to the printer.

## 5. Replace the placeholders

- Book synopsis: `index.html`, Book section (marked `[Placeholder blurb]`)
- Author image: add `assets/img/dan.jpg` (from the graphic artist), then swap the `.portrait` div for `<img src="assets/img/dan.jpg" alt="D.T. Rocca">`
- Book cover: pure CSS placeholder in `index.html` — replace with the real cover image when ready
- Real MP3s: drop into `assets/audio/` with the same filenames
- Social links: footer of `index.html`
