import { FaSearch, FaTimes } from "react-icons/fa";
import styles from "./Bill.module.scss";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../../features/message";
import type { BillEntryType } from "../../types/billEntry";
import BillInvoice from "../../components/BillInvoice";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import { motion } from "framer-motion";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
  selectBillEntryLoading,
} from "../../features/billEntry";
import type { AppDispatch } from "../../app/store";
import { usePDFDownload } from "../../hooks/usePDFDownload";
import { usePDFPrint } from "../../hooks/usePDFPrint";

const Bill = () => {
  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<Partial<BillEntryType> | {}>({});
  const entries = useSelector(billEntrySelectors.selectAll);
  const billRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectBillEntryLoading);

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, [dispatch]);

  const handleSearchClear = () => {
    setSearch("");
    setEntry({});
  };

  const handleSearch = async () => {
    if (!search) {
      return dispatch(
        addMessage({ type: "error", text: "Please enter something to search" })
      );
    }
    const searchedEntry = entries.find((e) => e.bill_no === search);
    if (searchedEntry) {
      setEntry(searchedEntry);
    } else {
      dispatch(addMessage({ type: "info", text: "No entry found" }));
    }
  };

  const handlePrintBill = usePDFPrint({
    ref: billRef,
    data: entry,
    emptyMessage: "Please search a bill first",
    orientation: "p",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  })

  const handleDownloadBill = usePDFDownload({
    ref: billRef,
    data: entry,
    emptyMessage: "Please search a bill first",
    filename: "bill.pdf",
    orientation: "p",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  })

  if (loading) return <Loading />;

  return (
    <div className={styles.billContainer}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.icon}>
            <FaSearch />
          </div>
          <input
            value={search}
            className={styles.input}
            type="text"
            placeholder="Bill Number"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className={styles.cancelSearch}>
              <FaTimes size={20} onClick={handleSearchClear} />
            </div>
          )}
          <motion.button
            className={styles.searchBtn}
            onClick={handleSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Search
          </motion.button>
        </div>
      </div>
      <div ref={billRef} className={styles.billInvoice}>
        <BillInvoice entry={entry!!} />
      </div>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={handleDownloadBill}>
          Download Invoice
        </button>
        <button className={styles.btn} onClick={handlePrintBill}>
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Bill;
