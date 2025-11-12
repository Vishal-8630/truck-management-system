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
      // Collect styles from <style> and <link>
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      // Wrap target HTML in full document
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            ${styles}
            <style>
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>${ref.current.outerHTML}</body>
        </html>
      `;

      // Convert relative image paths → absolute URLs
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

        console.log("📦 Received bytes:", (res.data as ArrayBuffer).byteLength);

        const uint8Array = new Uint8Array(res.data); // ✅ FIX
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
    clone.style.width = orientation === "l" ? "297mm" : "210mm";
    clone.style.margin = "0 auto";
    clone.style.fontSize = "12px";
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top left";
    clone.classList.add("pdf-mode");
    document.body.appendChild(clone);

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
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const horizontalPadding = 5;
    const verticalPadding = 5;
    const availableWidth = pdfWidth - horizontalPadding * 2;
    const availableHeight = pdfHeight - verticalPadding * 2;

    let renderWidth = availableWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > availableHeight) {
      const scaleFactor = availableHeight / renderHeight;
      renderWidth *= scaleFactor;
      renderHeight = availableHeight;
    }

    const x = horizontalPadding + (availableWidth - renderWidth) / 2;
    const y = verticalPadding;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
    pdf.save(filename);

    document.body.removeChild(clone);
  };

  return handleDownload;
};
