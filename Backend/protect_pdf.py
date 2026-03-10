import sys
import pikepdf

input_pdf = sys.argv[1]
output_pdf = sys.argv[2]
password = sys.argv[3]

with pikepdf.open(input_pdf) as pdf:
    pdf.save(
        output_pdf,
        encryption=pikepdf.Encryption(
            user=password,
            owner=password,
            R=4
        )
    )

print("PDF protected successfully")