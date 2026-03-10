const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// -----------------------------------------------------------------------------
// Serve the frontend static files so the same server can host the UI.  This way a
// GET / request will return index.html instead of "Cannot GET /" and users can
// open http://localhost:3000 in a browser.
// -----------------------------------------------------------------------------
const frontendPath = path.join(__dirname, '..', 'Frontend');
app.use(express.static(frontendPath));

// send index.html for any other non-API GET requests (spa fallback)
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();

  // if the request appears to be for an API route, skip
  if (req.path.startsWith('/convert') || req.path.startsWith('/uploads')) {
    return next();
  }

  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ================= FILE UPLOAD SETUP =================

const uploadFolder = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ================= STATIC FILE ACCESS =================
app.use('/uploads', express.static(uploadFolder));


// ================= PDF -> WORD ROUTE =================
app.post('/convert/pdf-to-word', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  
  const originalName = path.parse(req.file.originalname).name;
  const outputFilename = originalName + '.docx';
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, 'convert_pdf_to_word.py');
  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Conversion error:", err);
      return res.status(500).json({ message: "Conversion failed" });
    }

    // ✅ SEND DOWNLOAD LINK INSTEAD OF FILE
    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });
  });
});

const { spawn } = require('child_process');


// ================= WORD -> PDF ================= //
app.post('/convert/word-to-pdf', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputPath = req.file.path;

  const originalName = path.parse(req.file.originalname).name;
  const outputFilename = originalName + ".pdf";
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, "convert_word_to_pdf.py");

  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (err, stdout, stderr) => {

    if (err) {
      console.error("Conversion error:", err);
      return res.status(500).json({ message: "Conversion failed" });
    }

    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });

  });

});



// ==================== Excel-> PDF ====================== //

app.post("/convert/excel-to-pdf", upload.single("file"), (req, res) => {

  const inputPath = req.file.path;
  const outputDir = path.join(__dirname, "uploads");

  exec(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`, (error) => {

    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Conversion failed" });
    }

    const fileName = path.basename(inputPath).replace(/\.(xlsx|xls)/, ".pdf");
    const pdfPath = "/uploads/" + fileName;

    res.json({
      downloadUrl: pdfPath
    });

  });

});

// ================= PDF -> PPT (Clean Version) =================
app.post('/convert/pdf-to-ppt', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const libreOfficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.com"`;

  const safeName = Date.now() + "-" + path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const inputPath = req.file.path;
  const renamedPdfPath = path.join(uploadFolder, safeName + ".pdf");

  // rename file to remove spaces
  fs.renameSync(inputPath, renamedPdfPath);

  // STEP 1: PDF → ODP
  const step1 = `${libreOfficePath} --headless --norestore --nolockcheck --infilter="impress_pdf_import" --convert-to odp --outdir "${uploadFolder}" "${renamedPdfPath}"`;

  exec(step1, (err) => {
    if (err) {
      console.error("Step 1 failed:", err);
      return res.status(500).json({ message: "PDF import failed" });
    }

    const odpPath = path.join(uploadFolder, safeName + ".odp");

    if (!fs.existsSync(odpPath)) {
      return res.status(500).json({ message: "ODP file not created" });
    }

    // STEP 2: ODP → PPTX
    const step2 = `${libreOfficePath} --headless --norestore --nolockcheck --convert-to pptx --outdir "${uploadFolder}" "${odpPath}"`;

    exec(step2, (err2) => {
      if (err2) {
        console.error("Step 2 failed:", err2);
        return res.status(500).json({ message: "PPT conversion failed" });
      }

      const pptPath = path.join(uploadFolder, safeName + ".pptx");

      if (!fs.existsSync(pptPath)) {
        return res.status(500).json({ message: "Output file not created" });
      }

      // ===== STEP 3: CLEAN PPT =====
      const cleanScript = path.join(__dirname, 'clean_ppt_layout.py');
      const cleanedOutput = path.join(uploadFolder, safeName + "_cleaned.pptx");

      const cleanCommand = `python "${cleanScript}" "${pptPath}" "${cleanedOutput}"`;

      exec(cleanCommand, (cleanErr) => {
        if (cleanErr) {
          console.error("Cleaning failed:", cleanErr);
          return res.status(500).json({ message: "Cleaning failed" });
        }

        // cleanup temp files
        if (fs.existsSync(odpPath)) fs.unlinkSync(odpPath);
        if (fs.existsSync(renamedPdfPath)) fs.unlinkSync(renamedPdfPath);
        if (fs.existsSync(pptPath)) fs.unlinkSync(pptPath);

        res.json({
          downloadUrl: `/uploads/${safeName}_cleaned.pptx`
        });
      });

    });
  });
});

  // ==================== PPT -> PDF =================== //
app.post('/convert/ppt-to-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const libreOfficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.com"`;

  const safeName = Date.now() + "-" + 
    path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const inputPath = req.file.path;
  const renamedPptPath = path.join(uploadFolder, safeName + path.extname(req.file.originalname));

  // rename to remove spaces
  fs.renameSync(inputPath, renamedPptPath);

  const command = `${libreOfficePath} --headless --norestore --nolockcheck --convert-to pdf --outdir "${uploadFolder}" "${renamedPptPath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Conversion failed:", err);
      return res.status(500).json({ message: "Conversion failed" });
    }

    const outputPdfPath = path.join(uploadFolder, safeName + ".pdf");

    if (!fs.existsSync(outputPdfPath)) {
      return res.status(500).json({ message: "Output file not created" });
    }

    // optional cleanup
    if (fs.existsSync(renamedPptPath)) {
      fs.unlinkSync(renamedPptPath);
    }

    res.json({
      downloadUrl: `/uploads/${safeName}.pdf`
    });
  });
});

// ======================= PDF -> EXCEL (Python Based) =================== //
app.post('/convert/pdf-to-excel', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const safeName = Date.now() + "-" + 
    path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const inputPath = req.file.path;
  const outputPath = path.join(uploadFolder, safeName + ".xlsx");

  const pythonScript = path.join(__dirname, "pdf_to_excel.py");

  const command = `python "${pythonScript}" "${inputPath}" "${outputPath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Conversion failed:", err);
      return res.status(500).json({ message: "Conversion failed" });
    }

    res.json({
      downloadUrl: `/uploads/${safeName}.xlsx`
    });
  });
});

