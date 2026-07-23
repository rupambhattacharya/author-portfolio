# 6 Songs + Voting Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two Sun & Me placeholder tracks with final masters, add four gated White Rose Lullaby song pages + QR codes, and build an anonymous song-voting page (High Noon vs After the Rain) with per-IP dedup and two live counters, backed by a Google Apps Script Web App + Sheet.

**Architecture:** Site stays 100% static (GitHub Pages). New content pages (`song3.html`–`song6.html`, `vote.html`) follow the exact patterns already established by `song1.html`/`song2.html`. The voting "backend" is a container-bound Google Apps Script deployed as a Web App, called from `vote.html` via `GET` (never POST, to sidestep Apps Script's CORS/preflight issues), reading/writing a Google Sheet used as the vote log and source of truth for the two counters.

**Tech Stack:** Plain HTML/CSS/vanilla JS (no build step, no framework — matches the existing site), Python 3 + `qrcode`/`Pillow` for QR generation (already used by the repo), Google Apps Script (`.gs`) for the voting backend.

## Global Constraints

- No test framework exists in this repo (static HTML site) — verification steps use `grep`, `node --check` (for the inline `<script>` block), `curl`, and manual browser checks, per the design spec's Testing section.
- Existing track cards on `index.html` are intentionally **not hyperlinks** — text only, "Available to book buyers →" — access is QR-only. New White Rose cards must follow this same convention (the design spec's wording about cards "linking to their page" was inaccurate against the actual current code; this plan follows the real existing pattern).
- Reuse the existing Google Form (`assets/... GOOGLE_FORM` config already wired in `song1.html`/`song2.html`) unchanged for all 4 new song pages — only `SONG_NAME` differs per page.
- Vote requests to the Apps Script Web App must be `GET` with query params, never a JSON `POST` body — POST triggers a CORS preflight that Apps Script Web Apps don't handle, GET does not.
- QR PNG filenames must include the song title or "vote" — not just the page slug (e.g. `qr-song3-white-rose-female-print.png`, not `qr-song3-print.png`). Applies to all 7 QR assets, including renaming the 2 existing ones for consistency.
- Every task appends a dated entry to `CHANGELOG.md` at the repo root describing what changed, so there's a running plain-English summary of the whole effort.
- Domain used for QR generation stays `elevatedlighthouse.com` (existing default in `regenerate_qr.py`, unchanged).

---

### Task 1: Commit final audio masters, add the 4 White Rose Lullaby song pages, start the changelog

**Files:**
- Modify (already done, needs commit): `assets/audio/song-1-high-noon.mp3`, `assets/audio/song-2-after-the-rain.mp3`
- Already present (needs commit): `assets/audio/song-3-white-rose-female.mp3`, `assets/audio/song-4-white-rose-male.mp3`, `assets/audio/song-5-white-rose-duet.mp3`, `assets/audio/song-6-white-rose-piano-singalong.mp3`
- Create: `song3.html`, `song4.html`, `song5.html`, `song6.html`
- Create: `CHANGELOG.md`

**Interfaces:**
- Produces: 4 new pages at `song3.html`–`song6.html`, each with `localStorage` key `dr_unlocked_song3`…`dr_unlocked_song6`, each posting to the same `GOOGLE_FORM` (formId `1FAIpQLScpxImgHjw2cyqSU5v4x2XbGDVwj7Vu0P5uckMqoClORRByzg`) with a unique `SONG_NAME`.

- [ ] **Step 1: Create `song3.html` (White Rose Lullaby — Female Vocal)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>White Rose Lullaby — Female Vocal — D.T. Rocca</title>
  <meta name="description" content="Unlock 'White Rose Lullaby — Female Vocal' — an original track from D.T. Rocca's debut novel, The Incredible Adventure at Shadow Stills.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<nav>
  <div class="nav-inner">
    <a class="nav-logo" href="index.html">Elevated Lighthouse</a>
    <ul class="nav-links">
      <li><a href="index.html#book">The Book</a></li>
      <li><a href="index.html#soundtrack">Soundtrack</a></li>
    </ul>
  </div>
</nav>

<main class="song-page">
  <div class="wrap">
    <div class="song-card">
      <span class="track-num">Track 03 · From the book</span>
      <h1>White Rose Lullaby — Female Vocal</h1>

      <div class="gate" id="gate">
        <p class="sub">You found it. Enter your name and email to unlock the song.</p>
        <form id="unlock-form">
          <div class="field">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required autocomplete="name" placeholder="Your name">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
          </div>
          <button class="btn" type="submit">Unlock the song</button>
          <p class="fineprint" id="access-message">This track is reserved for readers of the book. Your name and email will be sent to the Google Form and Google Sheet.</p>
        </form>
      </div>

      <div class="player" id="player">
        <p class="thanks" id="thanks">Enjoy the track.</p>
        <audio controls preload="metadata" src="assets/audio/song-3-white-rose-female.mp3"></audio>
        <a class="btn" href="assets/audio/song-3-white-rose-female.mp3" download="D.T. Rocca - White Rose Lullaby - Female Vocal.mp3">Download MP3</a>
      </div>

      <a class="back-link" href="index.html">← Back to the site</a>
    </div>
  </div>
</main>

<script>
/* ============================================================
   GOOGLE FORM SETUP (see README.md, step 3)
   Replace the three placeholder values below with the ones
   from your Google Form. Until then, the page still works —
   it just won't record submissions.
   ============================================================ */
const GOOGLE_FORM = {
  formId:     "1FAIpQLScpxImgHjw2cyqSU5v4x2XbGDVwj7Vu0P5uckMqoClORRByzg",   // Google Form ID
  nameEntry:  "entry.2109690052",   // field ID for "Name"
  emailEntry: "entry.1068487941",   // field ID for "Email"
  songField:  "entry.1078256840"    // field ID for "Song"
};
const SONG_NAME = "White Rose Lullaby — Female Vocal";
const STORAGE_KEY = "dr_unlocked_song3";
const ACCESS_STORAGE_KEY = "dr_book_access";

const gate = document.getElementById("gate");
const player = document.getElementById("player");

function showPlayer(name) {
  if (name) document.getElementById("thanks").textContent = `Thanks, ${name} — enjoy the track.`;
  gate.classList.add("hidden");
  player.classList.add("active");
}

function grantAccess(name, email) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email })); } catch (e) {}
  try { localStorage.setItem(ACCESS_STORAGE_KEY, "granted"); } catch (e) {}
  showPlayer(name);
}

