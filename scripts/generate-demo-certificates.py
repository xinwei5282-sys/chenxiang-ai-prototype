from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parents[1] / "public/assets/certificates"
CERTIFICATES = (
        {"filename":"bracelet-digital-certificate-demo.pdf","title":"海南琼南沉香手串电子证书","number":"CX-2018-072","rows":(("材质","海南沉香"),("规格","18mm · 16颗"),("产区","海南 · 琼南产区"),("状态","身份已核验"))},
        {"filename":"tree-adoption-certificate-demo.pdf","title":"琼南一号认种沉香树电子证书","number":"TR-2026-018","rows":(("基地","琼南沉香产业园"),("认种日期","2026年8月18日"),("树龄","3年"),("状态","生长良好 · 已建档"))},
)

def make(item):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / item["filename"]
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
    pdfmetrics.registerFont(TTFont("ArialUnicode", "/Library/Fonts/Arial Unicode.ttf"))
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setAuthor("广东农垦广垦沉香数字身份原型团队")
    c.setSubject("演示证书，用于广垦沉香小程序需求原型评审与交互验证。" + (" 资产校验信息。" * 180))
    w, h = A4
    c.setFillColorRGB(0.96, 0.93, 0.86); c.rect(0, 0, w, h, fill=1, stroke=0)
    c.saveState(); c.translate(w/2, h/2); c.rotate(35); c.setFillColorRGB(0.85,0.78,0.64); c.setFillAlpha(0.22)
    c.setFont("Helvetica-Bold", 74); c.drawCentredString(0, 0, "DEMO"); c.restoreState()
    def mixed(x, y, value, size, color):
        parts = value.split("·")
        c.setFillColorRGB(*color)
        for i, part in enumerate(parts):
            c.setFont("STSong-Light", size); c.drawString(x, y, part); x += pdfmetrics.stringWidth(part, "STSong-Light", size)
            if i < len(parts) - 1:
                c.setFont("ArialUnicode", size); c.drawString(x, y, "·"); x += pdfmetrics.stringWidth("·", "ArialUnicode", size)
    mixed(60, h-70, "广东农垦 · 广垦沉香", 14, (0.09,0.30,0.24))
    c.setFont("STSong-Light", 27); c.drawCentredString(w/2, h-140, item["title"])
    c.setStrokeColorRGB(0.55,0.40,0.23); c.setLineWidth(1.2); c.line(70,h-170,w-70,h-170)
    c.setFillColorRGB(0.15,0.21,0.18); c.setFont("STSong-Light", 13); c.drawString(78,h-215,"证书编号："+item["number"])
    y=h-275
    for k,v in item["rows"]:
        c.setFillColorRGB(0.35,0.30,0.24); c.setFont("STSong-Light", 14); c.drawString(90,y,k)
        mixed(190, y, v, 14, (0.10,0.18,0.15)); y-=48
    c.setFillColorRGB(0.09,0.30,0.24); c.setFont("STSong-Light", 12); c.drawString(78,145,"签发日期：2026年8月28日")
    mixed(78, 105, "需求原型演示文件 · 非正式签发证书", 10, (0.45,0.40,0.33))
    c.setStrokeColorRGB(0.55,0.40,0.23); c.circle(w-105,125,34,stroke=1,fill=0); c.setFont("STSong-Light",10); c.drawCentredString(w-105,122,"广垦沉香")
    c.showPage(); c.save()
for cert in CERTIFICATES: make(cert)
if any((OUT / c["filename"]).stat().st_size < 5000 for c in CERTIFICATES): raise SystemExit("certificate too small")
