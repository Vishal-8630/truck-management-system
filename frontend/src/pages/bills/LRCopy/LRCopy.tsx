import { useRef, useState, useEffect } from "react";
import { Search, X, FileSearch, Download, Printer, ArrowLeft } from "lucide-react";
import Invoice from "@/components/Invoice";
import { useMessageStore } from "@/store/useMessageStore";
import type { BillEntryType } from "@/types/billEntry";
import { useBillEntries } from "@/hooks/useLedgers";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { usePDFPrint } from "@/hooks/usePDFPrint";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useSearchParams } from "react-router-dom";

const LRCopy = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lrNoFromUrl = searchParams.get("lr_no");

  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<BillEntryType | null>(null);
  const { useBillEntriesQuery } = useBillEntries();
  const { data: entries = [], isLoading } = useBillEntriesQuery();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { addMessage } = useMessageStore();

  useState(() => {
    if (lrNoFromUrl && entries.length > 0) {
      const found = entries.find((e: BillEntryType) => e.lr_no === lrNoFromUrl);
      if (found) {
        setSearch(lrNoFromUrl);
        setEntry(found);
      }
    }
  });

  // Effect to handle late-loading entries
  useEffect(() => {
    if (lrNoFromUrl && entries.length > 0 && !entry) {
      const found = entries.find((e: BillEntryType) => e.lr_no === lrNoFromUrl);
      if (found) {
        setSearch(lrNoFromUrl);
        setEntry(found);
      }
    }
  }, [lrNoFromUrl, entries, entry]);

  const handleSearchClear = () => {
    setSearch("");
    setEntry(null);
  };

  const handleSearch = () => {
    if (!search) {
      return addMessage({ type: "error", text: "Please enter LR number to search" });
    }
    const searchedEntry = entries.find((e: BillEntryType) => e.lr_no === search);
    if (searchedEntry) {
      setEntry(searchedEntry);
    } else {
      addMessage({ type: "info", text: "No entry found for this LR number" });
      setEntry(null);
    }
  };

  const handlePrintInvoice = usePDFPrint({
    ref: invoiceRef,
    data: entry,
    emptyMessage: "Please search and select an LR first",
    orientation: "l",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  const handleDownloadInvoice = usePDFDownload({
    ref: invoiceRef,
    data: entry,
    emptyMessage: "Please search and select an LR first",
    filename: `LR-${entry?.lr_no || "Copy"}-${new Date().toISOString().split("T")[0]}.pdf`,
    orientation: "l",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
              <FileSearch className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
              LR <span className="text-indigo-600">Copy</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Search and download official Lorry Receipt copies.</p>
          </div>
        </div>

        <div className="w-full lg:max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter LR Number..."
              className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-2xl shadow-premium focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
            />
            <div className="absolute inset-y-2 right-2 flex items-center gap-2">
              {search && (
                <button
                  onClick={handleSearchClear}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 w-full order-2 lg:order-1">
          <div ref={invoiceRef} className="card-premium bg-white p-2 min-h-[600px] flex items-center justify-center overflow-auto shadow-2xl scale-[0.98] origin-top lg:scale-100">
            {entry ? (
              <Invoice entry={entry} />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-300 py-40">
                <FileSearch size={80} strokeWidth={1} />
                <p className="font-bold italic text-lg">Enter LR number to preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-4 sticky top-24 order-1 lg:order-2">
          <button
            onClick={handleDownloadInvoice}
            disabled={!entry}
            className={`
                    flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black transition-all shadow-xl
                    ${entry ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 shadow-slate-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                `}
          >
            <Download size={20} />
            Download PDF
          </button>
          <button
            onClick={handlePrintInvoice}
            disabled={!entry}
            className={`
                    flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black transition-all shadow-xl
                    ${entry ? 'bg-white text-indigo-600 border border-indigo-100 hover:bg-slate-50 hover:-translate-y-1 active:translate-y-0 shadow-indigo-50' : 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'}
                `}
          >
            <Printer size={20} />
            Quick Print
          </button>

          {entry && (
            <div className="mt-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex flex-col gap-3">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Document Status</span>
              <div className="flex items-center gap-3 text-indigo-900">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-bold truncate">LR #{entry.lr_no} Loaded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LRCopy;
