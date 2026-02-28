import { useMessageStore } from "@/store/useMessageStore";
import api from "@/api/axios";
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
  serverMode = false,
}: UsePDFPrintOptions<T>) => {
  const { addMessage } = useMessageStore();
  const isLandscape = orientation === "l";

  const printNow = useReactToPrint({
    contentRef: ref,
    documentTitle: "Document",
    pageStyle: `
      @page {
        size: A4 ${isLandscape ? "landscape" : "portrait"};
        margin: 0;
      }
      @media print {
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          zoom: 0.85; /* Ensures content fits on one page */
        }
        .card-premium {
          border: none !important;
          box-shadow: none !important;
        }
        * {
          page-break-inside: avoid !important;
        }
      }
    `,
  });

  const handlePrint = async (): Promise<void> => {
    if (!data || !Object.keys(data as object).length) {
      addMessage({ type: "error", text: emptyMessage });
      return;
    }

    if (!ref.current) return;

    console.log(`Print clicked from ${isMobile ? "Mobile" : "Laptop"}`);

    // ======= SERVER PDF FLOW (Accurate Puppeteer) =======
    if (serverMode) {
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
            <style>
              @page {
                size: A4 ${isLandscape ? "landscape" : "portrait"} !important;
                margin: 5mm;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0;
                padding: 0;
                background: white !important;
              }
              .card-premium {
                border: 1px solid #f1f5f9 !important;
                box-shadow: none !important;
                background: white !important;
              }
            </style>
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
        addMessage({
          type: "info",
          text: "Preparing printable document...",
        });

        const res = await api.post<Blob>(
          endpoint,
          { html: processedHTML, landscape: isLandscape },
          { responseType: "blob" }
        );

        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank");
        addMessage({
          type: "success",
          text: "Opening styled PDF for print...",
        });
      } catch (error) {
        console.error("PDF print error:", error);
        addMessage({
          type: "error",
          text: "Failed to generate printable PDF",
        });
      }

      return;
    }

    // ======= DESKTOP / CLIENT FLOW =======
    if (printNow) {
      printNow();
    } else {
      addMessage({ type: "error", text: "Print function not ready." });
    }
  };

  return handlePrint;
};
