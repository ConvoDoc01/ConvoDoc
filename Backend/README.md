# Backend

This is a Node.js backend for serving the frontend and providing APIs for document conversion.

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)

## Setup

### 1. Install Python Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

This installs:
- **Pillow**: For image to PDF conversion
- **pdf2docx**: For PDF to Word conversion  
- **docx2pdf**: For Word to PDF conversion
- **python-pptx** & **pdf2image**: For PDF to PowerPoint conversion (requires [Poppler](https://poppler.freedesktop.org/) binaries on your system for pdf2image).  Install Poppler and add its `bin` directory to your `PATH`, or set the `POPPLER_PATH` environment variable to point at the `bin` folder.  Without Poppler the server will return an error telling you to install it.

### 2. Install Node Dependencies and Start Server

```bash
npm install
npm start
```

The server will start on port **3000** by default. Configure `PORT` environment variable to change.

## Features

- Serves static files from the `Frontend` directory
- Converts images to PDF
- Converts PDF to Word documents
- Converts Word documents to PDF
- Converts PDF files to PowerPoint presentations (each page becomes a slide)
- File uploads with multer
- CORS and body parsing enabled

## Troubleshooting

**Error: "No module named 'PIL'"** or **"No module named 'pdf2docx'"**
- Reinstall Python dependencies: `pip install -r requirements.txt`
- Make sure you're using the correct Python version: `python --version`

**Error: "Conversion failed on server"**
- Check the server console output for detailed error messages
- Ensure all Python dependencies are properly installed
- Verify input files exist and are in supported formats

## Extending

New conversion types can be added by creating a Python helper script and
registering a corresponding route in `server.js`.  For example, the PDF→PPT
endpoint uses `convert_pdf_to_ppt.py` alongside `pdf2image` and `python-pptx`.
Add new routes or middleware in `server.js`.