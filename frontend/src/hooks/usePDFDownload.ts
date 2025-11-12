import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDispatch } from "react-redux";
import { addMessage } from "../features/message";
import type { AppDispatch } from "../app/store";
import api from "../api/axios";

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
  serverMode = true,
}: UsePDFDownloadOptions<T>) => {
  const dispatch: AppDispatch = useDispatch();

  const handleDownload = async (): Promise<void> => {
    if (!data || !Object.keys(data).length) {
      dispatch(addMessage({ type: "error", text: emptyMessage }));
      return;
    }

    if (!ref.current) return;
    console.log(`Download clicked from ${isMobile ? "Mobile" : "Laptop"}`);

    // ================== MOBILE / SERVER FLOW ==================
    if (isMobile && serverMode) {
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            ${styles}
          </head>
          <body>${ref.current.outerHTML}</body>
        </html>
      `;

      const baseURL = window.location.origin;
      const processedHTML = html.replace(
        /src="\/(.*?)"/g,
        (_, p1) => `src="${baseURL}/${p1}"`
      );

      try {
        const res = await api.post(
          endpoint,
          { html: processedHTML, landscape: orientation === "l" },
          {
            responseType: "arraybuffer",
            transformResponse: [(data) => data],
          }
        );

        const uint8Array = new Uint8Array(res.data);
        const blob = new Blob([uint8Array], { type: "application/pdf" });

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        dispatch(addMessage({ type: "success", text: "PDF downloaded!" }));
      } catch (error) {
        console.error("PDF generation error:", error);
        dispatch(addMessage({ type: "error", text: "Failed to generate PDF" }));
      }

      return;
    }

    // ================== DESKTOP / CLIENT FLOW ==================
    const clone = ref.current.cloneNode(true) as HTMLElement;

    // 🧩 Inject same Puppeteer-like CSS
    const style = document.createElement("style");
    style.textContent = `
      @page {
        size: A4 ${orientation === "l" ? "landscape" : "portrait"} !important;
        margin: 5mm;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: ${orientation === "l" ? "297mm" : "210mm"} !important;
        height: ${orientation === "l" ? "210mm" : "297mm"} !important;
        overflow: hidden !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      * {
        page-break-before: avoid !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
      body {
        transform: scale(0.98);
        transform-origin: top left;
      }
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
    `;
    clone.prepend(style);

    clone.style.width = orientation === "l" ? "297mm" : "210mm";
    clone.style.margin = "0 auto";
    clone.style.background = "#fff";
    document.body.appendChild(clone);

    // 🖼️ Render to canvas
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF(orientation, "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;

    const renderWidth = pdfWidth - margin * 2;
    const renderHeight = (canvas.height * renderWidth) / canvas.width;

    const x = margin;
    const y = margin;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
    pdf.save(filename);

    document.body.removeChild(clone);
  };

  return handleDownload;
};