import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useMessageStore } from "@/store/useMessageStore";
import api from "@/api/axios";

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

interface UsePDFDownloadOptions<T> {
  ref: React.RefObject<HTMLDivElement | null>;
  data: T | null;
  emptyMessage?: string;
  filename?: string;
  orientation?: "p" | "l";
  endpoint?: string;
  serverMode?: boolean;
}

export const usePDFDownload = <T>({
  ref,
  data,
  emptyMessage = "Missing data. Please search or select first.",
  filename = "document.pdf",
  orientation = "p",
  endpoint = "/invoice/generate-pdf",
  serverMode = false,
}: UsePDFDownloadOptions<T>) => {
  const { addMessage } = useMessageStore();

  const handleDownload = async (): Promise<void> => {
    if (!data || !Object.keys(data).length) {
      addMessage({ type: "error", text: emptyMessage });
      return;
    }

    if (!ref.current) return;
    console.log(`Download clicked from ${isMobile ? "Mobile" : "Laptop"}`);

    // ================== SERVER FLOW (Accurate Puppeteer) ==================
    if (serverMode) {
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      // Inject some print-specific CSS to ensure it looks good in Puppeteer
      const printStyles = `
        <style>
          @page {
            size: A4 ${orientation === "l" ? "landscape" : "portrait"} !important;
            margin: 5mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .card-premium {
            border: 1px solid #f1f5f9 !important;
            box-shadow: none !important;
            background: white !important;
          }
        </style>
      `;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            ${styles}
            ${printStyles}
          </head>
          <body style="background: white;">${ref.current.outerHTML}</body>
        </html>
      `;

      const baseURL = window.location.origin;
      const processedHTML = html.replace(
        /src="\/(.*?)"/g,
        (_, p1) => `src="${baseURL}/${p1}"`
      );

      try {
        addMessage({ type: "info", text: "Generating high-quality PDF..." });

        const res = await api.post(
          endpoint,
          { html: processedHTML, landscape: orientation === "l" },
          {
            responseType: "blob",
          }
        );

        const blob = new Blob([res.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        addMessage({ type: "success", text: "PDF downloaded!" });
      } catch (error) {
        console.error("PDF generation error:", error);
        addMessage({ type: "error", text: "Failed to generate PDF" });
      }

      return;
    }

    // ================== DESKTOP / CLIENT FLOW (toPng fallback) ==================
    if (!ref.current) return;
    const originalDisplay = ref.current.style.display;
    const originalPosition = ref.current.style.position;
    const originalLeft = ref.current.style.left;
    const originalClasses = ref.current.className;

    try {
      addMessage({ type: "info", text: "Capturing high-fidelity document..." });

      // 👁️ Reveal the hidden printable element temporarily for the capture engine
      ref.current.style.display = "block";
      ref.current.style.position = "fixed";
      ref.current.style.left = "0";
      ref.current.style.top = "0";
      ref.current.style.zIndex = "-9999";
      ref.current.classList.remove('hidden');

      // 🖼️ Render to high-quality Image using html-to-image (Supports oklch/modern CSS)
      const imgData = await toPng(ref.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          margin: '0',
          padding: '0',
          background: 'white',
          overflow: 'hidden',
          width: orientation === "l" ? "297mm" : "210mm",
          minHeight: orientation === "l" ? "210mm" : "297mm",
          boxSizing: 'border-box',
        },
        filter: (node) => {
          if (!node || !node.classList) return true;
          const exclusionKeywords = ['print:hidden', 'btn', 'button', 'nav', 'sidebar'];
          return !exclusionKeywords.some(keyword => 
            Array.from(node.classList).some(cls => cls.includes(keyword))
          );
        }
      });

      const pdf = new jsPDF(orientation, "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;

      const maxRenderWidth = pdfWidth - margin * 2;
      const maxRenderHeight = pdfHeight - margin * 2;

      // Natural dimensions check
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));

      let finalWidth = maxRenderWidth;
      let finalHeight = (img.height * finalWidth) / img.width;

      if (finalHeight > maxRenderHeight) {
        finalHeight = maxRenderHeight;
        finalWidth = (img.width * finalHeight) / img.height;
      }

      const x = margin + (maxRenderWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight, undefined, "FAST");
      pdf.save(filename);

      addMessage({ type: "success", text: "PDF downloaded!" });
    } catch (err) {
      console.error("PDF Client Generation error:", err);
      addMessage({ type: "error", text: "Failed to generate PDF locally" });
    } finally {
      if (ref.current) {
        ref.current.style.display = originalDisplay;
        ref.current.style.position = originalPosition;
        ref.current.style.left = originalLeft;
        ref.current.className = originalClasses;
      }
    }
  };

  return handleDownload;
};