function filterSelection(category) {

let cards = document.querySelectorAll('.card');
let buttons = document.querySelectorAll('.filters button');

// active button
buttons.forEach(btn => btn.classList.remove("active"));
event.target.classList.add("active");

cards.forEach(card => {

if (category === "all") {
card.style.display = "block";
}

else if (card.dataset.category === category) {
card.style.display = "block";
}

else {
card.style.display = "none";
}

});

}

document.getElementById("mergePdfCard").addEventListener("click", function () {
    window.location.href = "merge.html";   // yaha apna new page ka naam likho
});
document.getElementById("splitPdfCard").addEventListener("click", function () {
    window.location.href = "split.html";   // yaha apna split page ka naam likho
});
document.getElementById("scanPdfCard").addEventListener("click", function () {
    window.location.href = "scan.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-WordCard").addEventListener("click", function () {
    window.location.href = "pdf-to-word.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-PPTCard").addEventListener("click", function () {
    window.location.href = "pdf-to-ppt.html";   // yaha apna split page ka naam likho
});
document.getElementById("PPT-to-PdfCard").addEventListener("click", function () {
    window.location.href = "ppt-to-pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-ExcelCard").addEventListener("click", function () {
    window.location.href = "pdf-to-excel.html";   // yaha apna split page ka naam likho
});
document.getElementById("Word-to-PdfCard").addEventListener("click", function () {
    window.location.href = "word-to-pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Excel-to-PdfCard").addEventListener("click", function () {
    window.location.href = "excel-to-pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Jpg-to-PdfCard").addEventListener("click", function () {
    window.location.href = "jpg-to-pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-JpgCard").addEventListener("click", function () {
    window.location.href = "pdf-to-jpg.html";   // yaha apna split page ka naam likho
});
document.getElementById("Html-to-PdfCard").addEventListener("click", function () {
    window.location.href = "html-to-pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-HtmlCard").addEventListener("click", function () {
    window.location.href = "pdf-to-html.html";   // yaha apna split page ka naam likho
});
document.getElementById("ZipCard").addEventListener("click", function () {
    window.location.href = "zip-file.html";   // yaha apna split page ka naam likho
});
document.getElementById("RotateCard").addEventListener("click", function () {
    window.location.href = "rotate.html";   // yaha apna split page ka naam likho
});
document.getElementById("WatermarkCard").addEventListener("click", function () {
    window.location.href = "watermark.html";   // yaha apna split page ka naam likho
});
document.getElementById("CropCard").addEventListener("click", function () {
    window.location.href = "crop.html";   // yaha apna split page ka naam likho
});
document.getElementById("ProtectCard").addEventListener("click", function () {
    window.location.href = "protect.html";   // yaha apna split page ka naam likho
});
document.getElementById("UnlockCard").addEventListener("click", function () {
    window.location.href = "unlock.html";   // yaha apna split page ka naam likho
});


