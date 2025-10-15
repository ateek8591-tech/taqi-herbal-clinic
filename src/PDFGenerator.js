import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePatientPDF({ elementToRender, patient, lang = "en" }) {
  const canvas = await html2canvas(elementToRender, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "p" });
  const pageW = pdf.internal.pageSize.getWidth();
  const imgW = pageW - 40;
  const imgH = (canvas.height * imgW) / canvas.width;
  pdf.addImage(imgData, "PNG", 20, 20, imgW, imgH);
  const safeName = (patient.patientName || "NA").replace(/[^a-z0-9_\u0600-\u06FF ]/gi, "");
  pdf.save(`TAQI_CASE_${safeName}_${new Date().toISOString().slice(0,10)}.pdf`);
}
