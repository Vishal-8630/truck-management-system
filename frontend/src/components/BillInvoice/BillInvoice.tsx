import React, { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import type { BillEntryType, ExtraCharge } from "../../types/billEntry";
import { formatDate } from "../../utils/formatDate";
import { formatNumber } from "../../utils/formatNumber";

interface BillInvoiceProps {
  entry: Partial<BillEntryType>;
}

const BILL_INVOICE_MAPPING = {
  lr_no: "LR Number",
  lr_date: "LR Date",
  consignor_name: "Consignor Name",
  consignee: "Consignee",
  from: "From",
  to: "To",
  invoice_no: "Invoice No.",
  pkg: "Pkgs",
  weight: "Weight",
  rate: "Amount",
};

const BillInvoice: React.FC<BillInvoiceProps> = ({ entry }) => {
  let billDate: string = entry?.bill_date || new Date().toString();
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [taxableValue, setTaxableValue] = useState(0);
  const [grossBill, setGrossBill] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const isKeyDate = (key: keyof BillEntryType) =>
    key.toLowerCase().includes("date");

  useEffect(() => {
    setExtraCharges((entry?.extra_charges as ExtraCharge[]) || []);
  }, [entry]);

  useEffect(() => {
    const calculateTaxableValue = () => {
      let totalCharge = 0;
      if (extraCharges?.length > 0) {
        extraCharges.forEach((charge) => {
          totalCharge += parseInt(charge.amount || "0");
        });
      }
      setTaxableValue(totalCharge + parseInt(entry?.rate || "0"));
    };

    calculateTaxableValue();
  }, [extraCharges, entry?.rate]);

  useEffect(() => {
    setGrossBill(
      taxableValue +
      parseInt(entry?.cgst || "0") +
      parseInt(entry?.sgst || "0") +
      parseInt(entry?.igst || "0")
    );
  }, [taxableValue, entry?.cgst, entry?.sgst, entry?.igst]);

  useEffect(() => {
    setTotalBalance(grossBill - parseInt(entry?.advance || "0"));
  }, [grossBill, entry?.advance]);

  return (
    <div className="flex flex-col text-slate-800 font-sans max-w-5xl mx-auto bg-white">
      {/* Header */}
      <div className="flex flex-col items-center text-center py-6 border-b-2 border-indigo-600 mb-8 bg-indigo-50/50 rounded-t-xl">
        <h1 className="text-4xl font-black text-indigo-900 italic tracking-tighter mb-1 uppercase">Divyanshi Road Lines</h1>
        <p className="text-sm font-bold text-slate-600 max-w-md leading-relaxed">
          Head Office: Yamuna Vihar, Near Essar Fuel Pump, Lohvan Bhagichi,
          Laxmi Nagar, Mathura - 281001
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs font-bold text-indigo-600 uppercase tracking-widest">
          <span>Mob: 8630836045, 7983635608</span>
          <span className="text-slate-300">|</span>
          <span>GST: 09FPZPM8447C1Z1</span>
          <span className="text-slate-300">|</span>
          <span>drldivyashi@gmail.com</span>
        </div>
      </div>

      {/* Bill Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 px-4">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Consignor Details (M/s)</span>
          <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
            <p className="text-lg font-black text-slate-900">{entry?.consignor_name || "—"}</p>
            <p className="text-sm font-medium text-slate-500 leading-snug">{entry?.consignor_from_address || "—"}</p>
            <div className="mt-2 text-[10px] font-black uppercase text-indigo-500 flex gap-2">
              <span>GST No:</span>
              <span className="text-slate-700">{entry?.consignor_gst_no || "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Invoice Status</span>
          <div className="flex flex-col justify-center gap-1 p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 min-h-[100px]">
            <p className="text-lg font-black italic">Tax Invoice</p>
            <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Service Code: 992323</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Reference Info</span>
          <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden min-h-[100px]">
            <div className="bg-white p-4 flex flex-col items-center justify-center border-r border-slate-50">
              <span className="text-[10px] font-black text-slate-400 uppercase">Bill No.</span>
              <span className="text-lg font-black text-indigo-600">#{entry?.bill_no || "—"}</span>
            </div>
            <div className="bg-white p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Date</span>
              <span className="text-sm font-black text-slate-700">{formatDate(new Date(billDate)) || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded-[2rem] overflow-hidden mb-10 shadow-sm mx-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {Object.values(BILL_INVOICE_MAPPING).map((label) => (
                  <th key={label} className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="group transition-colors">
                {(Object.keys(BILL_INVOICE_MAPPING) as (keyof typeof BILL_INVOICE_MAPPING)[]).map((key) => {
                  const value = entry[key as keyof BillEntryType];
                  let displayValue: string | number = "—";
                  if (typeof value === "string") {
                    displayValue = isKeyDate(key as keyof BillEntryType)
                      ? formatDate(new Date(value))
                      : value;
                  } else if (typeof value === "number") {
                    displayValue = value;
                  }

                  return (
                    <td key={key} className="px-4 py-6 text-sm font-black text-slate-700">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10 px-4">
        <div className="lg:col-span-7 flex flex-col gap-6">
          {extraCharges?.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Additional Surcharges</span>
              <div className="grid grid-cols-2 gap-4">
                {extraCharges.map((charge) => (
                  <div key={charge._id || Math.random()} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-colors">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">{charge.type}</span>
                    <span className="text-sm font-black text-slate-900">₹{formatNumber(charge.amount || "0")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Financial Summary</span>
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  <tr className="bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Taxable Value</td>
                    <td className="px-6 py-4 font-black text-right text-slate-900 text-lg">₹{formatNumber(taxableValue.toString()) || "0.00"}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-500">CGST 9%</td>
                    <td className="px-6 py-4 font-black text-right text-slate-700">₹{formatNumber(entry?.cgst || "0") || "0.00"}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-500">SGST 9%</td>
                    <td className="px-6 py-4 font-black text-right text-slate-700">₹{formatNumber(entry?.sgst || "0") || "0.00"}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-500">IGST 18%</td>
                    <td className="px-6 py-4 font-black text-right text-slate-700">₹{formatNumber(entry?.igst || "0") || "0.00"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6 justify-end">
          <div className="flex flex-col gap-4 p-8 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Gross Total</span>
              <span className="text-xl font-black italic">₹{formatNumber(grossBill.toString()) || "0.00"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Less Advance</span>
              <span className="text-xl font-black text-red-300 italic">- ₹{formatNumber(entry?.advance || "0") || "0.00"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-300">Net Due</span>
                <span className="text-3xl font-black italic tracking-tighter">₹{formatNumber(totalBalance.toString()) || "0.00"}</span>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Receipt size={24} className="text-indigo-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 mx-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Bank Remittance</span>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col gap-1 text-sm font-bold text-slate-600">
              <p>HDFC BANK LIMITED, MATHURA BRANCH</p>
              <p className="text-slate-900 font-black">A/C: 5020006546161</p>
              <p>IFSC: HDFC0004320</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Conditions</span>
            <ol className="text-[11px] font-bold text-slate-500 flex flex-col gap-2 list-decimal list-inside">
              <li>Payments by A/C Payee Cheque / D.D in favour of Divyanshi Road Lines only.</li>
              <li>Service: Road Transportation. MSME No: UDYAM-52-0019725.</li>
              <li>Exercised option to pay tax on G.T.A services for F.Y 2023-24.</li>
              <li>All disputes are subject to Agra Jurisdiction.</li>
            </ol>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end text-right">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Administrative Info</span>
            <p className="text-lg font-black text-slate-900 uppercase italic">PAN: FPZPM8447C</p>
          </div>

          <div className="mt-20 flex flex-col gap-4 items-end">
            <div className="w-48 h-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorised Signatory</span>
              <span className="text-sm font-black text-indigo-600 uppercase tracking-tight">For Divyanshi Road Lines</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em] italic">Electronic Document - No Physical Signature Required</p>
      </div>
    </div>
  );
};

export default BillInvoice;

