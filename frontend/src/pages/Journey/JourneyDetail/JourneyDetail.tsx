import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import styles from "./JourneyDetail.module.scss";
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
          console.log("Errors while adding new journey", errors);
          dispatch(
            addMessage({ type: "error", text: "Failed to update journey" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
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
          console.log("Errors while deleting journey", errors);
          dispatch(
            addMessage({ type: "error", text: "Failed to delete journey" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const isDirty =
    localJourney && backupJourney
      ? JSON.stringify(localJourney) !== JSON.stringify(backupJourney)
      : false;

  if (loading || !localJourney) return <Loading />;

  return (
    <div className={styles.journeyDetailContainer}>
      <EditHeader
        heading="Truck Journey"
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

      <div className={styles.journeyDetail}>
        {/* Journey Detail - Readonly */}
        <DetailBlock
          title="Journey Detail"
          isEditMode={isEditMode}
          onChange={(key, value) => {
            setLocalJourney((prev) => {
              if (!prev) return prev;
              return { ...prev, [key]: value };
            });
          }}
          fields={[
            { label: "Truck Number", value: localJourney.truck?.truck_no },
            { label: "Driver", value: localJourney.driver?.name },
            { label: "From", value: localJourney.from },
            { label: "To", value: localJourney.to },
            { label: "Weight (Kg)", value: localJourney.loaded_weight },
            {
              label: "Mileage",
              key: "average_mileage",
              value: localJourney.average_mileage,
              isEditable: true,
            },
            {
              label: "Starting Cash",
              key: "journey_starting_cash",
              value: localJourney.journey_starting_cash,
              isEditable: true,
            },
          ]}
        />

        {/* Journey Info - Editable Fields */}
        <DetailBlock
          title="Journey Information"
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
              label: "Journey Days",
              value: localJourney.journey_days,
              key: "journey_days",
              isEditable: true,
            },
            {
              label: "Starting Kms",
              value: localJourney.starting_kms,
              key: "starting_kms",
              isEditable: true,
            },
            {
              label: "Ending Kms",
              value: localJourney.ending_kms,
              key: "ending_kms",
              isEditable: true,
            },
            {
              label: "Route",
              value: localJourney.route?.join(", "),
              key: "route",
              isEditable: true,
            },
            {
              label: "Journey Start Date",
              value: safeDate(localJourney.journey_start_date),
              key: "journey_start_date",
              isEditable: true,
            },
            {
              label: "Journey End Date",
              value: safeDate(localJourney.journey_end_date),
              key: "journey_end_date",
              isEditable: true
            },
            {
              label: "Journey Status",
              value: localJourney.status,
              isEditable: true,
              key: "status",
              options: status_options,
            },
          ]}
        />

        {/* Editable Expense Sections */}
        <ExpenseSection
          title="Driver Expense"
          data={localJourney.driver_expenses || []}
          fields={[
            { label: "Amount", key: "amount" },
            { label: "Reason", key: "reason" },
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
          title="Diesel Expense"
          data={localJourney.diesel_expenses || []}
          fields={[
            { label: "Amount", key: "amount" },
            { label: "Quantity", key: "quantity" },
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
          title="Delay"
          data={localJourney.delays || []}
          fields={[
            { label: "Place", key: "place" },
            { label: "Reason", key: "reason" },
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
          title="Daily Progress"
          data={localJourney.daily_progress || []}
          fields={[
            { label: "Day", key: "day_number" },
            { label: "Date", key: "date" },
            { label: "Location", key: "location" },
            { label: "Remarks", key: "remarks" },
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
          title="Issues"
          data={localJourney.issues || []}
          fields={[
            { label: "Note", key: "note" },
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

        {/* Expense Summary - Readonly */}
        <DetailBlock
          title="Expenses Summary"
          fields={[
            {
              label: "Total Working Expense",
              value: localJourney.total_driver_expense,
            },
            {
              label: "Total Diesel Expense",
              value: localJourney.total_diesel_expense,
            },
            { label: "Total Expense", value: localJourney.total_expense },
          ]}
        />

        {/* Delivery Details - Editable Fields */}
        <DetailBlock
          title="Delivery Details"
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
              label: "Delivered To",
              value: localJourney.delivery_details?.delivered_to,
              key: "delivery_details.delivered_to",
              isEditable: true,
            },
            {
              label: "Entry Date",
              value: localJourney.delivery_details?.entry_date,
              key: "delivery_details.entry_date",
              isEditable: true,
            },
            {
              label: "Empty Date",
              value: localJourney.delivery_details?.empty_date,
              key: "delivery_details.empty_date",
              isEditable: true,
            },
            {
              label: "Remarks",
              value: localJourney.delivery_details?.remarks,
              key: "delivery_details.remarks",
              isEditable: true,
            },
          ]}
        />

        {/* Settlements - Editable Fields */}
        <DetailBlock
          title="Settlements"
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
              label: "Amount Paid",
              value: localJourney.settlement?.amount_paid,
              key: "settlement.amount_paid",
              isEditable: true,
            },
            {
              label: "Date",
              value: localJourney.settlement?.date_paid,
              key: "settlement.date_paid",
              isEditable: true,
            },
            {
              label: "Mode",
              value: localJourney.settlement.mode,
              key: "settlement.mode",
              isEditable: true,
            },
            {
              label: "Remarks",
              value: localJourney.settlement?.remarks,
              key: "settlement.remarks",
              isEditable: true,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default JourneyDetail;