// ================= Scan -> PDF ROUTE ================= //
app.post('/convert/scan-to-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  
  const originalName = path.parse(req.file.originalname).name;
  const outputFilename = originalName + '.pdf';
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, 'convert_scan_to_pdf.py');
  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Conversion error:", err);
      console.error("Python error output:", stderr);
      return res.status(500).json({ message: "Conversion failed: " + stderr });
    }

    if (stderr) {
      console.warn("Python warnings:", stderr);
    }

    // Check if output file was created
    if (!fs.existsSync(outputPath)) {
      console.error("Output file was not created");
      return res.status(500).json({ message: "Conversion failed: Output file not created" });
    }

    // ✅ SEND DOWNLOAD LINK INSTEAD OF FILE
    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });
  });
});

// ================= IMAGE -> PDF =================== //
app.post("/convert/image-to-pdf", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const inputPath = req.file.path;

  const originalName = path.parse(req.file.originalname).name.replace(/\s+/g, "_");
  const outputFilename = originalName + ".pdf";
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, "convert_image_to_pdf.py");

  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      console.error("Conversion error:", error);
      console.error(stderr);
      return res.status(500).json({ message: "Conversion failed" });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ message: "Output file not created" });
    }

    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });

  });

});

// ================= PDF -> JPG ================= //
app.post('/convert/pdf-to-jpg', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const inputPath = req.file.path;

  const safeName = Date.now() + "-" +
    path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const outputFilename = safeName + ".jpg";
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, "convert_pdf_to_jpg.py");

  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      console.error("Conversion error:", error);
      return res.status(500).json({ message: "Conversion failed" });
    }

    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });

  });

});
  
// ================= HTML -> PDF ================= //
app.post('/convert/html-to-pdf', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const inputPath = req.file.path;

  const safeName = Date.now() + "-" +
    path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const outputFilename = safeName + ".pdf";
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, "convert_html_to_pdf.py");

  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      console.error("Conversion error:", error);
      return res.status(500).json({ message: "Conversion failed" });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ message: "PDF not created" });
    }

    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });

  });

});


// ================= PDF -> HTML ================= //
app.post('/convert/pdf-to-html', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const inputPath = req.file.path;

  const safeName = Date.now() + "-" +
    path.parse(req.file.originalname).name.replace(/\s+/g, "_");

  const outputFilename = safeName + ".html";
  const outputPath = path.join(uploadFolder, outputFilename);

  const scriptPath = path.join(__dirname, "convert_pdf_to_html.py");

  const command = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      console.error("Conversion error:", error);
      return res.status(500).json({ message: "Conversion failed" });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ message: "HTML not created" });
    }

    res.json({
      downloadUrl: `/uploads/${outputFilename}`
    });

  });

});


