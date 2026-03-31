import Loading from "@/components/Loading";
import { useHistory } from "@/hooks/useHistory";
import HistoryTimeline from "@/components/ui/HistoryTimeline/HistoryTimeline";
import { X, History } from "lucide-react";

interface HistoryDrawerProps {
  entityType: string;
  entityId: string;
  onClose: () => void;
}

const HistoryDrawer = ({ entityType, entityId, onClose }: HistoryDrawerProps) => {
  const { data, isLoading } = useHistory(entityType, entityId);

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-slate-900/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <History size={20} className="text-indigo-600" />
                Update History
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                {entityType.replace("_", " ")} timeline
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Close history panel"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? <Loading /> : <HistoryTimeline items={data?.rows || []} />}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HistoryDrawer;
