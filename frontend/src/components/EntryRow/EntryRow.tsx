import React from "react";
import {
  ENTRY_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "../../types/billEntry";
import { PARTY_LABELS, type BillingPartyType } from "../../types/billingParty";
import { formatDate } from "../../utils/formatDate";

interface EntryRowProps {
  entry: BillEntryType;
}

const EntryRow: React.FC<EntryRowProps> = ({ entry }) => {
  return (
    <tr className="hover:bg-indigo-50/30 transition-colors group">
      {(Object.entries(ENTRY_LABELS) as [keyof BillEntryType, string][]).map(
        ([k, _]) => {
          const key = k as keyof BillEntryType;

          if (key === "extra_charges") {
            const extra_charges = entry[key] as ExtraCharge[];
            let combinedCharges = "";
            extra_charges.forEach((charge) => {
              combinedCharges += `${charge.type}: ${charge.amount}/${charge.rate}/${charge.per_amount}\n`;
            });
            return (
              <td key={key} className="px-6 py-4 text-xs font-medium text-slate-600 border-b border-slate-50 whitespace-pre-line">
                {combinedCharges ?? "—"}
              </td>
            );
          }

          if (key === "billing_party") {
            return (
              Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]
            ).map(([subKey, _]) => {
              return (
                <td key={`${key}.${subKey}`} className="px-6 py-4 text-sm font-bold text-slate-700 border-b border-slate-50 uppercase tracking-tight italic">
                  {(entry[key][subKey] as string) ?? "—"}
                </td>
              );
            });
          }

          if (typeof key === 'string' && key.toLowerCase().includes("date")) {
            return (
              <td key={key} className="px-6 py-4 text-sm font-bold text-slate-500 border-b border-slate-50">
                {formatDate(new Date(entry[key]))}
              </td>
            );
          }

          return (
            <td key={key} className="px-6 py-4 text-sm font-extrabold text-slate-900 border-b border-slate-50 tracking-tight">
              {(entry[key] as string) ?? "—"}
            </td>
          );
        }
      )}
    </tr>
  );
};

export default EntryRow;
