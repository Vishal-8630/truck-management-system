import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/Loading";
import VehicleEntryDropdown from "@/components/VehicleEntryDropdown";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useItemStates } from "@/hooks/useItemStates";
import type { VehicleEntryType } from "@/types/vehicleEntry";

const VehicleEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useVehicleEntriesQuery } = useVehicleEntries();
  const { data: vehicleEntries = [], isLoading } = useVehicleEntriesQuery();

  const entry = useMemo(
    () => vehicleEntries.find((item: VehicleEntryType) => item._id === id),
    [vehicleEntries, id]
  );

  const singleItem = entry ? [entry] : [];
  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<VehicleEntryType>(singleItem);

  useEffect(() => {
    if (entry && itemStates[entry._id] && !itemStates[entry._id].isOpen) {
      updateItem(entry._id, { isOpen: true });
    }
  }, [entry, itemStates, updateItem]);

  const onVehicleEntryUpdate = (updatedVehicleEntry: VehicleEntryType) => {
    if (!entry) return;
    updateItem(entry._id, { localItem: updatedVehicleEntry });
  };

  if (isLoading || !entry || !itemStates[entry._id]) return <Loading />;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to Vehicle Logs
      </button>

      <VehicleEntryDropdown
        vehicleEntry={entry}
        itemState={itemStates[entry._id]}
        updateItem={updateItem}
        updateDraft={updateDraft}
        toggleEditing={toggleEditing}
        toggleOpen={toggleOpen}
        onVehicleEntryUpdate={onVehicleEntryUpdate}
        disableToggle
      />
    </div>
  );
};

export default VehicleEntryDetail;
