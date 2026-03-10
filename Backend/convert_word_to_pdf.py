import sys
from docx2pdf import convert

input_file = sys.argv[1]
output_file = sys.argv[2]

convert(input_file, output_file)
