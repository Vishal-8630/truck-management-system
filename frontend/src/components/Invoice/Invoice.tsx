import React from "react";
import Logo from "../../assets/logo.png";
import type { BillEntryType } from "../../types/billEntry";
import { formatDate } from "../../utils/formatDate";

interface InvoiceProps {
  entry: BillEntryType
}

const Invoice: React.FC<InvoiceProps> = ({ entry }) => {
  let lrDate = new Date();
  if (entry?.lr_date) {
    lrDate = new Date(entry?.lr_date);
  }
  return (
    <div className="bg-white text-slate-900 w-[1122px] p-8 mx-auto border-4 border-slate-900 font-serif leading-tight text-[11px]">
      {/* Header Section */}
      <div className="flex border-b-2 border-slate-900 min-h-[140px]">
        <div className="w-1/4 p-4 flex flex-col items-center justify-center border-r-2 border-slate-900 text-center">
          <img src={Logo} alt="Logo" className="max-w-[120px] h-auto mb-4" />
          <div className="mt-2">
            <p className="font-bold underline text-[9px] uppercase tracking-tighter">Address of Delivery Office:</p>
            <p className="font-black text-sm tracking-widest italic">GURUGRAM</p>
          </div>
        </div>

        <div className="w-2/4 p-4 text-center flex flex-col justify-center">
          <p className="font-black text-[10px] italic mb-1 uppercase tracking-tight">Subject to Mathura Jurisdiction Only</p>
          <h1 className="text-5xl font-black tracking-tighter text-indigo-900 uppercase my-2 italic stroke-slate-900">Divyanshi Road Lines</h1>
          <p className="font-black text-[11px] mb-1">FLEET OWNER & TRANSPORT CONTRACTORS & COMMISSION AGENT</p>
          <p className="font-bold text-[10px]">Head Office: Yamuna Vihar, Near Essar Fuel Pump, Lohvan Bhagichi, Laxmi Nagar, Mathura - 281001</p>
          <p className="font-bold text-[10px]">Branch Office: Sunari Aparna Pream, Near Kuber Jee Dharam Kanta, Shashtripuram, Agra - 281305</p>
          <div className="font-black text-[11px] mt-2 flex items-center justify-center gap-4">
            <span>Mob: 8630836045, 7983635608, 8449991690</span>
            <span className="text-indigo-600 underline">drldivyashi@gmail.com</span>
          </div>
        </div>

        <div className="w-1/4 p-4 border-l-2 border-slate-900 flex flex-col justify-center text-center">
          <p className="font-black uppercase tracking-tighter text-[9px] mb-1">Address of Issuing office or Name & Address of the Agent:</p>
          <div className="h-full border border-slate-200 rounded mt-2"></div>
        </div>
      </div>

      {/* Section 1: LR Info & Risk */}
      <div className="flex border-b-2 border-slate-900">
        <div className="w-[150px] border-r-2 border-slate-900 flex flex-col">
          <div className="p-3 border-b-2 border-slate-900 flex-1">
            <span className="font-black text-sm">No.:</span>
            <span className="block text-2xl font-black text-indigo-700 tracking-widest mt-1">{entry?.lr_no}</span>
          </div>
          <div className="p-3 flex-1 bg-slate-50">
            <span className="font-black text-sm">Date:</span>
            <span className="block text-xl font-black mt-1 italic tracking-tight">{formatDate(lrDate)}</span>
          </div>
        </div>

        <div className="flex-1 border-r-2 border-slate-900 p-3 italic">
          <div className="text-center font-black text-sm mb-2 underline decoration-double scale-110 tracking-widest">AT OWNERS RISK</div>
          <div className="flex flex-col gap-1 text-[10px] font-bold">
            <p>The Customer has stated that he has insured the consignment.</p>
            <div className="grid grid-cols-2 gap-x-4 mt-2">
              <div className="flex gap-2"><span>Policy No.:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>Amount:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>BE No:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>BE Date:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>Risk:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>Date:</span> <span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            </div>
            <div className="flex gap-8 mt-4 pt-2 border-t border-slate-200">
              <div className="flex gap-2"><span>PAN NO.:</span> <span className="w-24 border-b border-dotted border-slate-400"></span></div>
              <div className="flex gap-2"><span>GST NO.:</span> <span className="w-32 border-b border-dotted border-slate-400"></span></div>
            </div>
          </div>
        </div>

        <div className="w-[180px] border-r-2 border-slate-900 p-2 flex flex-col text-[9px] font-black uppercase tracking-tighter">
          <div className="flex-1">
            <p>GST Payable By</p>
            <p className="text-lg italic text-indigo-800">Consignee</p>
          </div>
          <div className="h-px bg-slate-900 my-1"></div>
          <div className="flex-1">
            <p className="mb-0.5">SCHEDULE OF DEMURRAGE CHARGES</p>
            <div className="text-[8px] space-y-0.5 text-slate-500 font-bold italic">
              <p>Charges after ___ days from today</p>
              <p>@Rs _____ per days Qtl,</p>
              <p>on weight charged.</p>
            </div>
          </div>
          <div className="h-px bg-slate-900 my-1"></div>
          <p className="text-[8px] mt-1 text-center font-black">NOT RESPONSIBLE FOR LEAKAGE & BREAKAGE DELIVERY AGAINST PAYMENT</p>
        </div>

        <div className="w-[200px] flex flex-col text-[10px]">
          <div className="p-2 border-b border-slate-200 flex flex-col gap-0.5">
            <span className="font-black uppercase text-[8px] text-slate-400">Mode of Packing</span>
            <span className="font-black italic text-sm">{entry?.mode_of_packing || "—"}</span>
          </div>
          <div className="p-2 border-b border-slate-200 flex flex-col gap-0.5">
            <span className="font-black uppercase text-[8px] text-slate-400">Invoice No</span>
            <span className="font-black italic text-sm">{entry?.invoice_no || "—"}</span>
          </div>
          <div className="p-2 border-b border-slate-200 flex flex-col gap-0.5">
            <span className="font-black uppercase text-[8px] text-slate-400">Consignee GST No</span>
            <span className="font-black text-xs font-mono">{entry?.consignor_gst_no || "—"}</span>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            <span className="font-black uppercase text-[8px] text-slate-400">Consignor GST No</span>
            <span className="font-black text-xs font-mono">{entry?.consignor_gst_no || "—"}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Consignor/Consignee Info */}
      <div className="flex border-b-2 border-slate-900 min-h-[140px]">
        <div className="flex-1 border-r-2 border-slate-900 flex flex-col">
          <div className="flex-1 p-4 border-b border-slate-200 bg-indigo-50/20">
            <span className="font-black uppercase text-[9px] mb-2 block tracking-widest text-indigo-400">Consignor Name & Address</span>
            <div className="pl-4 border-l-2 border-slate-800">
              <p className="font-black text-lg text-slate-900 leading-none">{entry?.consignor_name}</p>
              <p className="font-bold text-slate-600 mt-2 italic text-[11px] leading-tight max-w-[400px]">{entry?.consignor_from_address}</p>
            </div>
          </div>
          <div className="flex-1 p-4">
            <span className="font-black uppercase text-[9px] mb-2 block tracking-widest text-slate-400">Consignee Name & Address</span>
            <div className="pl-4 border-l-2 border-slate-200">
              <p className="font-black text-lg text-slate-900 leading-none">{entry?.consignee}</p>
              <p className="font-bold text-slate-600 mt-2 italic text-[11px] leading-tight max-w-[400px]">{entry?.consignor_to_address}</p>
            </div>
          </div>
        </div>

        <div className="w-[220px] border-r-2 border-slate-900 flex flex-col">
          <div className="p-4 border-b-2 border-slate-900 bg-slate-900 text-white">
            <span className="font-black uppercase text-[8px] block opacity-60 tracking-widest">Vehicle No.</span>
            <span className="text-2xl font-black italic tracking-tighter mt-1 block">{entry?.vehicle_no}</span>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex-1">
              <span className="font-black uppercase text-[8px] block text-slate-400 tracking-widest">From</span>
              <span className="text-xl font-black text-slate-900 tracking-tight block uppercase">{entry?.from}</span>
            </div>
            <div className="p-4 flex-1">
              <span className="font-black uppercase text-[8px] block text-slate-400 tracking-widest">To</span>
              <span className="text-xl font-black text-slate-900 tracking-tight block uppercase">{entry?.to}</span>
            </div>
          </div>
        </div>

        <div className="w-[180px] p-4 flex flex-col gap-6 font-black uppercase text-[9px] tracking-tighter">
          <div>
            <p className="mb-2 underline">Excise Gate Pass No.</p>
            <div className="h-6 border border-slate-200 rounded-sm"></div>
          </div>
          <div>
            <p className="mb-2 underline">Remarks</p>
            <div className="flex-1 min-h-[60px] border border-slate-200 rounded-sm p-2 italic font-bold">
              {/* Remarks space */}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Item Table */}
      <div className="flex min-h-[300px] border-b-2 border-slate-900">
        <div className="w-2/3 border-r-2 border-slate-900">
          <table className="w-full h-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="border-b-2 border-slate-900 font-black uppercase text-[10px] tracking-tighter">
                <th className="p-3 border-r-2 border-slate-900 text-left w-[100px]">Packages</th>
                <th className="p-3 border-r-2 border-slate-900 text-center">Description (Said to contain)</th>
                <th className="p-3 border-r-2 border-slate-900 text-right w-[120px]">Weight (Actual)</th>
                <th className="p-3 text-right w-[120px]">Weight (Charged)</th>
              </tr>
            </thead>
            <tbody className="h-full">
              <tr className="font-black text-xl italic align-top">
                <td className="p-4 border-r-2 border-slate-200 align-middle text-center border-b border-dotted text-3xl font-black text-indigo-700">{entry?.pkg}</td>
                <td className="p-6 border-r-2 border-slate-200">
                  <div className="flex flex-col gap-4 text-slate-900">
                    <div className="flex items-center gap-4">
                      <span className="font-black underline scale-90">Container No.:</span>
                      <span className="flex-1 border-b border-dotted border-slate-300"></span>
                    </div>
                    <div className="mt-8 text-[9px] text-slate-400 leading-tight border-l-2 border-indigo-200 pl-4 font-bold tracking-tight max-w-[320px]">
                      The Consignment is booked subject to Specific Terms & conditions Printed overleaf & accepted by the consignor.
                    </div>
                  </div>
                </td>
                <td className="p-4 border-r-2 border-slate-200"></td>
                <td className="p-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-1/3 flex border-l-2 border-slate-200">
          <div className="flex-1 border-r-2 border-slate-900">
            <table className="w-full h-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b-2 border-slate-900 font-black text-[10px] uppercase text-center">
                  <th className="p-3 border-r-2 border-slate-900 w-[60%]">Rate Details</th>
                  <th className="p-3 flex flex-col">
                    <span className="text-[8px] opacity-40">Amount To Pay / TBB</span>
                    <div className="flex justify-between px-2 pt-1">
                      <span>Rs.</span>
                      <span>Ps.</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="font-black text-[10px] tracking-widest uppercase italic">
                {[
                  { label: "Hire Amount", value: "" },
                  { label: "Hamali", value: "" },
                  { label: "St. Ch.", value: "" },
                  { label: "Service Tax", value: "" },
                  { label: "Risk Ch.", value: "" },
                ].map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 h-10">
                    <td className="p-3 border-r-2 border-slate-900 text-slate-500 font-bold">{item.label}</td>
                    <td className="p-3 bg-slate-50/30"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-[180px] p-4 flex flex-col gap-4 font-black uppercase text-[9px] tracking-tighter border-l-2 border-slate-900">
            <div>
              <p className="mb-1 text-slate-400">Sales Bill No.</p>
              <div className="h-6 border-b-2 border-slate-900"></div>
            </div>
            <div>
              <p className="mb-1 text-slate-400">Eway Bill No.</p>
              <div className="h-8 font-black text-sm text-indigo-700 py-1">{entry?.eway_bill_no || "_______"}</div>
            </div>
            <div>
              <p className="mb-1 text-slate-400">Empty Yard Name</p>
              <div className="h-6 border-b-2 border-slate-900"></div>
            </div>
            <div>
              <p className="mb-1 text-slate-400">TO PAY / PAID / TBB</p>
              <div className="h-6 border-b-2 border-slate-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex p-8 justify-between items-end border-slate-900">
        <div className="w-[300px]">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-black text-xl italic uppercase text-slate-900">Value Rs.</span>
            <span className="text-3xl font-black text-indigo-800 bg-indigo-50 px-6 py-2 rounded-xl border-2 border-indigo-100 flex-1 text-center font-mono">₹{entry?.value}</span>
          </div>
          <div className="mt-12 text-center">
            <div className="border-t-2 border-slate-800 w-full mb-2"></div>
            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Sign of Booking Clerk</p>
          </div>
        </div>

        <div className="w-[400px]">
          <div className="mb-16">
            <p className="font-black text-sm uppercase text-slate-900 inline-block border-b-2 border-slate-300 mb-2">Name of Transport Operator</p>
            <div className="h-12 border-b-2 border-slate-100"></div>
          </div>
          <div className="text-center group">
            <h3 className="text-3xl font-black text-indigo-900 italic tracking-tighter uppercase mb-2 group-hover:scale-105 transition-transform origin-center">Divyanshi Road Lines</h3>
            <div className="border-t-2 border-slate-800 w-full mb-2"></div>
            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500 italic">Auth. Representative Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
