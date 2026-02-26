import { useTrucks } from "@/hooks/useTrucks";
import Loading from "@/components/Loading";
import { useNavigate } from "react-router-dom";
import { Truck, Plus, ChevronRight, Gauge } from "lucide-react";

const AllTruckEntries = () => {
  const navigate = useNavigate();
  const { useTrucksQuery } = useTrucks();
  const { data: trucks = [], isLoading } = useTrucksQuery();

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Truck className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Vehicle <span className="text-indigo-600">Fleet</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage and monitor all company trucks and carriers.</p>
        </div>

        <button
          onClick={() => navigate("/journey/add-truck")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus size={18} />
          Register New Truck
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trucks.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Truck size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold italic">No trucks registered in the fleet.</p>
          </div>
        ) : (
          trucks.map((truck) => (
            <div
              key={truck._id}
              onClick={() => navigate(`/journey/truck/${truck._id}`)}
              className="card-premium p-6 group cursor-pointer hover:border-indigo-200 hover:ring-4 hover:ring-indigo-50 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <Truck size={24} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registration No.</span>
                <span className="text-xl font-extrabold text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{truck.truck_no}</span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Gauge size={14} />
                  <span className="text-xs font-bold">Details</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllTruckEntries;
