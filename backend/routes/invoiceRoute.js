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
      headless: true, // Standard headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none", // Improves text rendering
      ],
    });

    // 🧩 Inject CSS to enforce true single-page geometry
    const htmlWithStyle = `
      <style>
        @page {
          size: A4 ${landscape ? "landscape" : "portrait"} !important;
          margin: 0 !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: ${landscape ? "297mm" : "210mm"} !important;
          height: ${landscape ? "210mm" : "297mm"} !important;
          overflow: hidden !important;
          background: white;
          display: flex !important;
          justify-content: center !important; /* 🎯 Absolute horizontal center */
          align-items: flex-start !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* The content wrapper that gets scaled */
        .pdf-scale-wrapper {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          transform-origin: top center !important;
          padding-top: 5mm !important; /* Some top breathing room */
          box-sizing: border-box !important;
        }
        /* Clean up any margins from the user-provided HTML */
        .pdf-scale-wrapper > * {
          margin: 0 !important; 
          flex-shrink: 0 !important;
        }
        * {
          page-break-inside: avoid !important;
          -webkit-print-color-adjust: exact !important;
        }
        ::-webkit-scrollbar { display: none !important; }
      </style>
      <div class="pdf-scale-wrapper">
        ${html}
      </div>
      <script>
        const wrapper = document.querySelector('.pdf-scale-wrapper');
        const targetHeight = ${landscape ? 210 : 297} * 3.78 - 40; // Approx px
        const currentHeight = wrapper.offsetHeight;
        
        if (currentHeight > targetHeight) {
          const scaleFactor = (targetHeight / currentHeight);
          wrapper.style.transform = "scale(" + Math.min(scaleFactor, 1) + ")";
        }
      </script>
    `;

    try {
      const page = await browser.newPage();

      // 🧩 Apply viewport based on orientation
      if (landscape) {
        await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
      } else {
        await page.setViewport({ width: 900, height: 1400, deviceScaleFactor: 2 });
      }

      // 🧩 Load HTML into Puppeteer
      await page.setContent(htmlWithStyle, { waitUntil: "networkidle0", timeout: 60000 });

      // Wait for a bit longer to ensure scaling script and layout settle
      await new Promise(r => setTimeout(r, 800));

      // 🧾 Generate PDF Buffer
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        landscape,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
        preferCSSPageSize: true
      });

      await browser.close();

      // 🧱 Send as pure binary
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="document-${Date.now()}.pdf"`);
      res.setHeader("Cache-Control", "no-store");
      res.end(pdfBuffer);

    } catch (pageError) {
      await browser.close();
      throw pageError;
    }

  } catch (error) {
    console.error("❌ PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;