import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  try {
    const { html, landscape = false } = req.body;

    if (!html) {
      return res.status(400).json({ message: "No HTML provided" });
    }

    // 🧩 Important for Render: use these flags
    const browser = await puppeteer.launch({
      headless: "new", // or true, both work fine
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();

    // ✅ waitUntil ensures all resources load before printing
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape,
      margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
    });

    await browser.close();

    // ✅ Proper headers for browser + mobile support
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="invoice.pdf"', // change to 'attachment;' if you prefer auto-download
      "Cache-Control": "no-store",
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;