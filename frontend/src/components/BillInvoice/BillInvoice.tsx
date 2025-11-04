import React, { useEffect, useState } from "react";
import styles from "./BillInvoice.module.scss";
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
  invoice_no: "Invoice Number",
  pkg: "Packages",
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
    setExtraCharges(entry?.extra_charges as ExtraCharge[]);
  }, [entry]);

  useEffect(() => {
    const calculateTaxableValue = () => {
      let totalCharge = 0;
      if (extraCharges?.length > 0) {
        extraCharges.map((charge) => {
          totalCharge += parseInt(charge.amount);
        });
      }
      setTaxableValue(totalCharge + parseInt(entry?.rate || "0"));
    };

    calculateTaxableValue();
  }, [extraCharges]);

  useEffect(() => {
    setGrossBill(
      taxableValue +
        parseInt(entry?.cgst || "0") +
        parseInt(entry?.sgst || "0") +
        parseInt(entry?.igst || "0")
    );
  }, [taxableValue]);

  useEffect(() => {
    setTotalBalance(grossBill - parseInt(entry?.advance || "0"));
  }, [grossBill])

  return (
    <div className={styles.billInvoiceContainer}>
      <div className={styles.header}>
        <div className={styles.secondRow}>
          <p className={styles.drl}>Divyanshi Road Lines</p>
          <p>
            Head Office: Yamuna Vihar, Near Essar Fuel Pump, Lohvan Bhagichi,
            Laxmi Nagar, Mathura - 281001
          </p>
          <p>Mob:- 8630836045, 7983635608, 8449991690</p>
          <p>GST NO - 09FPZPM8447C1Z1</p>
          <p>Email - drldivyashi@gmail.com</p>
        </div>
      </div>
      <div className={styles.section_1}>
        <div>
          <p>M/s</p>
        </div>
        <div>
          <div>
            <p>{entry?.consignor_name || "________________"}</p>
            <p>{entry?.consignor_from_address || "_________________"}</p>
          </div>
          <div>
            <p>GST No</p>
            <p>{entry?.consignor_gst_no || "_______________"}</p>
          </div>
        </div>
        <div>
          <div>
            <p>Tax Invoice</p>
            <p>Service Account Code 992323</p>
          </div>
          <div>
            <div>
              <p>Bill No</p>
              <p>{entry?.bill_no || "___________"}</p>
            </div>
            <div>
              <p>Date</p>
              <p>{formatDate(new Date(billDate)) || "___________"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.billRow}>
        <table>
          <thead>
            <tr>
              {Object.values(BILL_INVOICE_MAPPING).map((values) => {
                return <th key={values}>{values}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {(Object.keys(BILL_INVOICE_MAPPING) as [keyof BillEntryType]).map(
                (key) => {
                  if (typeof entry[key] === "string") {
                    if (isKeyDate(key)) {
                      return (
                        <td key={key}>{formatDate(new Date(entry[key]))}</td>
                      );
                    } else {
                      return <td key={key}>{entry[key]}</td>;
                    }
                  } else {
                    return <td key={key}>-</td>;
                  }
                }
              )}
            </tr>
          </tbody>
        </table>
        <div>
          {extraCharges?.length > 0
            ? extraCharges.map((charge) => {
                return (
                  <div>
                    <p key={charge._id}>{charge.type}</p>
                    <p>{charge.amount}</p>
                  </div>
                );
              })
            : null}
        </div>
      </div>
      <div className={styles.gstSection}>
        <div className={styles.space}></div>
        <table>
          <thead>
            <tr>
              <th>Taxable Value</th>
              <th>{formatNumber(taxableValue.toString()) || "0.00"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CGST 9%</td>
              <td>{formatNumber(entry?.cgst!!) || "0.00"}</td>
            </tr>
            <tr>
              <td>SGST 9%</td>
              <td>{formatNumber(entry?.sgst!!) || "0.00"}</td>
            </tr>
            <tr>
              <td>IGST 18%</td>
              <td>{formatNumber(entry?.igst!!) || "0.00"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={styles.section_2}>
        <div>
          <div>
            <p>BANK DETAILS: - HDFC BANK LIMITED, MATHURA BRANCH</p>
            <p>A/C No: - 5020006546161</p>
            <p>IFSC Code: - HDFC0004320</p>
          </div>
        </div>
        <div>
          <div>
            <p>Gross Bill</p>
            <p>{formatNumber(grossBill.toString()) || "0.00"}</p>
          </div>
          <div>
            <p>Less Advance</p>
            <p>{formatNumber(entry?.advance!!) || "0.00"}</p>
          </div>
          <div>
            <p>Total Balance</p>
            <p>{formatNumber(totalBalance.toString()) || "0.00"}</p>
          </div>
        </div>
      </div>
      <div className={styles.section_3}>
        <div>
          <p>Term & Condition</p>
          <ol>
            <li>
              Please make all payments by A/C. Payee Cheque / D.D. drawn in
              favour of M/S Divyanshi Road Lines
            </li>
            <li>Description of Service Rendered: Transportation</li>
            <li>
              We have taken registration under CCST Act, 2017 and have exercised
              the option to pay tax on service of CTA in relation to tranpost of
              goods supplied by us during the Financial Year 2023-24 under
              forwar charge.
            </li>
            <li>We are registered into MSME. No: UDYAM-52-0019725</li>
            <li>All the disputes are subject to Agra Jurisdiction.</li>
          </ol>
        </div>
        <div>
          <div>
            <p>PAN No: - FPZPM8447C</p>
            <p>
              CHECKED BY: <span>FOR DIVYANSHI ROAD LINES</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillInvoice;
