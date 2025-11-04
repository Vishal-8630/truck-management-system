import { useDispatch } from "react-redux";
import { addMessage } from "../features/message";
import type { AppDispatch } from "../app/store";
import api from "../api/axios";
import { useReactToPrint } from "react-to-print";

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

interface UsePDFPrintOptions<T> {
  /** Ref of the element you want to print */
  ref: React.RefObject<HTMLDivElement | null>;
  /** The data object (like entry, report, etc.) */
  data: T | null;
  /** Message to show if data is missing */
  emptyMessage?: string;
  /** Page orientation ('p' for portrait, 'l' for landscape) */
  orientation?: "p" | "l";
  /** Server endpoint for mobile print generation */
  endpoint?: string;
  /** Whether to use Puppeteer server route for mobile */
  serverMode?: boolean;
}

/**
 * Generic hook for printing PDFs (client + server)
 * Works with any DOM ref and data type.
 */
export const usePDFPrint = <T>({
  ref,
  data,
  emptyMessage = "Missing data. Please search or select first.",
  orientation = "p",
  endpoint = "/invoice/generate-pdf",
  serverMode = true,
}: UsePDFPrintOptions<T>) => {
  const dispatch: AppDispatch = useDispatch();

  // ✅ Setup printer once — cannot be inside another function
  const printNow = useReactToPrint({
    contentRef: ref,
    documentTitle: "Invoice",
    pageStyle: `
      @page {
        size: A4 ${orientation === "l" ? "landscape" : "portrait"};
        margin: 5mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        font-family: Arial, sans-serif;
      }
    `,
  });

  const handlePrint = async (): Promise<void> => {
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
        window.open(blobUrl, "_blank"); // 👈 opens in new tab on mobile
        dispatch(
          addMessage({ type: "success", text: "Opening PDF for print..." })
        );
      } catch (error) {
        console.error("PDF print error:", error);
        dispatch(
          addMessage({
            type: "error",
            text: "Failed to generate printable PDF",
          })
        );
      }

      return;
    }

    // ========== DESKTOP / CLIENT FLOW ==========
    if (printNow) {
      printNow(); // 👈 just trigger the print
    } else {
      dispatch(addMessage({ type: "error", text: "Print function not ready." }));
    }
  };

  return handlePrint;
};