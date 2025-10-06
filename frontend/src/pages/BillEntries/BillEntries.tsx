import { useEffect, useState } from "react";
import styles from "./BillEntries.module.scss";
import Loading from "../../components/Loading";
import { useDispatch } from "react-redux";
import BillEntriesDropdownView from "../../components/BillEntriesDropdownView";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import PaginatedList from "../../components/PaginatedList";
import { useSelector } from "react-redux";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
  selectBillEntryLoading,
} from "../../features/billEntry";
import type { AppDispatch } from "../../app/store";
import type { BillEntryType } from "../../types/billEntry";
import ExcelButton from "../../components/ExcelButton";
import { BillEntryFilters } from "../../filters/billEntryFilters";
import FilterContainer from "../../components/FilterContainer";

const BillEntries = () => {
  let billEntries = useSelector(billEntrySelectors.selectAll);
  const loading = useSelector(selectBillEntryLoading);
  const [filteredEntries, setFilteredEntries] = useState<BillEntryType[]>([]);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    setFilteredEntries(billEntries);
  }, [billEntries]);

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, [dispatch]);


  if (loading) return <Loading />;

  return (
    <div className={styles.billEntriesContainer}>
      <div className={styles.viewContainer}>
        <FilterContainer
          data={billEntries}
          filters={BillEntryFilters}
          onFiltered={setFilteredEntries}
        />
      </div>
      <div className={styles.entriesContainer}>
        <h1 className={styles.heading}>All Bill Entries</h1>
        <PaginatedList
          items={filteredEntries}
          itemsPerPage={10}
          renderItem={(entry) => {
            return (
              <motion.div
                key={entry._id}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div key={entry._id} variants={fadeInUp}>
                  <BillEntriesDropdownView entry={entry} />
                </motion.div>
              </motion.div>
            );
          }}
        />
      </div>

      <ExcelButton data={filteredEntries} fileNamePrefix="Bill_Entries" />
    </div>
  );
};

export default BillEntries;
