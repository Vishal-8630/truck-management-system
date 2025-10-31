import { useEffect, useState } from "react";
import styles from "./BillingParty.module.scss";
import BillingPartyForm from "../../../components/BillingPartyForm";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import {
  EmptyBillingParty,
  type BillingPartyType,
} from "../../../types/billingParty";
import { addMessage } from "../../../features/message";
import { fadeInUp, staggerContainer } from "../../../animations/animations";
import { motion } from "framer-motion";
import Button from "../../../components/Button";
import PaginatedList from "../../../components/PaginatedList";
import { BillingPartyFilters } from "../../../filters/billingPartyFilters";
import FilterContainer from "../../../components/FilterContainer";
import BillingPartyDropdown from "../../../components/BillingPartyDropdown";
import {
  addBillingPartyAsync,
  billingPartySelectors,
  fetchBillingPartiesAsync,
  selectBillingPartyLoading,
} from "../../../features/billingParty";
import type { AppDispatch } from "../../../app/store";
import { useItemStates } from "../../../hooks/useItemStates";
import ExcelButton from "../../../components/ExcelButton";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const BillingParty = () => {
  /* -------------------- Redux -------------------- */
  const loading = useSelector(selectBillingPartyLoading);
  const dispatch: AppDispatch = useDispatch();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);

  // "Add Party" form state
  const [party, setParty] =
    useState<Omit<BillingPartyType, "_id">>(EmptyBillingParty);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const billingParties = useSelector(billingPartySelectors.selectAll);

  const [filteredParties, setFilteredParties] = useState<BillingPartyType[]>(
    []
  );

    const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates(billingParties);

  /* -------------------- Effects -------------------- */

  // Fetch all parties whenever tab changes (mainly when switching back to LIST)
  useEffect(() => {
    dispatch(fetchBillingPartiesAsync());
  }, [activeTab, dispatch]);

  useEffect(() => {
    setFilteredParties(billingParties);
  }, [billingParties]);

  /* -------------------- Handlers: Add Party -------------------- */

  // Handle input change in Add Party form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear error for current field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setParty((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new party
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(addBillingPartyAsync(party));
      if (addBillingPartyAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({
            type: "success",
            text: "Billing party added successfully",
          })
        );
        setActiveTab(TABS.LIST);
      } else if (addBillingPartyAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          setErrors(errors);
        }
        dispatch(
          addMessage({ type: "error", text: errors?.message || "Please fill all the require fields" })
        );
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  /* -------------------- Render -------------------- */

  if (loading) return <Loading />;

  return (
    <div className={styles.partyContainer}>
      {/* Tab Switcher */}
      <div className={styles.buttonGroup}>
        <div className={styles.pageButtons}>
          <Button
            text="Add Billing Party"
            variant="primary"
            onClick={() => setActiveTab(TABS.FORM)}
          />
          <Button
            text="View Billing Parties"
            variant="primary"
            onClick={() => setActiveTab(TABS.LIST)}
          />
        </div>
        {activeTab === TABS.LIST && (
          <FilterContainer
            data={billingParties}
            filters={BillingPartyFilters}
            onFiltered={setFilteredParties}
          />
        )}
      </div>

      {/* Frame Container */}
      <div className={styles.frameContainer}>
        {/* Add Party Form */}
        {activeTab === TABS.FORM && (
          <BillingPartyForm
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            party={party}
            errors={errors}
          />
        )}

        {/* Party List */}
        {activeTab === TABS.LIST && (
          <>
            <h1 className={styles.heading}>All Billing Parties</h1>
            <PaginatedList
              items={filteredParties}
              itemsPerPage={10}
              renderItem={(p) => {
                return (
                  <motion.div
                    key={p._id}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div key={p._id} variants={fadeInUp}>
                      <BillingPartyDropdown
                        key={p._id}
                        billingParty={p}
                        itemState={itemStates[p._id]}
                        updateItem={updateItem}
                        updateDraft={updateDraft}
                        toggleEditing={toggleEditing}
                        toggleOpen={toggleOpen}
                      />
                    </motion.div>
                  </motion.div>
                );
              }}
            />
            <ExcelButton data={filteredParties} fileNamePrefix="Billing_Parties" />
          </>
        )}
      </div>
    </div>
  );
};

export default BillingParty;