function submitToGoogleForm(name, email) {
  if (!GOOGLE_FORM.formId || !GOOGLE_FORM.nameEntry || !GOOGLE_FORM.emailEntry) return;

  const data = new FormData();
  data.append(GOOGLE_FORM.nameEntry, name);
  data.append(GOOGLE_FORM.emailEntry, email);
  if (GOOGLE_FORM.songField) data.append(GOOGLE_FORM.songField, SONG_NAME);

  fetch(`https://docs.google.com/forms/d/e/${GOOGLE_FORM.formId}/formResponse`, {
    method: "POST", mode: "no-cors", body: data
  }).catch(() => {});
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const granted = localStorage.getItem(ACCESS_STORAGE_KEY) === "granted";
  if (saved || granted) {
    grantAccess(saved?.name || "", saved?.email || "");
  }
} catch (e) {}

document.getElementById("unlock-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const accessMessage = document.getElementById("access-message");

  submitToGoogleForm(name, email);
  grantAccess(name, email);
});
</script>
</body>
</html>
```

- [ ] **Step 2: Create `song4.html` (White Rose Lullaby — Male Vocal)**

Same as `song3.html` above with these substitutions: title `White Rose Lullaby — Male Vocal — D.T. Rocca`; meta description referencing `'White Rose Lullaby — Male Vocal'`; `<span class="track-num">Track 04 · From the book</span>`; `<h1>White Rose Lullaby — Male Vocal</h1>`; audio `src="assets/audio/song-4-white-rose-male.mp3"`; download `href="assets/audio/song-4-white-rose-male.mp3" download="D.T. Rocca - White Rose Lullaby - Male Vocal.mp3"`; `const SONG_NAME = "White Rose Lullaby — Male Vocal";`; `const STORAGE_KEY = "dr_unlocked_song4";`. Everything else (nav, form fields, `GOOGLE_FORM` block, all JS functions) is byte-for-byte identical to `song3.html`.

- [ ] **Step 3: Create `song5.html` (White Rose Lullaby — Duet)**

Same pattern with substitutions: title `White Rose Lullaby — Duet — D.T. Rocca`; meta description referencing `'White Rose Lullaby — Duet'`; `<span class="track-num">Track 05 · From the book</span>`; `<h1>White Rose Lullaby — Duet</h1>`; audio `src="assets/audio/song-5-white-rose-duet.mp3"`; download `href="assets/audio/song-5-white-rose-duet.mp3" download="D.T. Rocca - White Rose Lullaby - Duet.mp3"`; `const SONG_NAME = "White Rose Lullaby — Duet";`; `const STORAGE_KEY = "dr_unlocked_song5";`.

- [ ] **Step 4: Create `song6.html` (White Rose Lullaby — Piano Sing-Along)**

Same pattern with substitutions: title `White Rose Lullaby — Piano Sing-Along — D.T. Rocca`; meta description referencing `'White Rose Lullaby — Piano Sing-Along'`; `<span class="track-num">Track 06 · From the book</span>`; `<h1>White Rose Lullaby — Piano Sing-Along</h1>`; audio `src="assets/audio/song-6-white-rose-piano-singalong.mp3"`; download `href="assets/audio/song-6-white-rose-piano-singalong.mp3" download="D.T. Rocca - White Rose Lullaby - Piano Sing-Along.mp3"`; `const SONG_NAME = "White Rose Lullaby — Piano Sing-Along";`; `const STORAGE_KEY = "dr_unlocked_song6";`.

- [ ] **Step 5: Verify all 4 pages reference the right audio file and storage key**

Run:
```bash
for n in 3 4 5 6; do echo "-- song$n.html --"; grep -o 'song-[0-9]-[a-z-]*\.mp3' "song$n.html" | sort -u; grep -o 'dr_unlocked_song[0-9]' "song$n.html"; done
```
Expected: each block prints exactly one matching mp3 filename (matching the table below) and the correct `dr_unlocked_songN` key, once each.

| Page | Audio file |
|---|---|
| song3.html | song-3-white-rose-female.mp3 |
| song4.html | song-4-white-rose-male.mp3 |
| song5.html | song-5-white-rose-duet.mp3 |
| song6.html | song-6-white-rose-piano-singalong.mp3 |

- [ ] **Step 6: Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to the Elevated Lighthouse site are logged here, newest first.

## 2026-07-23 — Final Sun & Me masters, White Rose Lullaby pages

- Replaced the two placeholder Sun & Me mp3s (`song-1-high-noon.mp3`, `song-2-after-the-rain.mp3`) with final masters.
- Added four new gated song pages for the White Rose Lullaby, in story order: Female Vocal (`song3.html`), Male Vocal (`song4.html`), Duet (`song5.html`), Piano Sing-Along (`song6.html`). Each follows the existing name/email-unlock pattern and reuses the site's Google Form.
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git add assets/audio/song-1-high-noon.mp3 assets/audio/song-2-after-the-rain.mp3 \
        assets/audio/song-3-white-rose-female.mp3 assets/audio/song-4-white-rose-male.mp3 \
        assets/audio/song-5-white-rose-duet.mp3 assets/audio/song-6-white-rose-piano-singalong.mp3 \
        song3.html song4.html song5.html song6.html CHANGELOG.md
git commit -m "$(cat <<'EOF'
Add final Sun & Me masters and White Rose Lullaby song pages

Four new gated pages (song3-song6.html) for the White Rose Lullaby,
following the existing name/email-unlock pattern, plus the final
Sun & Me audio masters replacing the placeholders.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Build the `vote.html` page and its CSS

**Files:**
- Create: `vote.html`
- Modify: `assets/css/style.css` (append new rules)

**Interfaces:**
- Produces: `VOTE_ENDPOINT` constant (initially `""`) in `vote.html`'s inline script — Task 4 sets its value. Produces `STORAGE_KEY = "dr_voted_song"`. Produces functions `renderCounts(counts)` and `showResult(song, counts, alreadyVoted)` that expect `counts` shaped as `{ highNoon: number, afterTheRain: number, alreadyVoted: boolean }` — this exact shape is what Task 4's Apps Script must return.

- [ ] **Step 1: Append vote-page CSS to `assets/css/style.css`**

Add at the end of the file:

```css

