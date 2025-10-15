import { useEffect, useState } from "react";
import { type VehicleEntryType } from "../../types/vehicleEntry";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import VehicleEntryDropdown from "../../components/VehicleEntryDropdown";
import styles from "./VehicleEntries.module.scss";
import { VehicleEntryFilters } from "../../filters/vehicleEntryFilters";
import PaginatedList from "../../components/PaginatedList";
import FilterContainer from "../../components/FilterContainer";
import {
  fetchVehicleEntriesAsync,
  selectVehicleEntryLoading,
  vehicleEntrySelectors,
} from "../../features/vehicleEntry";
import type { AppDispatch } from "../../app/store";
import { useItemStates } from "../../hooks/useItemStates";
import ExcelButton from "../../components/ExcelButton";

const VehicleEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectVehicleEntryLoading);

  let vehicleEntries = useSelector(vehicleEntrySelectors.selectAll);
  const [filteredEntries, setFilteredEntries] = useState<VehicleEntryType[]>(
    []
  );
  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates(vehicleEntries);

  useEffect(() => {
    dispatch(fetchVehicleEntriesAsync());
  }, [dispatch]);

  useEffect(() => {
    setFilteredEntries(vehicleEntries);
  }, [vehicleEntries]);

  const onVehicleEntryUpdate = (updatedVehicleEntry: VehicleEntryType) => {
    setFilteredEntries((prev) =>
      prev.map((entry) =>
        entry._id === updatedVehicleEntry._id ? updatedVehicleEntry : entry
      )
    );
  };

  if (loading) return <Loading />;

  return (
    <div>
      <motion.div
        key="list"
        className={styles.vehicleEntriesContainer}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.headerArea}>
          <FilterContainer
            data={vehicleEntries}
            filters={VehicleEntryFilters}
            onFiltered={setFilteredEntries}
          />
        </div>
        <>
          <h1 className={styles.heading}>All Vehicle Entries</h1>
          <PaginatedList
            items={filteredEntries}
            itemsPerPage={10}
            renderItem={(v) => {
              return (
                <motion.div key={v._id} variants={fadeInUp}>
                  <VehicleEntryDropdown
                    vehicleEntry={v}
                    itemState={itemStates[v._id]}
                    updateItem={updateItem}
                    updateDraft={updateDraft}
                    toggleEditing={toggleEditing}
                    toggleOpen={toggleOpen}
                    onVehicleEntryUpdate={onVehicleEntryUpdate}
                  />
                </motion.div>
              );
            }}
          />
          <ExcelButton
            data={filteredEntries}
            fileNamePrefix="Vehicle_Entries"
          />
        </>
      </motion.div>
    </div>
  );
};

export default VehicleEntries;
