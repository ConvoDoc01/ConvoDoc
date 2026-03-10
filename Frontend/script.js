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
    window.location.href = "Scan.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-WordCard").addEventListener("click", function () {
    window.location.href = "Pdf-to-Word.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-PPTCard").addEventListener("click", function () {
    window.location.href = "Pdf-to-Ppt.html";   // yaha apna split page ka naam likho
});
document.getElementById("PPT-to-PdfCard").addEventListener("click", function () {
    window.location.href = "Ppt-to-Pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-ExcelCard").addEventListener("click", function () {
    window.location.href = "Pdf-to-Excel.html";   // yaha apna split page ka naam likho
});
document.getElementById("Word-to-PdfCard").addEventListener("click", function () {
    window.location.href = "Word-to-Pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Excel-to-PdfCard").addEventListener("click", function () {
    window.location.href = "Excel-to-Pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Jpg-to-PdfCard").addEventListener("click", function () {
    window.location.href = "Jpg-to-Pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-JpgCard").addEventListener("click", function () {
    window.location.href = "Pdf-to-Jpg.html";   // yaha apna split page ka naam likho
});
document.getElementById("Html-to-PdfCard").addEventListener("click", function () {
    window.location.href = "Html-to-Pdf.html";   // yaha apna split page ka naam likho
});
document.getElementById("Pdf-to-HtmlCard").addEventListener("click", function () {
    window.location.href = "Pdf-to-Html.html";   // yaha apna split page ka naam likho
});
document.getElementById("ZipCard").addEventListener("click", function () {
    window.location.href = "ZipFile.html";   // yaha apna split page ka naam likho
});
document.getElementById("RotateCard").addEventListener("click", function () {
    window.location.href = "Rotate.html";   // yaha apna split page ka naam likho
});
document.getElementById("WatermarkCard").addEventListener("click", function () {
    window.location.href = "Watermark.html";   // yaha apna split page ka naam likho
});
document.getElementById("CropCard").addEventListener("click", function () {
    window.location.href = "Crop.html";   // yaha apna split page ka naam likho
});
document.getElementById("ProtectCard").addEventListener("click", function () {
    window.location.href = "Protect.html";   // yaha apna split page ka naam likho
});
document.getElementById("UnlockCard").addEventListener("click", function () {
    window.location.href = "Unlock.html";   // yaha apna split page ka naam likho
});