// ================= FOLDER -> ZIP ================= //
app.post("/convert/folder-to-zip", upload.array("files"), (req, res) => {

if(!req.files){
return res.status(400).json({error:"No files uploaded"});
}

// folder name nikalna
const folderName = req.body.folderName || "converted_folder";


// zip name same folder name
const zipName = folderName + ".zip";

const outputPath = path.join(__dirname,"uploads",zipName);

const archiver = require("archiver");
const fs = require("fs");

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip",{zlib:{level:9}});

output.on("close",()=>{

res.json({
downloadUrl:"/uploads/"+zipName
});

});

archive.pipe(output);

// sari files zip me add
req.files.forEach(file=>{
archive.file(file.path,{name:file.webkitRelativePath});
});

archive.finalize();

});

// ================= ROTATE PDF ================= //
app.post('/convert/rotate-pdf', upload.single('file'), async (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

try{

const rotation = parseInt(req.body.rotation || "90");

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g, "_");

const outputFilename = safeName + "-rotated.pdf";
const outputPath = path.join(uploadFolder, outputFilename);

const { PDFDocument, degrees } = require('pdf-lib');

const bytes = fs.readFileSync(inputPath);

const pdf = await PDFDocument.load(bytes);

const pages = pdf.getPages();

pages.forEach(page => {
page.setRotation(degrees(rotation));
});

const pdfBytes = await pdf.save();

fs.writeFileSync(outputPath, pdfBytes);

res.json({
downloadUrl: `/uploads/${outputFilename}`
});

}catch(err){
console.error(err);
res.status(500).json({message:"Rotation failed"});
}

});

// ================= PDF WATERMARK ================= //
app.post('/convert/pdf-watermark', upload.single('file'), (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g, "_");

const outputFilename = safeName + "-watermark.pdf";
const outputPath = path.join(uploadFolder, outputFilename);

const watermarkText = req.body.watermark || "CONFIDENTIAL";

const scriptPath = path.join(__dirname, "add_watermark.py");

const command = `python "${scriptPath}" "${inputPath}" "${outputPath}" "${watermarkText}"`;

exec(command, (error, stdout, stderr) => {

if (error) {
console.error("Watermark error:", error);
return res.status(500).json({ message: "Watermark failed" });
}

res.json({
downloadUrl: `/uploads/${outputFilename}`
});

});

});

// ================= CURSOR CROP PDF ================= //
app.post('/convert/crop-pdf', upload.single('file'), (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g,"_");

const outputFilename = safeName + "-cursor-cropped.pdf";

const outputPath = path.join(uploadFolder, outputFilename);

// values coming from cropper
const x = req.body.x || 0;
const y = req.body.y || 0;
const width = req.body.width || 0;
const height = req.body.height || 0;

const scriptPath = path.join(__dirname,"crop_pdf.py");

const command =
`python "${scriptPath}" "${inputPath}" "${outputPath}" ${x} ${y} ${width} ${height}`;

exec(command,(error)=>{

if(error){
console.error("Crop Error:",error);
return res.status(500).json({message:"Crop failed"});
}

res.json({
downloadUrl:`/uploads/${outputFilename}`
});

});

});


// ================= PDF PROTECTOR ================= //
app.post('/convert/pdf-protect', upload.single('file'), (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

const password = req.body.password;

if (!password) {
return res.status(400).json({ message: "Password required" });
}

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g,"_");

const outputFilename = safeName + "-protected.pdf";

const outputPath = path.join(uploadFolder, outputFilename);

const scriptPath = path.join(__dirname,"protect_pdf.py");

const command = `python "${scriptPath}" "${inputPath}" "${outputPath}" "${password}"`;

exec(command,(error,stdout,stderr)=>{

if(error){
console.error("Protection error:",error);
return res.status(500).json({message:"Protection failed"});
}

res.json({
downloadUrl:`/uploads/${outputFilename}`
});

});

});


// ================= PDF UNLOCK ================= //
app.post('/convert/pdf-unlock', upload.single('file'), (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

const password = req.body.password;

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g,"_");

const outputFilename = safeName + "-unlocked.pdf";

const outputPath = path.join(uploadFolder, outputFilename);

const scriptPath = path.join(__dirname,"unlock_pdf.py");

const command = `python "${scriptPath}" "${inputPath}" "${outputPath}" "${password}"`;

exec(command,(error,stdout,stderr)=>{

if(error){
console.error("Unlock error:",error);
console.error(stderr);
return res.status(500).json({message:"Wrong password or unlock failed"});
}

if(!fs.existsSync(outputPath)){
return res.status(500).json({message:"Unlock failed"});
}

res.json({
downloadUrl:`/uploads/${outputFilename}`
});

});

});


