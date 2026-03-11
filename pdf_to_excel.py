import fitz
import sys
import io
from openpyxl import Workbook
from openpyxl.styles import Alignment
from openpyxl.drawing.image import Image as XLImage

input_pdf = sys.argv[1]
output_excel = sys.argv[2]

doc = fitz.open(input_pdf)
wb = Workbook()
ws = wb.active
ws.title = "Document"

# Column width
ws.column_dimensions["A"].width = 110

current_row = 1

for page in doc:

    elements = []

    # ===== TEXT =====
    blocks = page.get_text("blocks")
    for block in blocks:
        x0, y0, x1, y1, text, *_ = block
        clean_text = text.strip()

        if clean_text:
            elements.append({
                "type": "text",
                "y": y0,
                "content": clean_text
            })

    # ===== IMAGES =====
    for img in page.get_images(full=True):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]

        rects = page.get_image_rects(xref)

        for rect in rects:
            elements.append({
                "type": "image",
                "y": rect.y0,
                "content": image_bytes
            })

    # SORT by Y (real PDF position)
    elements.sort(key=lambda x: x["y"])

    for el in elements:

        # -------- TEXT --------
        if el["type"] == "text":

            cell = ws.cell(row=current_row, column=1)
            cell.value = el["content"]

            cell.alignment = Alignment(
                wrap_text=True,
                vertical="top",
                horizontal="left"
            )

            current_row += 1


        # -------- IMAGE --------
        elif el["type"] == "image":

            image_stream = io.BytesIO(el["content"])
            img = XLImage(image_stream)

            # scale image safely
            max_width = 650
            if img.width > max_width:
                ratio = max_width / img.width
                img.width = int(img.width * ratio)
                img.height = int(img.height * ratio)

            img.anchor = f"A{current_row}"
            ws.add_image(img)

            # reserve rows so text doesn't overlap
            rows_for_image = int(img.height / 18) + 1
            current_row += rows_for_image

    # page gap
    current_row += 2


wb.save(output_excel)
doc.close()
