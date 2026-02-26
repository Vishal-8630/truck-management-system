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
import {
  ArrowLeft, Wallet, Calendar, Receipt, Tag, Clock, MapPin, FileText
} from "lucide-react";
import DeleteConfirm from "@/components/DeleteConfirm";

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
  const { useLedgersQuery, useUpdateLedgerMutation, useDeleteLedgerMutation } = useLedgers();

  const { data: journies = [] } = useJourneysQuery();
  const { data: trucks = [] } = useTrucksQuery();
  const { data: drivers = [] } = useDriversQuery();
  const { data: parties = [] } = useBillingPartiesQuery();
  const { data: settlements = [] } = useSettlementsQuery();
  const { data: vehicleEntries = [] } = useVehicleEntriesQuery();
  const { data: ledgers = [], isLoading } = useLedgersQuery();
  const updateLedger = useUpdateLedgerMutation();
  const deleteLedger = useDeleteLedgerMutation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [localLedger, setLocalLedger] = useState<LedgerType | null>(null);
  const [backupLedger, setBackupLedger] = useState<LedgerType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const getDisplayLabel = (key: LedgerRelationKey): string => {
    const val = (currentDisplay as any)[key];
    if (!val) return "—";

    const id = typeof val === "string" ? val : val._id;
    if (!id) return "—";

    const obj = dataMap[key].find((item: any) => item._id === id) || (typeof val === "object" ? val : null);
    if (!obj) return "—";

    switch (key) {
      case "journey":
        return `${obj.truck?.truck_no || ""} | ${obj.driver?.name || (obj.driver as any)?.name || ""} | ${obj.from || ""} | ${obj.to || ""}`;
      case "truck":
        return obj.truck_no || "—";
      case "driver":
        return obj.name || (obj as any).name || "—";
      case "party":
        return obj.name || (obj as any).name || "—";
      case "settlement":
        return obj.driver ? `${obj.driver.name || (obj.driver as any)?.name || ""} | ${formatDate(new Date(obj.period?.from))} | ${formatDate(new Date(obj.period?.to))}` : "—";
      case "vehicle_entry":
        return `${obj.vehicle_no || ""} | ${obj.from || ""} | ${obj.to || ""}`;
      default:
        return "—";
    }
  };

  const handleChange = (key: string, value: string) => {
    const typedKey = key as LedgerRelationKey;
    if (typedKey in dataMap) {
      if (!value || value === "") {
        setLocalLedger((prev) => (prev ? { ...prev, [typedKey]: null } : prev));
        return;
      }
      const selected = dataMap[typedKey].find((item: any) => item._id === value);
      setLocalLedger((prev) => (prev ? { ...prev, [typedKey]: selected || value } : prev));
      return;
    }
    setLocalLedger((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    const s = search.toLowerCase();
    switch (field) {
      case "journey": {
        return journies
          .filter((j: any) => j.truck?.truck_no?.toLowerCase().includes(s) || (j.driver as any)?.name?.toLowerCase().includes(s) || j.from.toLowerCase().includes(s) || j.to.toLowerCase().includes(s))
          .map((j: any) => ({ label: `${j.truck?.truck_no} | ${(j.driver as any)?.name} | ${j.from} | ${j.to} | ${formatDate(new Date(j.journey_start_date))}`, value: j._id }));
      }
      case "truck": return trucks.filter((t: any) => t.truck_no.toLowerCase().includes(s)).map((t: any) => ({ label: t.truck_no, value: t._id }));
      case "driver": return drivers.filter((d: any) => d.name?.toLowerCase().includes(s)).map((d: any) => ({ label: d.name, value: d._id }));
      case "party": return parties.filter((p: any) => p.name.toLowerCase().includes(s)).map((p: any) => ({ label: p.name, value: p._id }));
      case "settlement": return settlements.filter((s_: any) => (s_.driver as any)?.name?.toLowerCase().includes(s)).map((s_: any) => ({ label: `${(s_.driver as any)?.name} | ${formatDate(new Date(s_.period.from))} | ${formatDate(new Date(s_.period.to))}`, value: s_._id }));
      case "vehicle_entry": return vehicleEntries.filter((ve: any) => ve.vehicle_no.toLowerCase().includes(s) || ve.from.toLowerCase().includes(s) || ve.to.toLowerCase().includes(s)).map((ve: any) => ({ label: `${ve.vehicle_no} | ${ve.from} | ${ve.to}`, value: ve._id }));
      default: return [];
    }
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

  const handleDelete = async () => {
    try {
      if (!ledger) return;
      await deleteLedger.mutateAsync(ledger._id);
      addMessage({ type: "success", text: "Ledger entry deleted successfully" });
      navigate("/ledger/all-ledgers");
    } catch {
      addMessage({ type: "error", text: "Failed to delete ledger entry" });
    }
  };

  const fieldKeys: LedgerRelationKey[] = ["journey", "truck", "driver", "party", "settlement", "vehicle_entry"];
  const fields = fieldKeys.map((key: LedgerRelationKey) => {
    const val = (currentDisplay as any)[key];
    const id = val?._id || (typeof val === "string" ? val : "");

    return {
      label: key.replace("_", " ").replace(/^\w/, (c: string) => c.toUpperCase()),
      key,
      options: optionConfig[key](),
      value: isEditMode ? id : getDisplayLabel(key),
      isEditable: isEditMode,
      mode: "search" as const,
      fetchOptions: (s: string) => fetchOptions(s, key),
    };
  });

  const amount = currentDisplay.transaction_type === "Debit" ? currentDisplay.debit : currentDisplay.credit;
  const isDebit = currentDisplay.transaction_type === "Debit";

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Ledgers
        </button>

        <EditHeader
          heading={`Transaction detail ${isDebit ? 'Debit' : 'Credit'}`}
          description="Unified Ledger Entry • Financial Record Management"
          isDirty={isDirty}
          onEditClick={() => { setIsEditMode(true); setBackupLedger(currentDisplay); setLocalLedger({ ...currentDisplay }); }}
          onCancelClick={() => { setIsEditMode(false); setLocalLedger(backupLedger); }}
          onDeleteClick={() => setShowDeleteModal(true)}
          onDiscardClick={() => { setIsEditMode(false); setLocalLedger(backupLedger); }}
          onSaveClick={() => { setIsEditMode(false); handleSave(); }}
        />
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`card-premium p-6 flex items-center gap-4 ${isDebit ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${isDebit ? 'bg-rose-600 shadow-rose-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
            <Wallet size={20} />
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
              Amount ({currentDisplay.transaction_type})
            </span>
            <p className={`text-2xl font-black italic mt-1 leading-none ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹{amount}
            </p>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Entry Date</span>
            <p className="text-lg font-black text-slate-900 mt-1 uppercase leading-none">
              {formatDate(new Date(currentDisplay.date))}
            </p>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-4 bg-indigo-50/30 border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Category</span>
            <p className="text-lg font-black text-slate-900 mt-1 uppercase leading-none italic">
              {currentDisplay.category}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DetailBlock
          title="Core Transaction Info"
          icon={<Receipt size={18} />}
          isEditMode={isEditMode}
          onChange={(key, value) => {
            handleChange(key, value);
          }}
          fields={[
            { label: "Category", key: "category", value: currentDisplay.category, isEditable: isEditMode, options: getOptions("category"), mode: "select" },
            { label: "Transaction Type", key: "transaction_type", value: currentDisplay.transaction_type, isEditable: isEditMode, options: getOptions("transaction_type"), mode: "select" },
            { label: "Payment Mode", key: "payment_mode", value: currentDisplay.payment_mode, isEditable: isEditMode, options: getOptions("payment_mode"), mode: "select" },
            { label: "Debit (Outgoing)", key: "debit", value: currentDisplay.debit ?? "0", isEditable: isEditMode },
            { label: "Credit (Incoming)", key: "credit", value: currentDisplay.credit ?? "0", isEditable: isEditMode },
          ]}
        />

        <div className="flex flex-col gap-8">
          <DetailBlock
            title="Entity Associations"
            icon={<MapPin size={18} />}
            isEditMode={isEditMode}
            onChange={handleChange}
            fields={fields}
          />
        </div>

        <DetailBlock
          title="References & Notes"
          icon={<FileText size={18} />}
          isEditMode={isEditMode}
          onChange={(key, value) => handleChange(key, value)}
          fields={[
            { label: "Reference Type", key: "reference_type", value: currentDisplay.reference_type, isEditable: isEditMode, options: getOptions("reference_type"), mode: "select" },
            { label: "Reference Number", key: "reference_no", value: currentDisplay.reference_no, isEditable: isEditMode },
            { label: "Description", key: "description", value: currentDisplay.description || "—", isEditable: isEditMode },
            { label: "Notes", key: "notes", value: currentDisplay.notes || "—", isEditable: isEditMode },
          ]}
        />

        <DetailBlock
          title="System Metadata"
          icon={<Clock size={18} />}
          fields={[]}
          childs={
            <div className="flex flex-col gap-6">
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-100">
                <MetaFields
                  value={currentDisplay.meta}
                  isEditMode={isEditMode}
                  onChange={(meta) => setLocalLedger((prev) => prev ? { ...prev, meta } : prev)}
                />
              </div>

              <div className="flex flex-col gap-4 px-2">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-300" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Created</span>
                    <span className="text-xs font-bold text-slate-600">{formatDate(new Date(currentDisplay.createdAt))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-300" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</span>
                    <span className="text-xs font-bold text-slate-600">{formatDate(new Date(currentDisplay.updatedAt))}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <DeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Ledger Entry?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this transaction from the records?"
      />
    </div>
  );
};

export default LedgerDetail;
