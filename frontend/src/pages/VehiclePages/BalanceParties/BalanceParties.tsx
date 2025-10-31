import { useCallback, useEffect, useState } from "react";
import type { BalancePartyType } from "../../../types/vehicleEntry";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../animations/animations";
import BalancePartyDropDown from "../../../components/BalancePartyDropDown";
import styles from "./BalanceParties.module.scss";
import PaginatedList from "../../../components/PaginatedList";
import FilterContainer from "../../../components/FilterContainer";
import Loading from "../../../components/Loading";
import {
  balancePartySelectors,
  fetchBalanceParties,
  selectBalancePartyLoading,
} from "../../../features/balanceParty";
import type { AppDispatch } from "../../../app/store";
import { useItemStates } from "../../../hooks/useItemStates";
import ExcelButton from "../../../components/ExcelButton";
import { BalancePartyFilters } from "../../../filters/balancePartyFilters";

const BalanceParties = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectBalancePartyLoading);

  const balanceParties = useSelector(balancePartySelectors.selectAll);
  const [filteredBalanceParties, setFilteredBalanceParties] = useState<
    BalancePartyType[]
  >([]);

  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates(balanceParties);

  useEffect(() => {
    dispatch(fetchBalanceParties());
  }, [dispatch]);

  useEffect(() => {
    setFilteredBalanceParties(balanceParties);
  }, [balanceParties]);

  const renderItem = useCallback(
    (p: BalancePartyType) => {
      return (
        <motion.div key={p._id} variants={fadeInUp}>
          <BalancePartyDropDown
            balanceParty={p}
            itemState={itemStates[p._id]}
            updateItem={updateItem}
            updateDraft={updateDraft}
            toggleEditing={toggleEditing}
            toggleOpen={toggleOpen}
          />
        </motion.div>
      );
    },
    [itemStates, updateItem, updateDraft, toggleEditing, toggleOpen]
  );

  if (loading) return <Loading />;

  return (
    <div>
      <motion.div
        key="list"
        className={styles.balancePartiesContainer}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.headerArea}>
          <FilterContainer
            data={balanceParties}
            filters={BalancePartyFilters}
            onFiltered={setFilteredBalanceParties}
          />
        </div>
        <section>
          <h1 className={styles.heading}>All Balance Parties</h1>
          <PaginatedList
            items={filteredBalanceParties}
            itemsPerPage={10}
            renderItem={renderItem}
          />
          <ExcelButton data={filteredBalanceParties} fileNamePrefix="Balance_Parties" />
        </section>
      </motion.div>
    </div>
  );
};

export default BalanceParties;