/* ---------- Vote page ---------- */
.tracks-group { margin-bottom: 48px; }
.tracks-group:last-child { margin-bottom: 0; }
.tracks-group-title {
  font-family: var(--serif); font-size: 1.3rem; font-weight: 600;
  color: #f5efe4; margin-bottom: 20px;
}
.vote-options { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.vote-option {
  display: flex; align-items: center; gap: 12px; padding: 16px 18px;
  border: 1.5px solid var(--line); border-radius: 10px; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.vote-option:hover { border-color: var(--accent); }
.vote-option input { accent-color: var(--accent); width: 18px; height: 18px; }
.vote-option span { font-weight: 500; }
.counts { margin-bottom: 8px; }
.count-row { margin-bottom: 20px; }
.count-label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
.count-bar {
  width: 100%; height: 10px; background: var(--bg-alt); border-radius: 100px;
  overflow: hidden; margin-bottom: 6px;
}
.count-fill { height: 100%; background: var(--accent); width: 0%; transition: width 0.5s ease; }
.count-value { font-size: 0.85rem; color: var(--ink-soft); }
```

- [ ] **Step 2: Create `vote.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vote for your favorite — D.T. Rocca</title>
  <meta name="description" content="Vote for your favorite Sun & Me track from D.T. Rocca's debut novel, The Incredible Adventure at Shadow Stills.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<nav>
  <div class="nav-inner">
    <a class="nav-logo" href="index.html">Elevated Lighthouse</a>
    <ul class="nav-links">
      <li><a href="index.html#book">The Book</a></li>
      <li><a href="index.html#soundtrack">Soundtrack</a></li>
    </ul>
  </div>
</nav>

<main class="song-page">
  <div class="wrap">
    <div class="song-card">
      <span class="track-num">Reader's choice</span>
      <h1>Vote for your favorite</h1>

      <div class="gate" id="picker">
        <p class="sub">Which Sun &amp; Me song do you like best?</p>
        <form id="vote-form">
          <div class="vote-options">
            <label class="vote-option">
              <input type="radio" name="song" value="highNoon" required>
              <span>The Sun &amp; Me; High Noon</span>
            </label>
            <label class="vote-option">
              <input type="radio" name="song" value="afterTheRain">
              <span>The Sun &amp; Me; After the Rain</span>
            </label>
          </div>
          <button class="btn" type="submit" id="vote-btn">Vote</button>
          <p class="fineprint" id="vote-status">One vote per reader.</p>
        </form>
      </div>

      <div class="player" id="result">
        <p class="thanks" id="result-message">Thanks for voting.</p>
        <div class="counts" id="counts">
          <div class="count-row">
            <span class="count-label">The Sun &amp; Me; High Noon</span>
            <div class="count-bar"><div class="count-fill" id="bar-highNoon"></div></div>
            <span class="count-value" id="count-highNoon">0 votes</span>
          </div>
          <div class="count-row">
            <span class="count-label">The Sun &amp; Me; After the Rain</span>
            <div class="count-bar"><div class="count-fill" id="bar-afterTheRain"></div></div>
            <span class="count-value" id="count-afterTheRain">0 votes</span>
          </div>
        </div>
      </div>

      <a class="back-link" href="index.html">← Back to the site</a>
    </div>
  </div>
</main>

<script>
/* ============================================================
   APPS SCRIPT SETUP (see README.md)
   Paste the Web App URL from your deployed Apps Script below.
   Until then, the page still renders — voting is just disabled.
   ============================================================ */
const VOTE_ENDPOINT = "";
const STORAGE_KEY = "dr_voted_song";
const SONG_LABELS = {
  highNoon: "The Sun & Me; High Noon",
  afterTheRain: "The Sun & Me; After the Rain"
};

const picker = document.getElementById("picker");
const result = document.getElementById("result");
const voteBtn = document.getElementById("vote-btn");
const voteStatus = document.getElementById("vote-status");
const resultMessage = document.getElementById("result-message");

function renderCounts(counts) {
  const total = (counts.highNoon || 0) + (counts.afterTheRain || 0);
  ["highNoon", "afterTheRain"].forEach(function (key) {
    const value = counts[key] || 0;
    const pct = total ? Math.round((value / total) * 100) : 0;
    document.getElementById("count-" + key).textContent = value + (value === 1 ? " vote" : " votes");
    document.getElementById("bar-" + key).style.width = pct + "%";
  });
}

function showResult(song, counts, alreadyVoted) {
  picker.classList.add("hidden");
  result.classList.add("active");
  resultMessage.textContent = alreadyVoted
    ? `You already voted for ${SONG_LABELS[song]}.`
    : `Thanks for voting for ${SONG_LABELS[song]}!`;
  renderCounts(counts);
}

function getPublicIp() {
  return fetch("https://api.ipify.org?format=json")
    .then(function (res) { return res.json(); })
    .then(function (data) { return data.ip; })
    .catch(function () { return "unknown"; });
}

function fetchCountsOnly() {
  if (!VOTE_ENDPOINT) return;
  fetch(VOTE_ENDPOINT + "?action=counts")
    .then(function (res) { return res.json(); })
    .then(function (counts) { renderCounts(counts); })
    .catch(function () {});
}

try {
  const savedSong = localStorage.getItem(STORAGE_KEY);
  if (savedSong) {
    picker.classList.add("hidden");
    result.classList.add("active");
    resultMessage.textContent = `You voted for ${SONG_LABELS[savedSong]}.`;
    fetchCountsOnly();
  }
} catch (e) {}

if (!VOTE_ENDPOINT) {
  voteBtn.disabled = true;
  voteStatus.textContent = "Voting isn't set up yet — check back soon.";
}

document.getElementById("vote-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!VOTE_ENDPOINT) return;
  const selected = document.querySelector('input[name="song"]:checked');
  if (!selected) return;
  const song = selected.value;

  voteBtn.disabled = true;
  voteStatus.textContent = "Submitting your vote…";

  getPublicIp().then(function (ip) {
    const url = VOTE_ENDPOINT + "?action=vote&song=" + encodeURIComponent(song) + "&ip=" + encodeURIComponent(ip);
    return fetch(url).then(function (res) { return res.json(); });
  }).then(function (data) {
    try { localStorage.setItem(STORAGE_KEY, song); } catch (e) {}
    showResult(song, data, !!data.alreadyVoted);
  }).catch(function () {
    voteStatus.textContent = "Something went wrong — please try again.";
    voteBtn.disabled = false;
  });
});
</script>
</body>
</html>
```

- [ ] **Step 3: Check the inline script for syntax errors**

Run:
```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' vote.html > /private/tmp/claude-501/-Users-rupambhattacharya-Documents-Coding---Rupam-git-author-portfolio/1145c6f3-ec88-4192-830c-f2ce57a3df7e/scratchpad/vote-script-check.js
node --check /private/tmp/claude-501/-Users-rupambhattacharya-Documents-Coding---Rupam-git-author-portfolio/1145c6f3-ec88-4192-830c-f2ce57a3df7e/scratchpad/vote-script-check.js
```
Expected: no output (exit code 0 means syntax is valid).

- [ ] **Step 4: Manual smoke check in a browser**

Run:
```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio" && open vote.html
```
Expected: page loads, both radio options render, clicking "Vote" with `VOTE_ENDPOINT` empty shows "Voting isn't set up yet" and the button stays disabled (this is correct at this stage — Task 4 wires the real endpoint).

- [ ] **Step 5: Update `CHANGELOG.md` and commit**

Add under a new entry (or extend today's if same day):
```markdown
- Added `vote.html` — an anonymous poll page for readers to vote between the two Sun & Me songs, with live vote counters. (Voting won't actually work until the Apps Script backend is deployed — see next entry.)
```

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git add vote.html assets/css/style.css CHANGELOG.md
git commit -m "$(cat <<'EOF'
Add vote.html poll page for the two Sun & Me songs

Anonymous vote form with live counters; voting is disabled until
VOTE_ENDPOINT is wired to a deployed Apps Script backend.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Update `index.html` — soundtrack section, copy, and vote CTA

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: page filenames from Task 1 (`song3.html`–`song6.html`) and Task 2 (`vote.html`) for the vote CTA link only (track cards themselves stay non-linked, per Global Constraints).

- [ ] **Step 1: Update the `<head>` meta description**

Change:
```html
  <meta name="description" content="Elevated Lighthouse publishes self-help, inspirational and transformational books. Coming soon: D.T. Rocca's debut novel, The Incredible Adventure at Shadow Stills — with an original two-song soundtrack.">
```
to:
```html
  <meta name="description" content="Elevated Lighthouse publishes self-help, inspirational and transformational books. Coming soon: D.T. Rocca's debut novel, The Incredible Adventure at Shadow Stills — with an original six-song soundtrack.">
```

- [ ] **Step 2: Update the book section's QR-count sentence**

Change:
```html
        <p>Printed inside the book: two QR codes that unlock the official soundtrack — two original songs, free for readers.</p>
```
to:
```html
        <p>Printed inside the book: six QR codes that unlock the official soundtrack — six original songs, free for readers.</p>
```

- [ ] **Step 3: Replace the soundtrack section**

Replace the entire `<section class="soundtrack" id="soundtrack">...</section>` block with:

```html
<section class="soundtrack" id="soundtrack">
  <div class="wrap">
    <p class="section-label reveal">The soundtrack</p>
    <h2 class="reveal">Six songs. Written for the book.</h2>
    <p class="reveal">Readers find QR codes printed throughout the novel — each one unlocks an original track. Scanned a code? You're in the right place.</p>

    <div class="tracks-group reveal">
      <h3 class="tracks-group-title">Sun &amp; Me</h3>
      <div class="tracks">
        <div class="track-card reveal">
          <span class="track-num">Track 01</span>
          <h3>The Sun &amp; Me; High Noon</h3>
          <p>The song which drives the power of living in the NOW!</p>
          <span class="listen">Available to book buyers →</span>
        </div>
        <div class="track-card reveal">
          <span class="track-num">Track 02</span>
          <h3>The Sun &amp; Me; After the Rain</h3>
          <p>The song which instills hope after challenges and struggles.</p>
          <span class="listen">Available to book buyers →</span>
        </div>
      </div>
    </div>

    <div class="tracks-group reveal">
      <h3 class="tracks-group-title">White Rose Lullaby</h3>
      <div class="tracks">
        <div class="track-card reveal">
          <span class="track-num">Track 03</span>
          <h3>White Rose Lullaby — Female Vocal</h3>
          <p>The first voice readers meet in the story's lullaby.</p>
          <span class="listen">Available to book buyers →</span>
        </div>
        <div class="track-card reveal">
          <span class="track-num">Track 04</span>
          <h3>White Rose Lullaby — Male Vocal</h3>
          <p>The lullaby answered, in a second voice.</p>
          <span class="listen">Available to book buyers →</span>
        </div>
        <div class="track-card reveal">
          <span class="track-num">Track 05</span>
          <h3>White Rose Lullaby — Duet</h3>
          <p>Both voices, together.</p>
          <span class="listen">Available to book buyers →</span>
        </div>
        <div class="track-card reveal">
          <span class="track-num">Track 06</span>
          <h3>White Rose Lullaby — Piano Sing-Along</h3>
          <p>An instrumental version, for readers to sing along.</p>
          <span class="listen">Available to book buyers →</span>
        </div>
      </div>
    </div>

    <p class="reveal" style="color: #b5aea2; margin-top: 40px;">Heard both Sun &amp; Me tracks? <a href="vote.html" style="color: #e8a184; font-weight: 600;">Vote for your favorite →</a></p>
  </div>
</section>
```

- [ ] **Step 4: Verify the section renders correctly**

Run:
```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
grep -c 'track-card reveal' index.html
grep -o 'Track 0[1-6]' index.html | sort -u
grep -o 'href="vote.html"' index.html
```
Expected: `6` track cards total, `Track 01` through `Track 06` each appear once, and one `href="vote.html"` match.

- [ ] **Step 5: Manual smoke check and commit**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio" && open index.html
```
Expected: soundtrack section shows two groups ("Sun & Me" with 2 cards, "White Rose Lullaby" with 4 cards in a 2x2 layout) and a "Vote for your favorite →" link beneath, which opens `vote.html`.

Update `CHANGELOG.md` with:
```markdown
- Updated the homepage soundtrack section to list all six songs across two groups, updated copy from "two-song" to "six-song" soundtrack, and added a "Vote for your favorite" link to the new voting page.
```

```bash
git add index.html CHANGELOG.md
git commit -m "$(cat <<'EOF'
Update homepage soundtrack section for all six songs

Splits the soundtrack into Sun & Me and White Rose Lullaby groups,
updates copy/meta description for six songs, and links to vote.html.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Build and deploy the Apps Script vote backend, wire `VOTE_ENDPOINT`

**Note:** Steps 1–2 are code the agent writes. Steps 3–6 happen in the Google account UI and **must be performed by you (the user)** — no CLI/agent access to Google Sheets/Apps Script exists here. Steps 7+ resume as agent work once you provide the deployed URL.

**Files:**
- Create: `assets/apps-script/vote-backend.gs` (kept in the repo for version history/reference; this is what you paste into the Apps Script editor)
- Modify: `vote.html` (set `VOTE_ENDPOINT`)

**Interfaces:**
- Consumes: nothing from earlier tasks except the response shape `vote.html` already expects: `{ highNoon: number, afterTheRain: number, alreadyVoted: boolean }`.
- Produces: a deployed Web App URL that becomes `VOTE_ENDPOINT`'s value in `vote.html`.

- [ ] **Step 1: Create `assets/apps-script/vote-backend.gs`**

```javascript
/**
 * Song Vote backend — deployed as an Apps Script Web App.
 * Sheet columns: timestamp | song | ip
 */
const SHEET_NAME = 'Votes';
const ALLOWED_SONGS = ['highNoon', 'afterTheRain'];

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'vote') return handleVote(e);
  if (action === 'counts') return handleCounts();
  return jsonResponse({ error: 'unknown action' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'song', 'ip']);
  }
  return sheet;
}

