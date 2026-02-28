import { Search, X, FileText, Download, Printer, Receipt } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useMessageStore } from "@/store/useMessageStore";
import type { BillEntryType } from "@/types/billEntry";
import BillInvoice from "@/components/BillInvoice";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { useBillEntries } from "@/hooks/useLedgers";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { usePDFPrint } from "@/hooks/usePDFPrint";
import { useSearchParams } from "react-router-dom";

const Bill = () => {
  const [searchParams] = useSearchParams();
  const billNoFromUrl = searchParams.get("bill_no");

  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<Partial<BillEntryType> | {}>({});
  const { useBillEntriesQuery } = useBillEntries();
  const { data: entries = [], isLoading } = useBillEntriesQuery();
  const billRef = useRef<HTMLDivElement>(null);
  const { addMessage } = useMessageStore();

  useEffect(() => {
    if (billNoFromUrl && entries.length > 0) {
      const found = entries.find((e: BillEntryType) => e.bill_no === billNoFromUrl);
      if (found) {
        setSearch(billNoFromUrl);
        setEntry(found);
      }
    }
  }, [billNoFromUrl, entries]);

  const handleSearchClear = () => {
    setSearch("");
    setEntry({});
  };

  const handleSearch = async () => {
    if (!search) {
      return addMessage({ type: "error", text: "Please enter a bill number" });
    }
    const searchedEntry = entries.find((e: BillEntryType) => e.bill_no === search);
    if (searchedEntry) {
      setEntry(searchedEntry);
    } else {
      addMessage({ type: "info", text: "No bill found with this number" });
    }
  };

  const handlePrintBill = usePDFPrint({
    ref: billRef,
    data: entry,
    emptyMessage: "Please search for a bill first",
    orientation: "p",
    endpoint: "/invoice/generate-pdf",
    serverMode: false,
  });

  const handleDownloadBill = usePDFDownload({
    ref: billRef,
    data: entry,
    emptyMessage: "Please search for a bill first",
    filename: `bill-${(entry as BillEntryType).bill_no || 'unknown'}-${new Date().toISOString().split("T")[0]
      }.pdf`,
    orientation: "p",
    endpoint: "/invoice/generate-pdf",
    serverMode: false,
  });

  if (isLoading) return <Loading />;

  const isEntryFound = Object.keys(entry).length > 0;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Receipt className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Invoice <span className="text-indigo-600">Search</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Retrieve and view generated invoices by their bill number.</p>
        </div>

        <div className="relative max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              className={`
                w-full pl-14 pr-[7rem] py-5 bg-white border border-slate-100 rounded-2xl text-lg font-bold text-slate-700
                shadow-xl shadow-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all
                placeholder:text-slate-300 placeholder:font-medium
              `}
              placeholder="Enter Bill Number (e.g. 1001)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {search && (
                <button
                  className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  onClick={handleSearchClear}
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                Find
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEntryFound ? (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="card-premium p-0 overflow-hidden bg-white shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <div ref={billRef} className="p-8 lg:p-12 bg-white">
                <BillInvoice entry={entry as BillEntryType} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl backdrop-blur-sm">
              <button
                className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center gap-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                onClick={handleDownloadBill}
              >
                <Download size={18} className="text-indigo-600" />
                Download PDF
              </button>
              <button
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                onClick={handlePrintBill}
              >
                <Printer size={18} />
                Print Invoice
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-slate-200" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">No Invoice Loaded</h3>
            <p className="text-slate-400 font-medium">Search using a valid bill number to view and download the invoice.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bill;
