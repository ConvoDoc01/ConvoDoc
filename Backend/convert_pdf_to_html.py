import sys
import fitz

input_pdf = sys.argv[1]
output_html = sys.argv[2]

doc = fitz.open(input_pdf)

html = ""

for page in doc:
    html += page.get_text("html")

with open(output_html, "w", encoding="utf-8") as f:
    f.write(html)

doc.close()

print("SUCCESS")
