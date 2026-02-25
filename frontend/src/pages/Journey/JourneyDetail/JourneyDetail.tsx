import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../../../app/store";
import {
  deleteJourneyEntryAsync,
  fetchJourneyEntriesAsync,
  journeySelectors,
  selectJourneyLoading,
  updateJourneyEntryAsync,
} from "../../../features/journey";
import Loading from "../../../components/Loading";
import { formatDate } from "../../../utils/formatDate";
import type { JourneyType } from "../../../types/journey";
import ExpenseSection from "./components/ExpenseSection";
import DetailBlock from "./components/DetailBlock";
import { addMessage } from "../../../features/message";
import EditHeader from "../../../components/EditHeader";
import type { Option } from "../../NewBillingEntry/constants";
import { ArrowLeft, Navigation, Truck, DollarSign, Activity, FileText } from "lucide-react";

const JourneyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectJourneyLoading);
  const journies = useSelector(journeySelectors.selectAll);
  const [localJourney, setLocalJourney] = useState<JourneyType | null>(null);
  const [backupJourney, setBackupJourney] = useState<JourneyType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const emptyFieldValue = "----------";
  const status_options: Option[] = [
    { label: "Active", value: "Active" },
    { label: "Completed", value: "Completed" },
    { label: "Delayed", value: "Delayed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  useEffect(() => {
    if (!journies?.length) dispatch(fetchJourneyEntriesAsync());
  }, [dispatch, journies?.length]);

  const journey = journies?.find((j) => j._id === id);

  useEffect(() => {
    if (journey && !loading) setLocalJourney(journey);
  }, [journey, loading, id]);

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleBtnClick = (field: string) => {
    setLocalJourney((prev) => {
      if (!prev) return prev;
      const now = String(new Date());
      const daily_progress = prev.daily_progress || [];

      const nextDate = new Date(
        daily_progress[daily_progress.length - 1]?.date || new Date()
      );
      const nextDay =
        parseInt(daily_progress[daily_progress.length - 1]?.day_number) + 1 ||
        1;
      nextDate.setDate(nextDate.getDate() + 1);

      const updates: Record<string, any> = {
        driver_expense: { amount: "", reason: "", date: now },
        diesel_expense: { amount: "", quantity: "", filling_date: now },
        delay: { place: "", reason: "", date: now },
        issue: { note: "", date: now },
        daily_progress: {
          day_number: String(nextDay),
          date: String(nextDate),
          location: "",
          remarks: "",
        },
      };

      const key =
        field === "driver_expense"
          ? "driver_expenses"
          : field === "diesel_expense"
            ? "diesel_expenses"
            : field === "delay"
              ? "delays"
              : field === "issue"
                ? "issues"
                : "daily_progress";

      return {
        ...prev,
        [key]: [...(prev[key] || []), updates[field]],
      } as JourneyType;
    });
  };

  const handleSave = async () => {
    try {
      const resultAction = await dispatch(
        updateJourneyEntryAsync(localJourney!)
      );
      if (updateJourneyEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Journey updated successfully" })
        );
      } else if (updateJourneyEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          dispatch(
            addMessage({ type: "error", text: "Failed to update journey" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteJourneyEntryAsync(id));
      if (deleteJourneyEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Journey deleted successfully" })
        );
        navigate("/journey/all-journey-entries");
      } else if (deleteJourneyEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          dispatch(
            addMessage({ type: "error", text: "Failed to delete journey" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const isDirty =
    localJourney && backupJourney
      ? JSON.stringify(localJourney) !== JSON.stringify(backupJourney)
      : false;

  if (loading || !localJourney) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Fleet
        </button>

        <EditHeader
          heading="Journey Roadmap"
          isDirty={isDirty}
          onEditClick={() => {
            setBackupJourney(localJourney);
            setIsEditMode(true);
          }}
          onSaveClick={() => {
            handleSave();
            setIsEditMode(false);
          }}
          onCancelClick={() => {
            setLocalJourney(backupJourney);
            setIsEditMode(false);
          }}
          onDeleteClick={() => handleDelete(localJourney._id)}
          onDiscardClick={() => {
            setLocalJourney(backupJourney);
            setIsEditMode(false);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Details Area */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Journey Status Ribbon */}
          <div className={`
                p-6 rounded-[2rem] flex items-center justify-between border-2
                ${localJourney.status === 'Completed' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
              localJourney.status === 'Delayed' ? 'bg-amber-50/50 border-amber-100 text-amber-700' :
                'bg-indigo-50/50 border-indigo-100 text-indigo-700'}
            `}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Live Journey Status</span>
                <h2 className="text-xl font-black italic tracking-tight">{localJourney.status}</h2>
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
                setLocalJourney((prev) => {
                  if (!prev) return prev;
                  return { ...prev, [key]: value };
                });
              }}
              fields={[
                { label: "Truck Registration", value: localJourney.truck?.truck_no },
                { label: "Assigned Driver", value: localJourney.driver?.name },
                { label: "Starting Point", value: localJourney.from },
                { label: "Destination", value: localJourney.to },
                { label: "Payload Weight (Kg)", value: localJourney.loaded_weight },
                {
                  label: "Mileage Target",
                  key: "average_mileage",
                  value: localJourney.average_mileage,
                  isEditable: true,
                },
                {
                  label: "Allocated Cash",
                  key: "journey_starting_cash",
                  value: localJourney.journey_starting_cash,
                  isEditable: true,
                },
              ]}
            />

            <DetailBlock
              title="Travel Logs"
              icon={<Navigation size={18} />}
              isEditMode={isEditMode}
              onChange={(key, value) => {
                setLocalJourney((prev) => {
                  if (!prev) return prev;
                  if (key === "route") {
                    return {
                      ...prev,
                      route: value.split(",").map((r) => r.trim()),
                    } as JourneyType;
                  }
                  return { ...prev, [key]: value } as JourneyType;
                });
              }}
              fields={[
                {
                  label: "Planned Days",
                  value: localJourney.journey_days,
                  key: "journey_days",
                  isEditable: true,
                },
                {
                  label: "Odometer Initial",
                  value: localJourney.starting_kms,
                  key: "starting_kms",
                  isEditable: true,
                },
                {
                  label: "Odometer Final",
                  value: localJourney.ending_kms,
                  key: "ending_kms",
                  isEditable: true,
                },
                {
                  label: "Assigned Route",
                  value: localJourney.route?.join(", "),
                  key: "route",
                  isEditable: true,
                },
                {
                  label: "Commencement Date",
                  value: safeDate(localJourney.journey_start_date),
                  key: "journey_start_date",
                  isEditable: true,
                },
                {
                  label: "Completion Date",
                  value: safeDate(localJourney.journey_end_date),
                  key: "journey_end_date",
                  isEditable: true
                },
                {
                  label: "Update Status",
                  value: localJourney.status,
                  isEditable: true,
                  key: "status",
                  options: status_options,
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-10">
            <ExpenseSection
              title="Driver Ledger"
              data={localJourney.driver_expenses || []}
              fields={[
                { label: "Amt", key: "amount" },
                { label: "Note", key: "reason" },
                { label: "Date", key: "date" },
              ]}
              onAdd={() => handleBtnClick("driver_expense")}
              onChange={(updatedData) =>
                setLocalJourney((prev) =>
                  prev ? { ...prev, driver_expenses: updatedData } : prev
                )
              }
              isEditMode={isEditMode}
            />

            <ExpenseSection
              title="Diesel Logs"
              data={localJourney.diesel_expenses || []}
              fields={[
                { label: "Amt", key: "amount" },
                { label: "Qty", key: "quantity" },
                { label: "Date", key: "filling_date" },
              ]}
              onAdd={() => handleBtnClick("diesel_expense")}
              onChange={(updatedData) =>
                setLocalJourney((prev) =>
                  prev ? { ...prev, diesel_expenses: updatedData } : prev
                )
              }
              isEditMode={isEditMode}
            />

            <ExpenseSection
              title="Transit Delays"
              data={localJourney.delays || []}
              fields={[
                { label: "Location", key: "place" },
                { label: "Cause", key: "reason" },
                { label: "Date", key: "date" },
              ]}
              onAdd={() => handleBtnClick("delay")}
              onChange={(updatedData) =>
                setLocalJourney((prev) =>
                  prev ? { ...prev, delays: updatedData } : prev
                )
              }
              isEditMode={isEditMode}
            />

            <ExpenseSection
              title="Route Checkpoints"
              data={localJourney.daily_progress || []}
              fields={[
                { label: "Day", key: "day_number" },
                { label: "Date", key: "date" },
                { label: "At", key: "location" },
                { label: "Note", key: "remarks" },
              ]}
              onAdd={() => handleBtnClick("daily_progress")}
              onChange={(updatedData) =>
                setLocalJourney((prev) =>
                  prev ? { ...prev, daily_progress: updatedData } : prev
                )
              }
              isEditMode={isEditMode}
            />

            <ExpenseSection
              title="Reported Incidents"
              data={localJourney.issues || []}
              fields={[
                { label: "Observation", key: "note" },
                { label: "Date", key: "date" },
              ]}
              onAdd={() => handleBtnClick("issue")}
              onChange={(updatedData) =>
                setLocalJourney((prev) =>
                  prev ? { ...prev, issues: updatedData } : prev
                )
              }
              isEditMode={isEditMode}
            />
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <DollarSign size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest italic">Financial Overview</h3>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Running Expense</span>
                  <span className="text-2xl font-black italic">₹{localJourney.total_driver_expense || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Diesel Cost</span>
                  <span className="text-2xl font-black italic">₹{localJourney.total_diesel_expense || 0}</span>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Total Trip Investment</span>
                  <div className="text-4xl font-black italic">₹{localJourney.total_expense || 0}</div>
                </div>
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
                  return {
                    ...prev,
                    delivery_details: {
                      ...prev.delivery_details,
                      [subKey]: value,
                    },
                  } as JourneyType;
                }

                return { ...prev, [key]: value } as JourneyType;
              });
            }}
            fields={[
              {
                label: "Receiver Name",
                value: localJourney.delivery_details?.delivered_to,
                key: "delivery_details.delivered_to",
                isEditable: true,
              },
              {
                label: "Warehouse Entry",
                value: safeDate(localJourney.delivery_details?.entry_date),
                key: "delivery_details.entry_date",
                isEditable: true,
              },
              {
                label: "Container Empty",
                value: safeDate(localJourney.delivery_details?.empty_date),
                key: "delivery_details.empty_date",
                isEditable: true,
              },
              {
                label: "POD Remarks",
                value: localJourney.delivery_details?.remarks,
                key: "delivery_details.remarks",
                isEditable: true,
              },
            ]}
          />

          <DetailBlock
            title="Account Settlements"
            icon={<DollarSign size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalJourney((prev) => {
                if (!prev) return prev;

                if (key.startsWith("settlements.")) {
                  const subKey = key.split(".")[1];
                  return {
                    ...prev,
                    settlement: {
                      ...prev.settlement,
                      [subKey]: value,
                    },
                  } as JourneyType;
                }

                return { ...prev, [key]: value } as JourneyType;
              });
            }}
            fields={[
              {
                label: "Final Paid Amt",
                value: localJourney.settlement?.amount_paid,
                key: "settlement.amount_paid",
                isEditable: true,
              },
              {
                label: "Payment Date",
                value: safeDate(localJourney.settlement?.date_paid),
                key: "settlement.date_paid",
                isEditable: true,
              },
              {
                label: "Txn Mode",
                value: localJourney.settlement.mode,
                key: "settlement.mode",
                isEditable: true,
              },
              {
                label: "Final Remarks",
                value: localJourney.settlement?.remarks,
                key: "settlement.remarks",
                isEditable: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default JourneyDetail;
