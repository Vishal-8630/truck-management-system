import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";

const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  try {
    // Extract and normalize request body
    let { html, landscape } = req.body;
    landscape = landscape === true || landscape === "true"; // ensure boolean

    if (!html) {
      return res.status(400).json({ message: "No HTML provided" });
    }

    // 🧠 Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();

    // 🧩 Apply viewport based on orientation
    if (landscape) {
      await page.setViewport({ width: 1600, height: 900 }); // landscape
    } else {
      await page.setViewport({ width: 1100, height: 1600 }); // portrait
    }

    // 🧩 Inject CSS to enforce true landscape geometry
    const htmlWithStyle = `
      <style>
        @page {
          size: A4 ${landscape ? "landscape" : "portrait"} !important;
          margin: 5mm;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: ${landscape ? "297mm" : "210mm"} !important;
          height: ${landscape ? "210mm" : "297mm"} !important;
          overflow: hidden !important;             /* don't let content push a second page */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* keep everything on one page */
        * {
          page-break-before: avoid !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }

        /* shrink slightly so it always fits */
        body {
          transform: scale(0.98);
          transform-origin: top left;
        }

        /* smaller header & logo for better fit */
        #logo {
          width: 80px !important;
          height: 60px !important;
        }

        #title {
          font-size: 2.5rem !important;
          font-weight: 700 !important;
          text-transform: uppercase;
        }

        .header {
          padding: 4mm 0 !important;
        }

        body::-webkit-scrollbar {
          display: none;
        }
        body > * {
          width: 100% !important;
          max-width: 100% !important;
        }
      </style>
      ${html}
    `;

    // 🧩 Load HTML into Puppeteer
    await page.setContent(htmlWithStyle, { waitUntil: "networkidle0" });

    // 🧾 Generate PDF Buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape,
      margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
    });

    await browser.close();

    // 🧱 Send as pure binary
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(Buffer.from(pdfBuffer), "binary");

  } catch (error) {
    console.error("❌ PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;