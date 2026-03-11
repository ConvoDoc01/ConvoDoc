import sys
from PIL import Image

input_image = sys.argv[1]
output_pdf = sys.argv[2]

try:
    img = Image.open(input_image)

    # RGB required for PDF
    if img.mode != "RGB":
        img = img.convert("RGB")

    # A4 size in pixels (300 DPI)
    A4_WIDTH = 2480
    A4_HEIGHT = 3508

    # Create white A4 background
    pdf_page = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), "white")

    # Resize image keeping aspect ratio
    img.thumbnail((A4_WIDTH - 200, A4_HEIGHT - 200))

    # Center image
    x = (A4_WIDTH - img.width) // 2
    y = (A4_HEIGHT - img.height) // 2

    pdf_page.paste(img, (x, y))

    # Save as PDF
    pdf_page.save(output_pdf, "PDF", resolution=300)

except Exception as e:
    print("Error:", e)
