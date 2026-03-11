import sys
from PyPDF2 import PdfReader, PdfWriter

input_pdf = sys.argv[1]
output_pdf = sys.argv[2]

# direct cursor coordinates from JS
x = float(sys.argv[3])
y = float(sys.argv[4])
width = float(sys.argv[5])
height = float(sys.argv[6])

reader = PdfReader(input_pdf)
writer = PdfWriter()

for page in reader.pages:
    # invert y because canvas origin = top-left, PDF origin = bottom-left
    page_height = float(page.mediabox.top)  # get page height
    page.cropbox.lower_left = (x, page_height - y - height)
    page.cropbox.upper_right = (x + width, page_height - y)
    writer.add_page(page)

with open(output_pdf, "wb") as f:
    writer.write(f)

print("Crop completed")
