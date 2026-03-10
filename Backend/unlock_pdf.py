import sys
import pikepdf

input_pdf = sys.argv[1]
output_pdf = sys.argv[2]
password = sys.argv[3] if len(sys.argv) > 3 else ""

try:

    with pikepdf.open(input_pdf, password=password) as pdf:
        pdf.save(output_pdf)

    print("SUCCESS")

except pikepdf.PasswordError:
    print("WRONG_PASSWORD")
    sys.exit(1)

except Exception as e:
    print("ERROR:", str(e))
    sys.exit(1)