import React from "react";
import {
  ENTRY_LABELS,
  type EntryType,
  type ExtraCharge,
} from "../../types/billEntry";
import styles from "./EntryRow.module.scss";
import { PARTY_LABELS, type BillingPartyType } from "../../types/billingParty";
import { formatDate } from "../../utils/formatDate";

interface EntryRowProps {
  entry: EntryType;
}

const EntryRow: React.FC<EntryRowProps> = ({ entry }) => {
  return (
    <tr className={styles.entryRow}>
      {(Object.entries(ENTRY_LABELS) as [keyof EntryType, string][]).map(
        ([k, _]) => {
          const key = k as keyof EntryType;

          if (key === "extra_charges") {
            const extra_charges = entry[key] as ExtraCharge[];
            let combinedCharges = "";
            extra_charges.forEach((charge) => {
              combinedCharges += `${charge.type}: ${charge.amount}/${charge.rate}/${charge.per_amount}\n`;
            });
            return <td key={key}>{combinedCharges ?? "—"}</td>;
          }

          if (key === "billing_party") {
            return (
              Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]
            ).map(([subKey, _]) => {
              return <td key={`${key}.${subKey}`}>{(entry[key][subKey] as string) ?? "—"}</td>;
            });
          }

          if (key.toLowerCase().includes("date")) {
            return (
              <td key={key}>{formatDate(new Date(entry[key]))}</td>
            );
          } else return <td key={key}>{(entry[key] as string) ?? "—"}</td>;
        }
      )}
    </tr>
  );
};

export default EntryRow;
