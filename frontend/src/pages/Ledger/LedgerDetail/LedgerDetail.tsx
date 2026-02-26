import { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useJourneys } from "@/hooks/useJourneys";
import { useTrucks } from "@/hooks/useTrucks";
import { useDrivers } from "@/hooks/useDrivers";
import { useParties } from "@/hooks/useParties";
import { useSettlements } from "@/hooks/useSettlements";
import { useVehicleEntries, useLedgers } from "@/hooks/useLedgers";
import { useMessageStore } from "@/store/useMessageStore";

import type { LedgerType } from "@/types/ledger";
import type { Option } from "@/types/form";

import Loading from "@/components/Loading";
import EditHeader from "@/components/EditHeader";
import DetailBlock from "@/pages/Journey/JourneyDetail/components/DetailBlock";

import { formatDate } from "@/utils/formatDate";
import {
  LEDGER_CATEGORIES, LEDGER_PAYMENT_MODES,
  LEDGER_REFERENCE_TYPES, LEDGER_TRANSACTION_TYPES,
} from "../ledgerConstants";
import MetaFields from "@/components/MetaFields";
import { ArrowLeft } from "lucide-react";

type LedgerRelationKey = "journey" | "truck" | "driver" | "party" | "settlement" | "vehicle_entry";

const LedgerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);

  const { useJourneysQuery } = useJourneys();
  const { useTrucksQuery } = useTrucks();
  const { useDriversQuery } = useDrivers();
  const { useBillingPartiesQuery } = useParties();
  const { useSettlementsQuery } = useSettlements();
  const { useVehicleEntriesQuery } = useVehicleEntries();
  const { useLedgersQuery, useUpdateLedgerMutation } = useLedgers();

  const { data: journies = [] } = useJourneysQuery();
  const { data: trucks = [] } = useTrucksQuery();
  const { data: drivers = [] } = useDriversQuery();
  const { data: parties = [] } = useBillingPartiesQuery();
  const { data: settlements = [] } = useSettlementsQuery();
  const { data: vehicleEntries = [] } = useVehicleEntriesQuery();
  const { data: ledgers = [], isLoading } = useLedgersQuery();
  const updateLedger = useUpdateLedgerMutation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [localLedger, setLocalLedger] = useState<LedgerType | null>(null);
  const [backupLedger, setBackupLedger] = useState<LedgerType | null>(null);
  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const ledger = useMemo(() => ledgers.find((l: LedgerType) => l._id === id), [ledgers, id]);
  const currentDisplay = localLedger ?? ledger;

  if (isLoading || !currentDisplay) return <Loading />;

  const isDirty = JSON.stringify(localLedger) !== JSON.stringify(ledger);

  const getOptions = (key: string): Option[] => {
    switch (key) {
      case "category": return LEDGER_CATEGORIES.map((c) => ({ label: c, value: c }));
      case "transaction_type": return LEDGER_TRANSACTION_TYPES.map((t) => ({ label: t, value: t }));
      case "payment_mode": return LEDGER_PAYMENT_MODES.map((p) => ({ label: p, value: p }));
      case "reference_type": return LEDGER_REFERENCE_TYPES.map((r) => ({ label: r, value: r }));
      default: return [];
    }
  };

  const dataMap: Record<LedgerRelationKey, any[]> = {
    journey: journies, truck: trucks, driver: drivers,
    party: parties, settlement: settlements, vehicle_entry: vehicleEntries,
  };

  const optionConfig: Record<LedgerRelationKey, () => Option[]> = {
    journey: () => journies.map((j: any) => ({ label: `${j.truck?.truck_no} | ${j.driver?.name} | ${j.from} | ${j.to} | ${formatDate(new Date(j.journey_start_date))}`, value: j._id })),
    truck: () => trucks.map((t: any) => ({ label: t.truck_no, value: t._id })),
    driver: () => drivers.map((d: any) => ({ label: d.name, value: d._id })),
    party: () => parties.map((p: any) => ({ label: p.name, value: p._id })),
    settlement: () => settlements.map((s: any) => ({ label: `${s.driver?.name} | ${formatDate(new Date(s.period.from))} | ${formatDate(new Date(s.period.to))}`, value: s._id })),
    vehicle_entry: () => vehicleEntries.map((v: any) => ({ label: `${v.vehicle_no} | ${v.from} | ${v.to}`, value: v._id })),
  };

  const displayConfig: Record<LedgerRelationKey, () => string> = {
    journey: () => currentDisplay.journey?._id ? `${currentDisplay.journey.truck?.truck_no} | ${currentDisplay.journey.driver?.name} | ${currentDisplay.journey.from} | ${currentDisplay.journey.to}` : "—",
    truck: () => currentDisplay.truck?.truck_no || "—",
    driver: () => (currentDisplay.driver as any)?.name || "—",
    party: () => (currentDisplay.party as any)?.name || "—",
    settlement: () => currentDisplay.settlement?._id ? `${(currentDisplay.settlement.driver as any)?.name} | ${formatDate(new Date(currentDisplay.settlement.period.from))} | ${formatDate(new Date(currentDisplay.settlement.period.to))}` : "—",
    vehicle_entry: () => currentDisplay.vehicle_entry?._id ? `${currentDisplay.vehicle_entry.vehicle_no} | ${currentDisplay.vehicle_entry.from} | ${currentDisplay.vehicle_entry.to}` : "—",
  };

  const handleChange = (key: string, value: string) => {
    const typedKey = key as LedgerRelationKey;
    if (typedKey in dataMap) {
      const selected = dataMap[typedKey].find((item: any) => item._id === value);
      if (!selected) return;
      setLocalLedger((prev) => prev ? { ...prev, [typedKey]: selected } : prev);
      return;
    }
    setLocalLedger((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    try {
      await updateLedger.mutateAsync(currentDisplay);
      addMessage({ type: "success", text: "Ledger updated successfully" });
    } catch (error: any) {
      const errors = error?.response?.data;
      if (errors && typeof errors === "object") { errorsRef.current = errors; forceRender({}); }
      addMessage({ type: "error", text: errors?.general || "Failed to save ledger entry" });
    }
  };

  const fieldKeys: LedgerRelationKey[] = ["journey", "truck", "driver", "party", "settlement", "vehicle_entry"];
  const fields = fieldKeys.map((key) => ({
    label: key.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
    key,
    options: optionConfig[key](),
    value: displayConfig[key](),
    isEditable: isEditMode,
  }));

  return (
    <div className="flex flex-col gap-8 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
        <ArrowLeft size={14} /> Back to list
      </button>

      <EditHeader
        heading="Ledger Details"
        isDirty={isDirty}
        onEditClick={() => { setIsEditMode(true); setBackupLedger(currentDisplay); setLocalLedger({ ...currentDisplay }); }}
        onCancelClick={() => { setIsEditMode(false); setLocalLedger(backupLedger); }}
        onDeleteClick={() => addMessage({ type: "info", text: "Delete action not yet implemented." })}
        onDiscardClick={() => { setIsEditMode(false); setLocalLedger(backupLedger); }}
        onSaveClick={() => { setIsEditMode(false); handleSave(); }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DetailBlock title="Relation Mapping" isEditMode={isEditMode} onChange={handleChange} fields={fields} />

        <div className="flex flex-col gap-8">
          <DetailBlock
            title="Core Transaction"
            isEditMode={isEditMode}
            onChange={(key, value) => handleChange(key, value)}
            fields={[
              { label: "Transaction Date", key: "date", value: formatDate(new Date(currentDisplay.date)), isEditable: isEditMode },
              { label: "Category", key: "category", value: currentDisplay.category, isEditable: isEditMode, options: getOptions("category") },
              { label: "Transaction Type", key: "transaction_type", value: currentDisplay.transaction_type, isEditable: isEditMode, options: getOptions("transaction_type") },
              { label: "Description", key: "description", value: currentDisplay.description || "—", isEditable: isEditMode },
            ]}
          />
          <DetailBlock
            title="Financials"
            isEditMode={isEditMode}
            onChange={(key, value) => handleChange(key, value)}
            fields={[
              { label: "Debit (Outgoing)", key: "debit", value: currentDisplay.debit ? `₹${currentDisplay.debit}` : "0", isEditable: isEditMode },
              { label: "Credit (Incoming)", key: "credit", value: currentDisplay.credit ? `₹${currentDisplay.credit}` : "0", isEditable: isEditMode },
              { label: "Payment Mode", key: "payment_mode", value: currentDisplay.payment_mode, isEditable: isEditMode, options: getOptions("payment_mode") },
            ]}
          />
        </div>

        <DetailBlock
          title="References & Traceability"
          isEditMode={isEditMode}
          onChange={(key, value) => handleChange(key, value)}
          fields={[
            { label: "Reference Type", key: "reference_type", value: currentDisplay.reference_type, isEditable: isEditMode, options: getOptions("reference_type") },
            { label: "Reference Number", key: "reference_no", value: currentDisplay.reference_no, isEditable: isEditMode },
            { label: "Notes", key: "notes", value: currentDisplay.notes || "—", isEditable: isEditMode },
          ]}
        />

        <DetailBlock
          title="System Metadata"
          fields={[]}
          childs={
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-100">
              <MetaFields
                value={currentDisplay.meta}
                isEditMode={isEditMode}
                onChange={(meta) => setLocalLedger((prev) => prev ? { ...prev, meta } : prev)}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default LedgerDetail;
