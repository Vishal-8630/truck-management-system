import { useEffect, useState } from "react";
import styles from "./BillEntries.module.scss";
import Loading from "../../../components/Loading";
import { useDispatch } from "react-redux";
import PaginatedList from "../../../components/PaginatedList";
import { useSelector } from "react-redux";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
  selectBillEntryLoading,
} from "../../../features/billEntry";
import type { AppDispatch } from "../../../app/store";
import type { BillEntryType } from "../../../types/billEntry";
import ExcelButton from "../../../components/ExcelButton";
import { BillEntryFilters } from "../../../filters/billEntryFilters";
import FilterContainer from "../../../components/FilterContainer";
import MainHeading from "../../../components/MainHeading";
import Box from "../../../components/Box";
import { useNavigate } from "react-router-dom";

const BillEntries = () => {
  let billEntries = useSelector(billEntrySelectors.selectAll);
  const loading = useSelector(selectBillEntryLoading);
  const [filteredEntries, setFilteredEntries] = useState<BillEntryType[]>([]);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredEntries(billEntries);
  }, [billEntries]);

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, [dispatch]);

  const handleEntryClick = (id: string) => {
    navigate(`/bill-entry/${id}`);
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.billEntriesContainer}>
      <MainHeading
        heading="All Bill Entries"
        childs={
          <FilterContainer
            data={billEntries}
            filters={BillEntryFilters}
            onFiltered={setFilteredEntries}
          />
        }
      />
      <div className={styles.entriesContainer}>
        <PaginatedList
          items={filteredEntries}
          itemsPerPage={30}
          renderItem={(entry) => {
            return (
                <Box
                  rows={[
                    {
                      name: "Bill No:",
                      value: entry.bill_no ? String(entry.bill_no) : "—",
                    },
                  ]}
                  onClick={() => handleEntryClick(entry._id)}
                />
            );
          }}
        />
      </div>

      <ExcelButton data={filteredEntries} fileNamePrefix="Bill_Entries" />
    </div>
  );
};

export default BillEntries;
