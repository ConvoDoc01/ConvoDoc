import sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

input_html = sys.argv[1]
output_pdf = sys.argv[2]

# HTML file read
with open(input_html, "r", encoding="utf-8") as f:
    lines = f.readlines()

# PDF create
c = canvas.Canvas(output_pdf, pagesize=letter)

y = 750

for line in lines:
    c.drawString(40, y, line.strip())
    y -= 15

    if y < 50:
        c.showPage()
        y = 750

c.save()

print("SUCCESS")
