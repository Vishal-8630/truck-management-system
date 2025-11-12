import { FaSearch, FaTimes } from "react-icons/fa";
import styles from "./LRCopy.module.scss";
import { useEffect, useRef, useState } from "react";
import Invoice from "../../components/Invoice";
import { useDispatch } from "react-redux";
import type { BillEntryType } from "../../types/billEntry";
import { addMessage } from "../../features/message";
import type { AppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
} from "../../features/billEntry";
import { usePDFDownload } from "../../hooks/usePDFDownload";
import { usePDFPrint } from "../../hooks/usePDFPrint";

const LRCopy = () => {
  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<BillEntryType | null>(null);
  const entries = useSelector(billEntrySelectors.selectAll);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, [dispatch]);

  const handleSearchClear = () => {
    setSearch("");
    setEntry(null);
  };

  const handleSearch = async () => {
    if (!search) {
      return dispatch(
        addMessage({ type: "error", text: "Please enter something to search" })
      );
    }
    const searchedEntry = entries.find((e) => e.lr_no === search);
    if (searchedEntry) {
      setEntry(searchedEntry);
    } else {
      dispatch(addMessage({ type: "info", text: "No entry found" }));
    }
  };

  const handlePrintInvoice = usePDFPrint({
    ref: invoiceRef,
    data: entry,
    emptyMessage: "Please search an invoice first",
    orientation: "l",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  const handleDownloadInvoice = usePDFDownload({
    ref: invoiceRef,
    data: entry,
    emptyMessage: "Please search an invoice first",
    filename: `invoice-${entry?.lr_no}-${
      new Date().toISOString().split("T")[0]
    }.pdf`,
    orientation: "l",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  return (
    <div className={styles.lrCopyContainer}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.icon}>
            <FaSearch />
          </div>
          <input
            value={search}
            className={styles.input}
            type="text"
            placeholder="LR Number"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className={styles.cancelSearch}>
              <FaTimes size={20} onClick={handleSearchClear} />
            </div>
          )}
          <button className={styles.searchBtn} onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      <div ref={invoiceRef} className={styles.invoiceContainer}>
        <Invoice entry={entry!!} />
      </div>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={handleDownloadInvoice}>
          Download Invoice
        </button>
        <button className={styles.btn} onClick={handlePrintInvoice}>
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default LRCopy;
