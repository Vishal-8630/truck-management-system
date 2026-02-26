import { useDrivers } from "@/hooks/useDrivers";
import Loading from "@/components/Loading";
import DriverCard from "@/components/DriverCard";
import { useNavigate } from "react-router-dom";
import { Contact, Plus } from "lucide-react";

const AllDriverEntries = () => {
  const navigate = useNavigate();
  const { useDriversQuery } = useDrivers();
  const { data: drivers = [], isLoading } = useDriversQuery();

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Contact className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Driver <span className="text-indigo-600">Profiles</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage driver records, certifications, and contacts.</p>
        </div>

        <button
          onClick={() => navigate("/journey/add-driver")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus size={18} />
          Register New Driver
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {drivers.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Contact size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold italic">No drivers registered yet.</p>
          </div>
        ) : (
          drivers.map((driver) => (
            <DriverCard
              key={driver._id}
              driver={driver}
              handleClick={(id) => navigate(`/journey/driver-detail/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllDriverEntries;
