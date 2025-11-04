import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
    try {
        const { html, landscape = false } = req.body;

        if (!html) {
            return res.status(400).json({ message: "No HTML provided" });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            landscape,
            margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
        });

        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="invoice.pdf"',
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF generation error: ", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

export default router;