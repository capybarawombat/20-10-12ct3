#!/usr/bin/env python3
"""Generate print-ready QR assets only for a supplied final HTTPS URL.
Requires qrencode and Pillow (Ubuntu: sudo apt-get install qrencode python3-pil fonts-dejavu).
"""
import json
import math
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, urljoin
from PIL import Image, ImageDraw, ImageFont

if len(sys.argv) != 2:
    sys.exit('Usage: npm run qr -- https://USERNAME.github.io/REPOSITORY/')
url = sys.argv[1]
parsed = urlparse(url)
if parsed.scheme != 'https' or not parsed.netloc or parsed.hostname in ['example.com', 'username.github.io']:
    sys.exit('Supply the exact production HTTPS URL; placeholders are rejected.')
if not parsed.path.endswith('/'):
    sys.exit('Supply the canonical URL with a trailing slash.')
public = Path(__file__).resolve().parents[1] / 'public'
for kind, name in [('PNG', 'qr-code.png'), ('SVG', 'qr-code.svg')]:
    subprocess.run(['qrencode', '-l', 'H', '-m', '4', '-s', '18', '-t', kind, '-o', str(public / name), url], check=True)

def font(size, serif=False):
    names = ['/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf', '/usr/share/fonts/TTF/DejaVuSerif.ttf', '/usr/share/fonts/noto/NotoSerif-Regular.ttf', '/usr/share/fonts/TTF/Georgia.TTF'] if serif else ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/TTF/DejaVuSans.ttf', '/usr/share/fonts/noto/NotoSans-Regular.ttf', '/usr/share/fonts/TTF/Arial.TTF']
    for name in names:
        if Path(name).exists(): return ImageFont.truetype(name, size)
    return ImageFont.truetype('DejaVuSans.ttf', size)

def centered(draw, text, y, size, width=1800, serif=False):
    draw.text((width / 2, y), text, font=font(size, serif), fill='#805567', anchor='mt')

def flower(draw, x, y, r):
    for i in range(5):
        a = i * math.tau / 5
        px, py = x + math.sin(a) * r * .65, y + math.cos(a) * r * .65
        draw.ellipse((px-r*.45,py-r*.45,px+r*.45,py+r*.45),fill='#e4b1c4')
    draw.ellipse((x-r*.2,y-r*.2,x+r*.2,y+r*.2),fill='#d9b67c')

poster = Image.new('RGB', (1800, 2400), '#f8eceb')
d = ImageDraw.Draw(poster)
d.rounded_rectangle((55,55,1745,2345),20,outline='#cfa8b3',width=3)
d.rounded_rectangle((75,75,1725,2325),15,outline='#e1c7c9',width=1)
for x,y,r in [(145,200,90),(1600,2180,110),(1510,240,55),(200,2110,58),(1610,400,40),(200,440,42)]: flower(d,x,y,r)
centered(d,'THE BLOOMING WISHES',270,38)
centered(d,'Một điều bất ngờ dành cho',470,63,serif=True)
centered(d,'các bạn nữ 12CT3',575,67,serif=True)
qr=Image.open(public/'qr-code.png').convert('RGB').resize((950,950),Image.Resampling.NEAREST)
poster.paste(qr,(425,755))
centered(d,'Quét mã để nhận 20 lời chúc đặc biệt!',1810,45)
centered(d,'20.10 · 12CT3',1960,86,serif=True)
centered(d,'Thanh xuân có bạn, thật đẹp.',2130,36,serif=True)
poster.save(public/'qr-poster.png',optimize=True,dpi=(300,300))
social=Image.new('RGB',(1200,630),'#f7e7eb');s=ImageDraw.Draw(social)
s.rounded_rectangle((24,24,1176,606),5,outline='#cba7b0',width=2)
flower(s,100,515,75);flower(s,1090,110,80)
centered(s,'20 OCTOBER · 12CT3',120,25,1200)
centered(s,'The Blooming Wishes',255,67,1200,True)
centered(s,'Cây Điều Ước 12CT3',355,35,1200,True)
centered(s,'Một khu vườn nhỏ. Hai mươi lời chúc.',480,25,1200)
social.save(public/'social-preview.png',optimize=True)
index=public.parent/'index.html'
import re
index.write_text(re.sub(r'<meta property="og:image"[^>]*>',f'<meta property="og:image" content="{urljoin(url,"social-preview.png")}"/>',index.read_text()))
(public/'qr-destination.json').write_text(json.dumps({'url':url},indent=2)+'\n')
print(f'QR PNG, SVG, 300 DPI poster and social preview generated for {url}')
