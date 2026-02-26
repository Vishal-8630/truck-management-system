import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import FormSection from "@/components/FormSection";
import FormInput from "@/components/FormInput";
import { useSettlements } from "@/hooks/useSettlements";
import { useDrivers } from "@/hooks/useDrivers";
import { useMessageStore } from "@/store/useMessageStore";
import Loading from "@/components/Loading";
import { Calculator, Calendar, ArrowLeft, Search, Wallet } from "lucide-react";

const DriverSettlement = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useDriversQuery } = useDrivers();
  const { useSettlementPreviewMutation } = useSettlements();
  const { data: drivers = [] } = useDriversQuery();
  const previewMutation = useSettlementPreviewMutation();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ratePerKm, setRatePerKm] = useState("");
  const [dieselRate, setDieselRate] = useState("");
  const [extraExpense, setExtraExpense] = useState("");

  if (!id) return <Loading />;
  const driver = drivers.find((d) => d._id === id);

  const handleClick = async () => {
    if (!from || !to || !ratePerKm || !dieselRate) {
      addMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }
    try {
      const result = await previewMutation.mutateAsync({ driverId: id, from, to, ratePerKm, dieselRate, extraExpense });
      const data = result?.data;
      if (data && data.journeys?.length > 0) {
        navigate(`/journey/driver-detail/${id}/settlement/preview`, {
          state: { data, period: { from, to }, driver },
        });
      } else {
        addMessage({ type: "error", text: result?.message || "No journeys found for this period." });
      }
    } catch {
      addMessage({ type: "error", text: "Failed to fetch settlement preview." });
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Driver
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Calculator className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Trip <span className="text-indigo-600">Settlement</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Calculate and finalize earnings for {driver?.name || "Driver"}.</p>
        </div>
      </div>

      <div className="card-premium p-8 lg:p-10 flex flex-col gap-10">
        <FormSection title="Settlement Period" icon={<Calendar size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput type="date" id="from" name="from" label="Start Date" value={from} onChange={(val) => setFrom(val)} />
            <FormInput type="date" id="to" name="to" label="End Date" value={to} onChange={(val) => setTo(val)} />
          </div>
        </FormSection>

        <FormSection title="Settlement Rates" icon={<Wallet size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput type="number" id="ratePerKm" name="ratePerKm" label="Rate Per Km" value={ratePerKm} placeholder="e.g. 5.50" onChange={(val) => setRatePerKm(val)} />
            <FormInput type="number" id="dieselRate" name="dieselRate" label="Diesel Rate (₹/L)" value={dieselRate} placeholder="e.g. 90.00" onChange={(val) => setDieselRate(val)} />
            <FormInput type="number" id="extraExpense" name="extraExpense" label="Extra Deductions" value={extraExpense} placeholder="0.00" onChange={(val) => setExtraExpense(val)} />
          </div>
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            onClick={handleClick}
            disabled={previewMutation.isPending}
            className="w-full lg:w-fit px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-60"
          >
            {previewMutation.isPending ? (
              <span className="animate-spin rounded-full w-5 h-5 border-2 border-white border-t-transparent" />
            ) : (
              <Search size={20} />
            )}
            Fetch Journeys & Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverSettlement;
