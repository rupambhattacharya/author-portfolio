# Elevated Lighthouse

Static site for GitHub Pages with a homepage, author/book information, and two QR-gated song download pages.

## Project structure

- index.html — homepage content for the author, book, and soundtrack
- song1.html — first song page for QR code access
- song2.html — second song page for QR code access
- assets/audio/ — placeholder MP3s; replace with the real song files while keeping the same filenames
- assets/qr/ — print-ready QR images and regeneration script
- assets/css/style.css — site styling

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Open the repository on GitHub and enable Pages in Settings.
3. Choose the main branch (or the branch you are using) as the source.
4. Save the settings and wait for the site to publish.

## Update the content

- Replace placeholder text and copy in index.html.
- Add the author image and book cover when available.
- Replace the placeholder MP3 files in assets/audio/.
- Update the Google Form settings in song1.html and song2.html if you want submissions recorded.
- Regenerate the QR images in assets/qr/ if the URL changes.