// ================= MERGE ROUTE ================= //

app.post('/merge', upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  try {
    const pdfPaths = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.doc' || ext === '.docx') {
        // convert word document to temporary pdf
        const convertedPath = file.path + '.pdf';
        const scriptPath = path.join(__dirname, 'convert_word_to_pdf.py');
        const cmd = `python "${scriptPath}" "${file.path}" "${convertedPath}"`;
        await new Promise((resolve, reject) => {
          exec(cmd, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        pdfPaths.push(convertedPath);
      } else if (ext === '.pdf') {
        pdfPaths.push(file.path);
      } else {
        // ignore unsupported file types
      }
    }

    if (pdfPaths.length === 0) {
      return res.status(400).json({ message: 'No PDF files to merge' });
    }

    // merge with pdf-lib
    const { PDFDocument } = require('pdf-lib');
    const mergedPdf = await PDFDocument.create();

    for (const p of pdfPaths) {
      const bytes = fs.readFileSync(p);
      const pdf = await PDFDocument.load(bytes);
      const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copied.forEach(page => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const outputFilename = `merged-${Date.now()}.pdf`;
    const outputPath = path.join(uploadFolder, outputFilename);
  
    fs.writeFileSync(outputPath, mergedBytes);

    res.json({ downloadUrl: `/uploads/${outputFilename}` });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).json({ message: 'Merge failed' });
  }
});

  
  // ================= PDF UNLOCK ================= //

app.post('/convert/pdf-unlock', upload.single('file'), (req, res) => {

if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}

const password = req.body.password;

const inputPath = req.file.path;

const safeName = Date.now() + "-" +
path.parse(req.file.originalname).name.replace(/\s+/g,"_");

const outputFilename = safeName + "-unlocked.pdf";

const outputPath = path.join(uploadFolder, outputFilename);

const scriptPath = path.join(__dirname,"unlock_pdf.py");

const command = `python "${scriptPath}" "${inputPath}" "${outputPath}" "${password}"`;

exec(command,(error)=>{

if(error){
console.error("Unlock error:",error);
return res.status(500).json({message:"Wrong password or unlock failed"});
}

res.json({
downloadUrl:`/uploads/${outputFilename}`
});

});

});

  
// ================= SPLIT ROUTE ================= //

app.post('/split', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    let pdfPath = req.file.path;
    const originalName = path.parse(req.file.originalname).name;

    // If Word document, convert to PDF first using existing helper
    if (ext === '.doc' || ext === '.docx') {
      const convertedPath = pdfPath + '.pdf';
      const scriptPath = path.join(__dirname, 'convert_word_to_pdf.py');
      const cmd = `python "${scriptPath}" "${pdfPath}" "${convertedPath}"`;
      await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      pdfPath = convertedPath;
    } else if (ext !== '.pdf') {
      return res.status(400).json({ message: 'Unsupported file type for splitting' });
    }

    // Load PDF and split pages
    const { PDFDocument } = require('pdf-lib');
    const bytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(bytes);
    const pageCount = pdf.getPageCount();

    const archiver = require('archiver');
    const zipFilename = `${originalName}-pages.zip`;
    const zipPath = path.join(uploadFolder, zipFilename);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);
      const pageBytes = await newPdf.save();
      const pageFilename = `${originalName}-page-${i + 1}.pdf`;
      const buf = Buffer.isBuffer(pageBytes) ? pageBytes : Buffer.from(pageBytes);
      archive.append(buf, { name: pageFilename });
    }

    await archive.finalize();

    // wait for the write stream to close before responding
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('end', resolve);
      archive.on('error', reject);
      output.on('error', reject);
    });

    res.json({ downloadUrl: `/uploads/${zipFilename}` });
  } catch (err) {
    console.error('Split error:', err);
    res.status(500).json({ message: 'Split failed' });
  }
});

// ================= SERVER START ================= //
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// gracefully handle "port already in use" errors so the developer can see a
// descriptive message instead of the process crashing with an unhandled
// exception.  This is the issue the user was hitting when npm start failed
// with EADDRINUSE.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is already in use. ` +
      'Make sure no other instance is running or choose a different port.');
  } else {
    console.error('Server error:', err);
  }
});
