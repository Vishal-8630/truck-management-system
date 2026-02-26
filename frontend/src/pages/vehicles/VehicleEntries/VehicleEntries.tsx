import { useEffect, useState } from "react";
import { type VehicleEntryType } from "@/types/vehicleEntry";
import Loading from "@/components/Loading";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import VehicleEntryDropdown from "@/components/VehicleEntryDropdown";
import { VehicleEntryFilters } from "@/filters/vehicleEntryFilters";
import PaginatedList from "@/components/PaginatedList";
import FilterContainer from "@/components/FilterContainer";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useItemStates } from "@/hooks/useItemStates";
import ExcelButton from "@/components/ExcelButton";
import { Truck, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VehicleEntries = () => {
  const { useVehicleEntriesQuery } = useVehicleEntries();
  const { data: vehicleEntries = [], isLoading } = useVehicleEntriesQuery();
  const navigate = useNavigate();

  const [filteredEntries, setFilteredEntries] = useState<VehicleEntryType[]>([]);
  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<VehicleEntryType>(vehicleEntries);

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

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Truck className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Vehicle <span className="text-blue-600">Logs</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Track and manage vehicle movement and entries.</p>
        </div>

        <div className="flex items-center gap-3">
          <ExcelButton data={filteredEntries} fileNamePrefix="Vehicle_Entries" />
          <button
            onClick={() => navigate('/vehicle-entry/new-entry')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold font-heading shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            New Log
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100">
        <FilterContainer
          data={vehicleEntries}
          filters={VehicleEntryFilters}
          onFiltered={setFilteredEntries}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 italic">Recent Logs</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredEntries.length} Record(s) Found</span>
        </div>

        <PaginatedList
          items={filteredEntries}
          itemsPerPage={10}
          renderItem={(v) => (
            <motion.div
              key={v._id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-4 last:mb-0"
            >
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
          )}
        />
      </div>
    </div>
  );
};

export default VehicleEntries;
