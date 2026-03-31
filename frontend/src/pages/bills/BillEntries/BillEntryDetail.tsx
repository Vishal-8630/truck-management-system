import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/Loading";
import BillEntriesDropdownView from "@/components/BillEntriesDropdownView";
import { useBillEntries } from "@/hooks/useLedgers";
import type { BillEntryType } from "@/types/billEntry";

const BillEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useBillEntriesQuery } = useBillEntries();
  const { data: billEntries = [], isLoading } = useBillEntriesQuery();

  const entry = useMemo(
    () => billEntries.find((item: BillEntryType) => item._id === id),
    [billEntries, id]
  );

  if (isLoading || !entry) return <Loading />;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to Bill Entries
      </button>

      <BillEntriesDropdownView entry={entry} initiallyOpen disableToggle />
    </div>
  );
};

export default BillEntryDetail;
