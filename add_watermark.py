import sys
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

input_pdf = sys.argv[1]
output_pdf = sys.argv[2]
watermark_text = sys.argv[3]

packet = io.BytesIO()

c = canvas.Canvas(packet, pagesize=letter)
c.setFont("Helvetica", 50)
c.setFillGray(0.5, 0.3)
c.drawCentredString(300, 500, watermark_text)
c.save()

packet.seek(0)

watermark = PdfReader(packet)
watermark_page = watermark.pages[0]

reader = PdfReader(input_pdf)
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark_page)
    writer.add_page(page)

with open(output_pdf, "wb") as f:
    writer.write(f)
