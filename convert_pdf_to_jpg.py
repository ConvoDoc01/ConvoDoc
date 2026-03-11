import sys
from pdf2image import convert_from_path

input_pdf = sys.argv[1]
output_image = sys.argv[2]

images = convert_from_path(input_pdf, dpi=300)

images[0].save(output_image, "JPEG")

print("PDF converted to JPG")