function tally() {
  const rows = getSheet().getDataRange().getValues();
  let highNoon = 0, afterTheRain = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === 'highNoon') highNoon++;
    else if (rows[i][1] === 'afterTheRain') afterTheRain++;
  }
  return { highNoon: highNoon, afterTheRain: afterTheRain };
}

function ipAlreadyVoted(ip) {
  const rows = getSheet().getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === ip) return true;
  }
  return false;
}

function handleVote(e) {
  const song = e.parameter.song;
  const ip = e.parameter.ip || 'unknown';

  if (ALLOWED_SONGS.indexOf(song) === -1) {
    return jsonResponse({ error: 'invalid song' });
  }

  const alreadyVoted = ip !== 'unknown' && ipAlreadyVoted(ip);
  if (!alreadyVoted) {
    getSheet().appendRow([new Date(), song, ip]);
  }

  const counts = tally();
  return jsonResponse({
    highNoon: counts.highNoon,
    afterTheRain: counts.afterTheRain,
    alreadyVoted: alreadyVoted
  });
}

function handleCounts() {
  const counts = tally();
  return jsonResponse({
    highNoon: counts.highNoon,
    afterTheRain: counts.afterTheRain,
    alreadyVoted: false
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: Commit the backend source**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git add assets/apps-script/vote-backend.gs
git commit -m "$(cat <<'EOF'
Add Apps Script source for the vote backend

Container-bound Web App handling GET ?action=vote and ?action=counts
against a Google Sheet used as the vote log. Not yet deployed.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3 (you, in the browser): Create the Sheet**

Go to sheets.google.com → Blank spreadsheet → rename it "Song Vote Log" (top-left title).

- [ ] **Step 4 (you, in the browser): Add the script**

In the Sheet: Extensions → Apps Script. Delete the boilerplate `function myFunction() {}` code and paste the entire contents of `assets/apps-script/vote-backend.gs`. Click the save icon, name the project "Song Vote Backend".

- [ ] **Step 5 (you, in the browser): Deploy as a Web App**

Deploy → New deployment → click the gear icon next to "Select type" → Web app. Set:
- Description: `Song vote API`
- Execute as: `Me`
- Who has access: `Anyone`

Click Deploy. Google will prompt to authorize permissions — click through "Authorize access", pick your account, click "Advanced" → "Go to Song Vote Backend (unsafe)" → "Allow" (this warning is expected for a script you wrote yourself). Copy the Web App URL shown after deployment — it ends in `/exec`.

- [ ] **Step 6 (you): Send me the Web App URL**

Paste the URL (looks like `https://script.google.com/macros/s/AKfycb.../exec`) so it can be wired into `vote.html`.

- [ ] **Step 7: Set `VOTE_ENDPOINT` in `vote.html`**

Replace:
```javascript
const VOTE_ENDPOINT = "";
```
with (using the real URL from Step 6):
```javascript
const VOTE_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
```

- [ ] **Step 8: Verify the deployed backend with curl**

Run (replace the URL with the real one):
```bash
curl -s "https://script.google.com/macros/s/AKfycb.../exec?action=counts"
```
Expected: `{"highNoon":0,"afterTheRain":0,"alreadyVoted":false}`

Run:
```bash
curl -s "https://script.google.com/macros/s/AKfycb.../exec?action=vote&song=highNoon&ip=203.0.113.1"
```
Expected: `{"highNoon":1,"afterTheRain":0,"alreadyVoted":false}`

Run the same command again:
```bash
curl -s "https://script.google.com/macros/s/AKfycb.../exec?action=vote&song=highNoon&ip=203.0.113.1"
```
Expected: `{"highNoon":1,"afterTheRain":0,"alreadyVoted":true}` — confirms dedup is working (no new row for the same IP).

- [ ] **Step 9: Clean up the test votes**

In the Google Sheet, delete the test row(s) added by Step 8's curl calls (the `203.0.113.1` row) so the counters start at zero for real readers.

- [ ] **Step 10: Manual smoke check in a browser**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio" && open vote.html
```
Expected: pick a song, click Vote, see the thank-you message and both counters render with a filled bar. Reload the page — it should now show "You voted for..." immediately without the picker.

- [ ] **Step 11: Update `CHANGELOG.md` and commit**

```markdown
- Deployed the Apps Script vote backend and wired `vote.html` to it. Voting is now live: one vote per IP, two running counters.
```

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git add vote.html CHANGELOG.md
git commit -m "$(cat <<'EOF'
Wire vote.html to the deployed Apps Script backend

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Regenerate QR codes with descriptive filenames

**Files:**
- Modify: `assets/qr/regenerate_qr.py`
- Delete: `assets/qr/qr-song1-print.png`, `assets/qr/qr-song2-print.png` (regenerated under new names)
- Create: `assets/qr/qr-song1-high-noon-print.png`, `qr-song2-after-the-rain-print.png`, `qr-song3-white-rose-female-print.png`, `qr-song4-white-rose-male-print.png`, `qr-song5-white-rose-duet-print.png`, `qr-song6-white-rose-piano-singalong-print.png`, `qr-vote-print.png`

**Interfaces:**
- Consumes: page filenames `song1.html`–`song6.html`, `vote.html` (Tasks 1–3).

- [ ] **Step 1: Rewrite `regenerate_qr.py`**

```python
"""Regenerate the print QR codes if your domain changes.
Usage: pip install qrcode pillow && python regenerate_qr.py yourdomain.com"""
import sys, qrcode

domain = sys.argv[1] if len(sys.argv) > 1 else "elevatedlighthouse.com"

# (page slug -> URL path, output filename slug -> qr-<slug>-print.png)
PAGES = [
    ("song1", "song1-high-noon"),
    ("song2", "song2-after-the-rain"),
    ("song3", "song3-white-rose-female"),
    ("song4", "song4-white-rose-male"),
    ("song5", "song5-white-rose-duet"),
    ("song6", "song6-white-rose-piano-singalong"),
    ("vote", "vote"),
]

for page_slug, output_slug in PAGES:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=40, border=4)
    qr.add_data(f"https://{domain}/{page_slug}.html")
    qr.make(fit=True)
    qr.make_image(fill_color="#1a1a1a", back_color="white").save(f"qr-{output_slug}-print.png")
    print(f"qr-{output_slug}-print.png -> https://{domain}/{page_slug}.html")
```

- [ ] **Step 2: Remove the old QR images and regenerate all 7**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio/assets/qr"
rm -f qr-song1-print.png qr-song2-print.png
python3 regenerate_qr.py
ls -la
```
Expected: stdout prints 7 lines mapping each `qr-*-print.png` to its `https://elevatedlighthouse.com/*.html` URL, and `ls` shows all 7 PNG files with non-zero size.

- [ ] **Step 3: Update `CHANGELOG.md` and commit**

```markdown
- Regenerated all QR codes with descriptive filenames (e.g. `qr-song3-white-rose-female-print.png` instead of `qr-song3-print.png`) and added QR codes for the 4 new song pages and the vote page.
```

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git add -A assets/qr CHANGELOG.md
git commit -m "$(cat <<'EOF'
Regenerate QR codes with descriptive filenames, add 5 new codes

Renames qr-song1/2-print.png to include the song title, and adds
QR codes for the 4 White Rose Lullaby pages and the vote page.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Update `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the project structure and setup sections**

Replace the file contents with:

```markdown
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
```

- [ ] **Step 2: Verify and commit**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
grep -c 'song1.html' README.md
```
Expected: at least 1 match.

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Update README for the 6-song lineup and voting setup

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Final integration verification

**Files:** none (verification only)

- [ ] **Step 1: Serve the site locally and check every page responds**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
python3 -m http.server 8811 &
SERVER_PID=$!
sleep 1
for page in index.html song1.html song2.html song3.html song4.html song5.html song6.html vote.html; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8811/$page")
  echo "$page -> $code"
done
kill $SERVER_PID
```
Expected: every page returns `200`.

- [ ] **Step 2: Confirm each song page's audio file exists on disk**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
for f in song-1-high-noon song-2-after-the-rain song-3-white-rose-female song-4-white-rose-male song-5-white-rose-duet song-6-white-rose-piano-singalong; do
  ls -la "assets/audio/$f.mp3"
done
```
Expected: all 6 files listed with non-zero size.

- [ ] **Step 3: Confirm all 7 QR assets exist**

```bash
ls -la "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio/assets/qr"/*.png
```
Expected: 7 PNG files, all with the descriptive naming from Task 5.

- [ ] **Step 4: Final review pass**

```bash
cd "/Users/rupambhattacharya/Documents/Coding - Rupam/git/author-portfolio"
git status --short
git log --oneline -10
```
Expected: clean working tree (everything committed across Tasks 1–6), and the last several commits show the song pages, vote page, index.html update, Apps Script backend, QR regeneration, and README update.
