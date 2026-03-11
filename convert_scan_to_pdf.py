#!/usr/bin/env python3
"""
Convert image files (JPG, PNG, etc.) to PDF
"""
import sys
import os
from PIL import Image

def convert_image_to_pdf(input_path, output_path):
    try:
        # Check if input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        # Open the image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB (in case of PNG with transparency)
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[-1])
            else:  # 'LA'
                background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode == 'P':
            # Palette mode - convert to RGBA first
            if 'transparency' in img.info:
                img = img.convert('RGBA')
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            else:
                img = img.convert('RGB')
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Save as PDF
        img.save(output_path, 'PDF')
        print(f"✅ Image converted to PDF: {output_path}")
        
    except Exception as e:
        print(f"❌ Error converting image: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_image_to_pdf.py <input_image> <output_pdf>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    convert_image_to_pdf(input_file, output_file)
