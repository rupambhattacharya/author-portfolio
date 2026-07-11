"""Regenerate the print QR codes if your domain changes.
Usage: pip install qrcode pillow && python regenerate_qr.py yourdomain.com"""
import sys, qrcode
domain = sys.argv[1] if len(sys.argv) > 1 else "www.elevatedlighthouse.com"
for slug in ["song1", "song2"]:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=40, border=4)
    qr.add_data(f"https://{domain}/{slug}.html")
    qr.make(fit=True)
    qr.make_image(fill_color="#1a1a1a", back_color="white").save(f"qr-{slug}-print.png")
    print(f"qr-{slug}-print.png -> https://{domain}/{slug}.html")
