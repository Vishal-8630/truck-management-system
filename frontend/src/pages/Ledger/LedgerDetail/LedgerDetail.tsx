import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "../../../app/store";

import {
  fetchJourneyEntriesAsync,
  journeySelectors,
} from "../../../features/journey";
import {
  fetchTrucksEntriesAsync,
  truckSelectors,
} from "../../../features/truck";
import {
  fetchDriverEntriesAsync,
  driverSelectors,
} from "../../../features/driver";
import {
  fetchBillingPartiesAsync,
  billingPartySelectors,
} from "../../../features/billingParty";
import {
  fetchSettlementsAsync,
  settlementSelectors,
} from "../../../features/settlement";
import {
  fetchVehicleEntriesAsync,
  vehicleEntrySelectors,
} from "../../../features/vehicleEntry";
import {
  fetchLedgerEntriesAsync,
  ledgerSelectors,
  selectLedgerLoading,
  updateLedgerEntryAsync,
} from "../../../features/ledger";

import type { LedgerType } from "../../../types/ledger";
import type { Option } from "../../NewBillingEntry/constants";

import Loading from "../../../components/Loading";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../../Journey/JourneyDetail/components/DetailBlock";

import styles from "./LedgerDetail.module.scss";
import { formatDate } from "../../../utils/formatDate";
import {
  LEDGER_CATEGORIES,
  LEDGER_PAYMENT_MODES,
  LEDGER_REFERENCE_TYPES,
  LEDGER_TRANSACTION_TYPES,
} from "../ledgerConstants";
import MetaFields from "../../../components/MetaFields";
import { addMessage } from "../../../features/message";

type LedgerRelationKey =
  | "journey"
  | "truck"
  | "driver"
  | "party"
  | "settlement"
  | "vehicle_entry";

const LedgerDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();

  const journies = useSelector(journeySelectors.selectAll);
  const trucks = useSelector(truckSelectors.selectAll);
  const drivers = useSelector(driverSelectors.selectAll);
  const parties = useSelector(billingPartySelectors.selectAll);
  const settlements = useSelector(settlementSelectors.selectAll);
  const vehicleEntries = useSelector(vehicleEntrySelectors.selectAll);
  const ledgers = useSelector(ledgerSelectors.selectAll);

  const loading = useSelector(selectLedgerLoading);

  const [isEditMode, setIsEditMode] = useState(false);
  const [localLedger, setLocalLedger] = useState<LedgerType | null>(null);
  const [backupLedger, setBackupLedger] = useState<LedgerType | null>(null);
  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  // Fetch all required data
  useEffect(() => {
    dispatch(fetchLedgerEntriesAsync());
    dispatch(fetchJourneyEntriesAsync());
    dispatch(fetchTrucksEntriesAsync());
    dispatch(fetchDriverEntriesAsync());
    dispatch(fetchBillingPartiesAsync());
    dispatch(fetchSettlementsAsync());
    dispatch(fetchVehicleEntriesAsync());
  }, [dispatch]);

  // Pick ledger by ID
  const ledger = useMemo(
    () => ledgers.find((l) => l._id === id),
    [ledgers, id]
  );

  useEffect(() => {
    if (ledger && !loading) setLocalLedger(ledger);
  }, [ledger, loading]);

  if (loading || !localLedger) return <Loading />;

  const isDirty = JSON.stringify(localLedger) !== JSON.stringify(ledger);

  /* ------------------------------------------
       OPTION CREATORS
  ------------------------------------------ */
  const optionConfig: Record<LedgerRelationKey, () => Option[]> = {
    journey: () =>
      journies.map((j) => ({
        label: `${j.truck.truck_no} | ${j.driver.name} | ${j.from} | ${
          j.to
        } | ${formatDate(new Date(j.journey_start_date))}`,
        value: j._id,
      })),

    truck: () =>
      trucks.map((t) => ({
        label: t.truck_no,
        value: t._id,
      })),

    driver: () =>
      drivers.map((d) => ({
        label: d.name,
        value: d._id,
      })),

    party: () =>
      parties.map((p) => ({
        label: p.name,
        value: p._id,
      })),

    settlement: () =>
      settlements.map((s) => ({
        label: `${s.driver.name} | ${formatDate(
          new Date(s.period.from)
        )} | ${formatDate(new Date(s.period.to))}`,
        value: s._id,
      })),

    vehicle_entry: () =>
      vehicleEntries.map((v) => ({
        label: `${v.vehicle_no} | ${v.from} | ${v.to}`,
        value: v._id,
      })),
  };

  /* ------------------------------------------
       DISPLAY VALUE FORMATTER
  ------------------------------------------ */
  const displayConfig: Record<LedgerRelationKey, () => string> = {
    journey: () =>
      localLedger.journey?._id
        ? `${localLedger.journey.truck.truck_no} | ${localLedger.journey.driver.name} | ${localLedger.journey.from} | ${localLedger.journey.to}`
        : "----------",

    truck: () => localLedger.truck?.truck_no || "----------",

    driver: () => localLedger.driver?.name || "----------",

    party: () => localLedger.party?.name || "----------",

    settlement: () =>
      localLedger.settlement?._id
        ? `${localLedger.settlement.driver.name} | ${formatDate(
            new Date(localLedger.settlement.period.from)
          )} | ${formatDate(new Date(localLedger.settlement.period.to))}`
        : "----------",

    vehicle_entry: () =>
      localLedger.vehicle_entry?._id
        ? `${localLedger.vehicle_entry.vehicle_no} | ${localLedger.vehicle_entry.from} | ${localLedger.vehicle_entry.to}`
        : "----------",
  };

  /* ------------------------------------------
       DATA MAP FOR SELECTION LOOKUP
  ------------------------------------------ */
  const dataMap: Record<LedgerRelationKey, any[]> = {
    journey: journies,
    truck: trucks,
    driver: drivers,
    party: parties,
    settlement: settlements,
    vehicle_entry: vehicleEntries,
  };

  const getOptions = (key: string): Option[] => {
    let options: Option[];
    switch (key) {
      case "category": {
        options = LEDGER_CATEGORIES.map((c) => ({ label: c, value: c }));
        break;
      }
      case "transaction_type": {
        options = LEDGER_TRANSACTION_TYPES.map((t) => ({
          label: t,
          value: t,
        }));
        break;
      }
      case "payment_mode": {
        options = LEDGER_PAYMENT_MODES.map((p) => ({ label: p, value: p }));
        break;
      }
      case "reference_type": {
        options = LEDGER_REFERENCE_TYPES.map((r) => ({ label: r, value: r }));
        break;
      }
      default:
        options = [];
    }
    return options;
  };

  /* ------------------------------------------
       HANDLE CHANGE (FIXED TYPESCRIPT ERROR)
  ------------------------------------------ */
  const handleChange = (key: string, value: string) => {
    const typedKey = key as LedgerRelationKey;

    if (typedKey in dataMap) {
      const selected = dataMap[typedKey].find((item) => item._id === value);
      if (!selected) return;

      setLocalLedger((prev) =>
        prev ? { ...prev, [typedKey]: selected } : prev
      );
      return;
    }

    // fallback simple string update
    setLocalLedger((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  /* ------------------------------------------
       DELETE + SAVE (PLACEHOLDER)
  ------------------------------------------ */
  const handleDelete = (id: string) => {};
  
  const handleSave = async () => {
    try {
      const resultAction = await dispatch(updateLedgerEntryAsync(localLedger));

      if (updateLedgerEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Ledger updated successfully" })
        );
      } else if (updateLedgerEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && Object.keys(errors).length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Failed to save ledger entry",
          })
        );
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  /* ------------------------------------------
       BUILD FIELD ARRAY
  ------------------------------------------ */
  const fieldKeys: LedgerRelationKey[] = [
    "journey",
    "truck",
    "driver",
    "party",
    "settlement",
    "vehicle_entry",
  ];

  const fields = fieldKeys.map((key) => ({
    label: key.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
    key,
    options: optionConfig[key](),
    value: displayConfig[key](),
    isEditable: isEditMode,
  }));

  /* ------------------------------------------
       RENDER
  ------------------------------------------ */
  return (
    <div className={styles.ledgerDetailContainer}>
      <EditHeader
        heading="Ledger Detail"
        isDirty={isDirty}
        onEditClick={() => {
          setIsEditMode(true);
          setBackupLedger(localLedger);
        }}
        onCancelClick={() => {
          setIsEditMode(false);
          setLocalLedger(backupLedger);
        }}
        onDeleteClick={() => handleDelete(localLedger._id)}
        onDiscardClick={() => {
          setIsEditMode(false);
          setLocalLedger(backupLedger);
        }}
        onSaveClick={() => {
          setIsEditMode(false);
          handleSave();
        }}
      />

      <div className={styles.detailContainer}>
        <DetailBlock
          title="Ledger Information"
          isEditMode={isEditMode}
          onChange={handleChange}
          fields={fields}
        />
        <DetailBlock
          title="Ledger Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleChange(key, value)}
          fields={[
            {
              label: "Transaction Date",
              key: "date",
              value: formatDate(new Date(localLedger.date)),
              isEditable: isEditMode,
            },
            {
              label: "Category",
              key: "category",
              value: localLedger.category,
              isEditable: isEditMode,
              options: getOptions("category"),
            },
            {
              label: "Transaction Type",
              key: "transaction_type",
              value: localLedger.transaction_type,
              isEditable: isEditMode,
              options: getOptions("transaction_type"),
            },
            {
              label: "Description",
              key: "description",
              value: localLedger.description || "----------",
              isEditable: isEditMode,
            },
          ]}
        />
        <DetailBlock
          title="Payment Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleChange(key, value)}
          fields={[
            {
              label: "Debit",
              key: "debit",
              value: localLedger.debit,
              isEditable: isEditMode,
            },
            {
              label: "Credit",
              key: "credit",
              value: localLedger.credit,
              isEditable: isEditMode,
            },
            {
              label: "Payment Mode",
              key: "payment_mode",
              value: localLedger.payment_mode,
              isEditable: isEditMode,
              options: getOptions("payment_mode"),
            },
          ]}
        />
        <DetailBlock
          title="Reference Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleChange(key, value)}
          fields={[
            {
              label: "Reference Type",
              key: "reference_type",
              value: localLedger.reference_type,
              isEditable: isEditMode,
              options: getOptions("reference_type"),
            },
            {
              label: "Reference Number",
              key: "reference_no",
              value: localLedger.reference_no,
              isEditable: isEditMode,
            },
            {
              label: "Notes",
              key: "notes",
              value: localLedger.notes || "----------",
              isEditable: isEditMode,
            },
          ]}
        />
        <DetailBlock
          title="Addition Information (Meta)"
          fields={[]}
          childs={
            <MetaFields
              value={localLedger.meta}
              isEditMode={isEditMode}
              onChange={(meta) =>
                setLocalLedger((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    meta,
                  };
                })
              }
            />
          }
        />
      </div>
    </div>
  );
};

export default LedgerDetail;
