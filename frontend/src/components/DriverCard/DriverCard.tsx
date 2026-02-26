import type { FC } from "react";
import type { DriverType } from "@/types/driver";
import NoImg from "@/assets/no-img.jpg";
import { ChevronRight, Phone, ShieldCheck } from "lucide-react";

interface driverCardProps {
  driver: DriverType;
  handleClick: (id: string) => void;
}

const DriverCard: FC<driverCardProps> = ({ driver, handleClick }) => {
  return (
    <div
      className="card-premium p-6 group cursor-pointer hover:border-indigo-200 hover:ring-4 hover:ring-indigo-50 transition-all duration-300 flex flex-col items-center text-center gap-4"
      onClick={() => handleClick(driver._id)}
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner group-hover:border-indigo-100 transition-colors">
          <img
            src={driver.driver_img || NoImg}
            alt={driver.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 text-white rounded-full border-4 border-white flex items-center justify-center shadow-lg">
          <ShieldCheck size={14} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Driver Associate</span>
        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{driver.name}</h3>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
          <Phone size={12} />
          Contact
        </div>
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg shadow-indigo-100">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default DriverCard;

