import { useRef, useState } from "react";
import { Download, Printer, ArrowLeft, FilePlus } from "lucide-react";
import Invoice from "@/components/Invoice";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { usePDFPrint } from "@/hooks/usePDFPrint";
import { useNavigate } from "react-router-dom";
import type { BillEntryType } from "@/types/billEntry";

const EmptyLR = () => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [lrNo, setLrNo] = useState("");
  const [lrDate, setLrDate] = useState(new Date().toISOString().split("T")[0]);

  // Construct a dummy entry with only the required fields
  const emptyEntry: Partial<BillEntryType> = {
    lr_no: lrNo,
    lr_date: lrDate,
  };

  const handlePrintInvoice = usePDFPrint({
    ref: invoiceRef,
    data: emptyEntry,
    emptyMessage: "Please provide an LR Number",
    orientation: "l",
    serverMode: false,
  });

  const handleDownloadInvoice = usePDFDownload({
    ref: invoiceRef,
    data: emptyEntry,
    emptyMessage: "Please provide an LR Number",
    filename: `Empty-LR-${lrNo || "Template"}-${new Date().toISOString().split("T")[0]}.pdf`,
    orientation: "l",
    serverMode: false,
  });

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
              <FilePlus className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
              Empty <span className="text-indigo-600">LR</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Generate a blank Lorry Receipt template.</p>
          </div>
        </div>

        <div className="w-full lg:max-w-md flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LR Number</label>
            <input
              type="text"
              value={lrNo}
              onChange={(e) => setLrNo(e.target.value)}
              placeholder="Enter LR Number..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
            <input
              type="date"
              value={lrDate}
              onChange={(e) => setLrDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 w-full order-2 lg:order-1">
          <div ref={invoiceRef} className="card-premium bg-white p-2 min-h-[600px] flex items-center justify-center overflow-auto shadow-2xl scale-[0.98] origin-top lg:scale-100">
            <Invoice entry={emptyEntry as BillEntryType} />
          </div>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-4 sticky top-24 order-1 lg:order-2">
          <button
            onClick={handleDownloadInvoice}
            disabled={!lrNo}
            className={`
                    flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black transition-all shadow-xl
                    ${lrNo ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 shadow-slate-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                `}
          >
            <Download size={20} />
            Download PDF
          </button>
          <button
            onClick={handlePrintInvoice}
            disabled={!lrNo}
            className={`
                    flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black transition-all shadow-xl
                    ${lrNo ? 'bg-white text-indigo-600 border border-indigo-100 hover:bg-slate-50 hover:-translate-y-1 active:translate-y-0 shadow-indigo-50' : 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'}
                `}
          >
            <Printer size={20} />
            Quick Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyLR;
