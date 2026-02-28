import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";
import { useMessageStore } from "@/store/useMessageStore";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import type { JourneyType } from "@/types/journey";
import ExpenseSection from "./components/ExpenseSection";
import DetailBlock from "./components/DetailBlock";
import EditHeader from "@/components/EditHeader";
import type { Option } from "@/types/form";
import { motion } from "framer-motion";
import { ArrowLeft, Milestone, Truck, DollarSign, Activity, FileText, Wallet, Calendar, Clock, TrendingUp, TrendingDown, Receipt } from "lucide-react";

const JourneyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useJourneysQuery, useUpdateJourneyMutation, useDeleteJourneyMutation } = useJourneys();
  const { useBillEntriesQuery } = useBillEntries();

  const { data: journies = [], isLoading } = useJourneysQuery();
  const { data: billEntries = [] } = useBillEntriesQuery();
  const updateJourney = useUpdateJourneyMutation();
  const deleteJourney = useDeleteJourneyMutation();

  const journey = journies.find((j: JourneyType) => j._id === id) ?? null;
  const [localJourney, setLocalJourney] = useState<JourneyType | null>(null);
  const [backupJourney, setBackupJourney] = useState<JourneyType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentDisplay = localJourney ?? journey;

  // --- Profitability Intelligence ---
  const { revenue, profit, margin, relatedBills } = useMemo(() => {
    if (!currentDisplay) return { revenue: 0, profit: 0, margin: 0, relatedBills: [] };

    // Normalize truck number for comparison
    const targetTruck = currentDisplay.truck?.truck_no?.replace(/\s/g, "").toUpperCase();
    const start = currentDisplay.journey_start_date ? new Date(currentDisplay.journey_start_date) : null;
    const end = currentDisplay.journey_end_date ? new Date(currentDisplay.journey_end_date) : new Date();

    const matchedBills = billEntries.filter(bill => {
      const billTruck = bill.vehicle_no?.replace(/\s/g, "").toUpperCase();
      const billDate = new Date(bill.bill_date);
      const truckMatch = billTruck === targetTruck;
      const dateMatch = start ? (billDate >= start && billDate <= end) : true;
      return truckMatch && dateMatch;
    });

    const revTotal = matchedBills.reduce((acc, bill) => acc + (Number(bill.grand_total) || 0), 0);
    const expTotal = Number(currentDisplay.total_expense) || 0;
    const netProfit = revTotal - expTotal;
    const netMargin = revTotal > 0 ? (netProfit / revTotal) * 100 : 0;

    return {
      revenue: revTotal,
      profit: netProfit,
      margin: netMargin,
      relatedBills: matchedBills
    };
  }, [billEntries, currentDisplay]);

  const emptyFieldValue = "—";
  const status_options: Option[] = [
    { label: "Active", value: "Active" },
    { label: "Completed", value: "Completed" },
    { label: "Delayed", value: "Delayed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const safeDate = (date?: string) => date ? formatDate(new Date(date)) : emptyFieldValue;

  if (isLoading || !currentDisplay) return <Loading />;

  const isDirty = localJourney && backupJourney
    ? JSON.stringify(localJourney) !== JSON.stringify(backupJourney)
    : false;

  const handleBtnClick = (field: string) => {
    setLocalJourney((prev) => {
      if (!prev) return prev;
      const now = String(new Date());
      const daily_progress = prev.daily_progress || [];
      const nextDate = new Date(daily_progress[daily_progress.length - 1]?.date || new Date());
      const nextDay = parseInt(daily_progress[daily_progress.length - 1]?.day_number) + 1 || 1;
      nextDate.setDate(nextDate.getDate() + 1);

      const updates: Record<string, any> = {
        driver_expense: { amount: "", reason: "", date: now },
        diesel_expense: { amount: "", quantity: "", filling_date: now },
        delay: { place: "", reason: "", date: now },
        issue: { note: "", date: now },
        daily_progress: { day_number: String(nextDay), date: String(nextDate), location: "", remarks: "" },
      };

      const key = field === "driver_expense" ? "driver_expenses"
        : field === "diesel_expense" ? "diesel_expenses"
          : field === "delay" ? "delays"
            : field === "issue" ? "issues"
              : "daily_progress";

      return { ...prev, [key]: [...(prev[key as keyof JourneyType] as any[] || []), updates[field]] } as JourneyType;
    });
  };

  const handleSave = async () => {
    if (!localJourney) return false;
    try {
      await updateJourney.mutateAsync(localJourney);
      addMessage({ type: "success", text: "Journey updated successfully" });
      setLocalJourney(null);
      setErrors({});
      return true;
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);

        // Build a readable message from server error fields
        const errorMessages = Object.values(serverErrors) as string[];
        const toastText = errorMessages.length === 1
          ? errorMessages[0]
          : `${errorMessages.length} fields need attention: ${errorMessages[0]}${errorMessages.length > 1 ? ` (+${errorMessages.length - 1} more)` : ""}`;

        addMessage({ type: "error", text: toastText });

        // Scroll to first highlighted error field
        setTimeout(() => {
          const firstErrorEl = document.querySelector("[data-error='true']");
          if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        addMessage({ type: "error", text: err.response?.data?.message || "Failed to update journey." });
      }
      return false;
    }
  };

  const handleDelete = async (journeyId: string) => {
    try {
      await deleteJourney.mutateAsync(journeyId);
      addMessage({ type: "success", text: "Journey deleted successfully" });
      navigate("/journey/all-journey-entries");
    } catch {
      addMessage({ type: "error", text: "Failed to delete journey" });
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Fleet
        </button>

        <EditHeader
          heading="Journey Roadmap"
          isDirty={isDirty}
          onEditClick={() => { setBackupJourney(currentDisplay); setLocalJourney({ ...currentDisplay }); setIsEditMode(true); }}
          onSaveClick={async () => {
            const success = await handleSave();
            if (success) setIsEditMode(false);
            return success;
          }}
          onCancelClick={() => { setLocalJourney(backupJourney); setIsEditMode(false); setErrors({}); }}
          onDeleteClick={() => handleDelete(currentDisplay._id)}
          onDiscardClick={() => { setLocalJourney(backupJourney); setIsEditMode(false); setErrors({}); }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Details */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Status Ribbon */}
          <div className={`p-6 rounded-[2rem] flex items-center justify-between border-2 ${currentDisplay.status === "Completed" ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
            : currentDisplay.status === "Delayed" ? "bg-amber-50/50 border-amber-100 text-amber-700"
              : "bg-indigo-50/50 border-indigo-100 text-indigo-700"
            }`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm"><Activity size={24} /></div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Live Journey Status</span>
                <h2 className="text-xl font-black italic tracking-tight">{currentDisplay.status}</h2>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Last Updated</span>
              <span className="font-bold">{safeDate(String(new Date()))}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailBlock
              title="Operational Detail"
              icon={<Truck size={18} />}
              isEditMode={isEditMode}
              onChange={(key, value) => {
                setLocalJourney((prev) => prev ? { ...prev, [key]: value } : prev);
                if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
              }}
              errors={errors}
              fields={[
                { label: "Truck Registration", value: currentDisplay.truck?.truck_no },
                { label: "Assigned Driver", value: (currentDisplay.driver as any)?.name },
                { label: "Starting Point", value: currentDisplay.from },
                { label: "Destination", value: currentDisplay.to },
                { label: "Payload Weight (Kg)", value: currentDisplay.loaded_weight },
                { label: "Mileage Target", key: "average_mileage", value: currentDisplay.average_mileage, isEditable: true },
                { label: "Allocated Cash", key: "journey_starting_cash", value: currentDisplay.journey_starting_cash, isEditable: true },
              ]}
            />

            <DetailBlock
              title="Travel Logs"
              icon={<Milestone size={18} />}
              isEditMode={isEditMode}
              onChange={(key, value) => {
                setLocalJourney((prev) => {
                  if (!prev) return prev;
                  if (key === "route") return { ...prev, route: value.split(",").map((r) => r.trim()) } as JourneyType;
                  return { ...prev, [key]: value } as JourneyType;
                });
                if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
              }}
              errors={errors}
              fields={[
                { label: "Planned Days", value: currentDisplay.journey_days, key: "journey_days", isEditable: true },
                { label: "Odometer Initial", value: currentDisplay.starting_kms, key: "starting_kms", isEditable: true },
                { label: "Odometer Final", value: currentDisplay.ending_kms, key: "ending_kms", isEditable: true },
                { label: "Assigned Route", value: currentDisplay.route?.join(", "), key: "route", isEditable: true },
                { label: "Commencement Date", value: isEditMode ? currentDisplay.journey_start_date : safeDate(currentDisplay.journey_start_date), key: "journey_start_date", isEditable: true },
                { label: "Completion Date", value: isEditMode ? currentDisplay.journey_end_date : safeDate(currentDisplay.journey_end_date), key: "journey_end_date", isEditable: true },
                { label: "Update Status", value: currentDisplay.status, isEditable: true, key: "status", options: status_options },
              ]}
            />
          </div>

          <div className="flex flex-col gap-10">
            <ExpenseSection
              title="Driver Ledger"
              data={currentDisplay.driver_expenses || []}
              fields={[{ label: "Amt", key: "amount" }, { label: "Note", key: "reason" }, { label: "Date", key: "date" }]}
              onAdd={() => handleBtnClick("driver_expense")}
              onChange={(updatedData) => setLocalJourney((prev) => prev ? { ...prev, driver_expenses: updatedData } : prev)}
              isEditMode={isEditMode}
            />
            <ExpenseSection
              title="Diesel Logs"
              data={currentDisplay.diesel_expenses || []}
              fields={[{ label: "Amt", key: "amount" }, { label: "Qty", key: "quantity" }, { label: "Date", key: "filling_date" }]}
              onAdd={() => handleBtnClick("diesel_expense")}
              onChange={(updatedData) => setLocalJourney((prev) => prev ? { ...prev, diesel_expenses: updatedData } : prev)}
              isEditMode={isEditMode}
            />
            <ExpenseSection
              title="Transit Delays"
              data={currentDisplay.delays || []}
              fields={[{ label: "Location", key: "place" }, { label: "Cause", key: "reason" }, { label: "Date", key: "date" }]}
              onAdd={() => handleBtnClick("delay")}
              onChange={(updatedData) => setLocalJourney((prev) => prev ? { ...prev, delays: updatedData } : prev)}
              isEditMode={isEditMode}
            />
            <ExpenseSection
              title="Route Checkpoints"
              icon={<Calendar size={18} />}
              data={currentDisplay.daily_progress || []}
              fields={[{ label: "Day", key: "day_number" }, { label: "Date", key: "date" }, { label: "At", key: "location" }, { label: "Note", key: "remarks" }]}
              onAdd={() => handleBtnClick("daily_progress")}
              onChange={(updatedData) => setLocalJourney((prev) => prev ? { ...prev, daily_progress: updatedData } : prev)}
              isEditMode={isEditMode}
            />
            <ExpenseSection
              title="Reported Incidents"
              data={currentDisplay.issues || []}
              fields={[{ label: "Observation", key: "note" }, { label: "Date", key: "date" }]}
              onAdd={() => handleBtnClick("issue")}
              onChange={(updatedData) => setLocalJourney((prev) => prev ? { ...prev, issues: updatedData } : prev)}
              isEditMode={isEditMode}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Profitability Scorecard */}
          <div className="card-premium !p-5 bg-white border-2 border-slate-50 shadow-2xl shadow-indigo-100/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />

            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={16} /></div>
                  <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Profitability IQ</h3>
                </div>
                {profit > 0 ? (
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase flex items-center gap-1">
                    Strong <TrendingUp size={8} />
                  </span>
                ) : profit < 0 ? (
                  <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[7px] font-black uppercase flex items-center gap-1">
                    Below <TrendingDown size={8} />
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Net Trip Profit</span>
                  <div className={`text-3xl font-black italic tracking-tight flex items-baseline gap-2 flex-wrap ${profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    ₹{Math.abs(profit).toLocaleString()}
                    <span className="text-[10px] font-bold not-italic opacity-40 uppercase tracking-widest">{profit >= 0 ? 'Gain' : 'Loss'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Revenue</span>
                    <span className="text-sm font-black italic text-slate-900">₹{revenue.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Margin</span>
                    <span className={`text-sm font-black italic ${margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expense Ratio</span>
                  <span className="text-[10px] font-black text-slate-900">{(100 - margin).toFixed(1)}% of Revenue</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (100 - margin))}%` }}
                    className={`h-full ${margin > 20 ? 'bg-emerald-500' : margin > 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Sources</span>
                <div className="flex flex-col gap-2">
                  {relatedBills.length > 0 ? (
                    relatedBills.map((bill, bIdx) => (
                      <div key={bIdx} className="flex items-center justify-between text-[10px] font-bold p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600">Bill: {bill.bill_no}</span>
                        <span className="text-indigo-600">₹{Number(bill.grand_total).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] font-bold text-slate-400 italic py-2 border border-dashed border-slate-200 rounded-xl text-center">
                      No matching bills found for this travel period.
                    </div>
                  )}
                </div>
              </div>

              {/* Automation Action */}
              {currentDisplay.status === 'Completed' && relatedBills.length === 0 && (
                <button
                  onClick={() => navigate("/bill-entry/new-bill-entry", {
                    state: {
                      draft: {
                        vehicle_no: currentDisplay.truck?.truck_no,
                        billing_party: (currentDisplay.driver as any)?.party || "",
                        bill_date: new Date().toISOString().split('T')[0],
                        lr_date: currentDisplay.journey_start_date,
                        from: currentDisplay.from,
                        to: currentDisplay.to,
                        truck_no: currentDisplay.truck?.truck_no,
                        owner_name: "Divyanshi Road Lines",
                      }
                    }
                  })}
                  className="mt-2 w-full py-4 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-3 group/btn hover:bg-indigo-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100"
                >
                  <Receipt size={16} className="group-hover/btn:rotate-12 transition-transform" />
                  Convert to Bill
                </button>
              )}
            </div>
          </div>

          <div className="card-premium !p-5 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><DollarSign size={16} className="text-emerald-400" /></div>
                <h3 className="text-xs font-black uppercase tracking-widest italic opacity-70">Financial Overview</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Running Expense</span>
                  <span className="text-base font-black italic truncate max-w-[150px]">₹{currentDisplay.total_driver_expense || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Diesel Cost</span>
                  <span className="text-base font-black italic truncate max-w-[150px]">₹{currentDisplay.total_diesel_expense || 0}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 block">Total Investment</span>
                  <div className="text-2xl font-black italic tracking-tighter text-white">₹{currentDisplay.total_expense || 0}</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
                    <Activity size={10} className="text-indigo-400 shrink-0" /> Efficiency
                  </span>
                  <span className="text-sm font-black italic text-white">
                    {currentDisplay.total_diesel_expense ? (Number(currentDisplay.ending_kms || 0) - Number(currentDisplay.starting_kms || 0) / (Number(currentDisplay.total_diesel_expense) / 100 || 1)).toFixed(1) : "0.0"} <span className="text-[8px] opacity-40 not-italic">KMPL</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
                    <Clock size={10} className="text-amber-400 shrink-0" /> Schedule
                  </span>
                  <span className={`text-sm font-black italic ${Number(currentDisplay.journey_days) < (currentDisplay.daily_progress?.length || 0) ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentDisplay.daily_progress?.length || 0} / {currentDisplay.journey_days} <span className="text-[8px] opacity-40 not-italic uppercase">Days</span>
                  </span>
                </div>
              </div>

              {/* Party Payment Highlights */}
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Party Payment</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${currentDisplay.party_payment_status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {currentDisplay.party_payment_status || 'Pending'}
                  </span>
                </div>
                {currentDisplay.party_payment_due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Due Date</span>
                    <span className="text-xs font-black">{formatDate(new Date(currentDisplay.party_payment_due_date))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DetailBlock
            title="Delivery & POD"
            icon={<FileText size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalJourney((prev) => {
                if (!prev) return prev;
                if (key.startsWith("delivery_details.")) {
                  const subKey = key.split(".")[1];
                  return { ...prev, delivery_details: { ...prev.delivery_details, [subKey]: value } } as JourneyType;
                }
                return { ...prev, [key]: value } as JourneyType;
              });
              if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
            }}
            errors={errors}
            fields={[
              { label: "Receiver Name", value: currentDisplay.delivery_details?.delivered_to, key: "delivery_details.delivered_to", isEditable: true },
              { label: "Warehouse Entry", value: isEditMode ? currentDisplay.delivery_details?.entry_date : safeDate(currentDisplay.delivery_details?.entry_date), key: "delivery_details.entry_date", isEditable: true },
              { label: "Container Empty", value: isEditMode ? currentDisplay.delivery_details?.empty_date : safeDate(currentDisplay.delivery_details?.empty_date), key: "delivery_details.empty_date", isEditable: true },
              { label: "POD Remarks", value: currentDisplay.delivery_details?.remarks, key: "delivery_details.remarks", isEditable: true },
            ]}
          />

          <DetailBlock
            title="Account Settlements"
            icon={<DollarSign size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalJourney((prev) => {
                if (!prev) return prev;
                if (key.startsWith("settlement.")) {
                  const subKey = key.split(".")[1];
                  return { ...prev, settlement: { ...prev.settlement, [subKey]: value } } as JourneyType;
                }
                return { ...prev, [key]: value } as JourneyType;
              });
              if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
            }}
            errors={errors}
            fields={[
              { label: "Final Paid Amt", value: currentDisplay.settlement?.amount_paid, key: "settlement.amount_paid", isEditable: true },
              { label: "Payment Date", value: isEditMode ? currentDisplay.settlement?.date_paid : safeDate(currentDisplay.settlement?.date_paid), key: "settlement.date_paid", isEditable: true },
              { label: "Txn Mode", value: currentDisplay.settlement?.mode, key: "settlement.mode", isEditable: true },
              { label: "Final Remarks", value: currentDisplay.settlement?.remarks, key: "settlement.remarks", isEditable: true },
            ]}
          />

          <DetailBlock
            title="Financial Reconciliation"
            icon={<Wallet size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalJourney((prev) => {
                if (!prev) return prev;
                return { ...prev, [key]: value } as JourneyType;
              });
              if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
            }}
            errors={errors}
            fields={[
              {
                label: "Party Pay Status",
                value: currentDisplay.party_payment_status,
                key: "party_payment_status",
                isEditable: true,
                options: [
                  { label: "Pending", value: "Pending" },
                  { label: "Partially Paid", value: "Partially Paid" },
                  { label: "Paid", value: "Paid" }
                ]
              },
              { label: "Payment Due Date", value: isEditMode ? currentDisplay.party_payment_due_date : safeDate(currentDisplay.party_payment_due_date), key: "party_payment_due_date", isEditable: true },
              { label: "Payment Received", value: isEditMode ? currentDisplay.party_payment_received_date : safeDate(currentDisplay.party_payment_received_date), key: "party_payment_received_date", isEditable: true },
              { label: "Payment Remarks", value: currentDisplay.party_payment_remarks, key: "party_payment_remarks", isEditable: true },
              {
                label: "Journey Settled",
                value: currentDisplay.journey_settlement_status || "Unsettled",
                key: "journey_settlement_status",
                isEditable: true,
                options: [
                  { label: "Unsettled", value: "Unsettled" },
                  { label: "Settled", value: "Settled" }
                ]
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default JourneyDetail;
