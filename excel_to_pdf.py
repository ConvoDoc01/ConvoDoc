import sys
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

input_file = sys.argv[1]
output_file = sys.argv[2]

df = pd.read_excel(input_file)

c = canvas.Canvas(output_file, pagesize=letter)

y = 750

for index, row in df.iterrows():
    line = " | ".join([str(x) for x in row])
    c.drawString(30, y, line)
    y -= 20

    if y < 50:
        c.showPage()
        y = 750

c.save()
