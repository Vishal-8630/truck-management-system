import { useDispatch } from "react-redux";
import { addMessage } from "../features/message";
import type { AppDispatch } from "../app/store";
import api from "../api/axios";
import { useReactToPrint } from "react-to-print";

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

interface UsePDFPrintOptions<T> {
  ref: React.RefObject<HTMLDivElement | null>;
  data: T | null;
  emptyMessage?: string;
  orientation?: "p" | "l";
  endpoint?: string;
  serverMode?: boolean;
}

export const usePDFPrint = <T>({
  ref,
  data,
  emptyMessage = "Missing data. Please search or select first.",
  orientation = "p",
  endpoint = "/invoice/generate-pdf",
  serverMode = true,
}: UsePDFPrintOptions<T>) => {
  const dispatch: AppDispatch = useDispatch();

  const pageOrientation = orientation === "l" ? "landscape" : "portrait";

  const printNow = useReactToPrint({
    contentRef: ref,
    documentTitle: "Invoice",
    pageStyle: `
      @page {
        size: A4 ${pageOrientation};
        margin: 5mm;
      }

      @media print {
        html, body {
          width: ${pageOrientation === "landscape" ? "297mm" : "210mm"};
          height: ${pageOrientation === "landscape" ? "210mm" : "297mm"};
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
      }
    `,
  });

  const handlePrint = async (): Promise<void> => {
    if (!data || !Object.keys(data).length) {
      dispatch(addMessage({ type: "error", text: emptyMessage }));
      return;
    }

    if (!ref.current) return;
    console.log(`Print clicked from ${isMobile ? "Mobile" : "Laptop"}`);

    // ========== MOBILE / SERVER FLOW ==========
    if (isMobile && serverMode) {
      // Collect <style> + <link> CSS from document head
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      // Wrap the target HTML in a full printable document
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
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>${ref.current.outerHTML}</body>
        </html>
      `;

      // Convert relative URLs → absolute (important for images, CSS)
      const baseURL = window.location.origin;
      const processedHTML = html.replace(
        /src="\/(.*?)"/g,
        (_, p1) => `src="${baseURL}/${p1}"`
      );

      try {
        const res = await api.post<Blob>(
          endpoint,
          { html: processedHTML, landscape: orientation === "l" },
          { responseType: "blob" }
        );

        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank"); // Opens PDF in new tab (for printing)
        dispatch(
          addMessage({ type: "success", text: "Opening styled PDF for print..." })
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
      printNow();
    } else {
      dispatch(addMessage({ type: "error", text: "Print function not ready." }));
    }
  };

  return handlePrint;
};