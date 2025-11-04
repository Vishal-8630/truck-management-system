import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDispatch } from "react-redux";
import { addMessage } from "../features/message";
import type { AppDispatch } from "../app/store";
import api from "../api/axios";

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

interface UsePDFDownloadOptions<T> {
  /** Ref of the element you want to capture */
  ref: React.RefObject<HTMLDivElement | null>;
  /** The data object (like entry, report, etc.) */
  data: T | null;
  /** Message to show if data is missing */
  emptyMessage?: string;
  /** Filename for the saved PDF */
  filename?: string;
  /** Page orientation ('p' for portrait, 'l' for landscape) */
  orientation?: "p" | "l";
  /** Server endpoint for mobile PDF generation */
  endpoint?: string;
  /** Whether to use Puppeteer server route for mobile */
  serverMode?: boolean;
}

/**
 * Generic hook for printing or downloading PDFs (client + server)
 * Works with any DOM ref and data type.
 */
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
    // Handle empty or missing data
    if (!data || !Object.keys(data).length) {
      dispatch(addMessage({ type: "error", text: emptyMessage }));
      return;
    }

    if (!ref.current) return;

    // ========== MOBILE / SERVER FLOW ==========
    if (isMobile && serverMode) {
      const html = ref.current.outerHTML;

      try {
        const res = await api.post<Blob>(
          endpoint,
          { html, landscape: orientation === "l" },
          { responseType: "blob" }
        );

        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);

        dispatch(addMessage({ type: "success", text: "PDF downloaded!" }));
      } catch (error) {
        console.error("PDF generation error:", error);
        dispatch(addMessage({ type: "error", text: "Failed to generate PDF" }));
      }
      return;
    }

    // ========== DESKTOP / CLIENT FLOW ==========
    const clone = ref.current.cloneNode(true) as HTMLElement;
    clone.style.width =
      orientation === "l" ? "297mm" : "210mm"; // A4 Landscape / Portrait
    clone.style.margin = "0 auto";

    // 🔧 Optional tweak: smaller base font for consistent scaling
    clone.style.fontSize = "12px";
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top left";
    

    // Add temporary class for PDF styling
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

    // Reduce side & top gaps
    const horizontalPadding = 5; // mm – adjust for side spacing
    const verticalPadding = 5;   // mm – adjust for top/bottom spacing
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