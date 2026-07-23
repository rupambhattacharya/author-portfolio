"""Regenerate the print QR codes if your domain changes.
Usage: pip install qrcode pillow && python regenerate_qr.py yourdomain.com"""
import sys, qrcode

domain = sys.argv[1] if len(sys.argv) > 1 else "www.elevatedlighthouse.com"

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
