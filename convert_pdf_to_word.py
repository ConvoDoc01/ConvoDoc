from pdf2docx import Converter
import sys

input_file = sys.argv[1]
output_file = sys.argv[2]

cv = Converter(input_file)
cv.convert(output_file, start=0, end=None)
cv.close()