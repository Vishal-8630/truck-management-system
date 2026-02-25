import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FormSection from "../../../../components/FormSection";
import FormInput from "../../../../components/FormInput";
import type { AppDispatch } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettlementPreviewAsync } from "../../../../features/settlement";
import Loading from "../../../../components/Loading";
import { addMessage } from "../../../../features/message";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
} from "../../../../features/driver";
import { Calculator, Calendar, ArrowLeft, Search, Wallet } from "lucide-react";

const DriverSettlement = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ratePerKm, setRatePerKm] = useState("");
  const [dieselRate, setDieselRate] = useState("");
  const [extraExpense, setExtraExpense] = useState("");
  const drivers = useSelector(driverSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch, id]);

  if (!id) return <Loading />;

  const driver = drivers.find((d) => d._id === id);

  const handleClick = async () => {
    if (!from || !to || !ratePerKm || !dieselRate) {
      dispatch(addMessage({ type: "error", text: "Please fill all required fields" }));
      return;
    }

    try {
      const resultAction = await dispatch(
        fetchSettlementPreviewAsync({
          driverId: id,
          from,
          to,
          ratePerKm,
          dieselRate,
          extraExpense,
        })
      );

      if (fetchSettlementPreviewAsync.fulfilled.match(resultAction)) {
        const data = resultAction.payload.data;
        if (data && data.journeys?.length > 0) {
          navigate(`/journey/driver-detail/${id}/settlement/preview`, {
            state: {
              data,
              period: {
                from,
                to,
              },
              driver
            },
          });
        } else {
          dispatch(
            addMessage({
              type: "error",
              text: resultAction.payload.message || "No journeys found",
            })
          );
        }
      } else if (fetchSettlementPreviewAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to fetch journeys" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Driver
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Calculator className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Trip <span className="text-indigo-600">Settlement</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Calculate and finalize earnings for {driver?.name || "Driver"}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="card-premium p-8 lg:p-10 flex flex-col gap-10">
          <FormSection title="Settlement Period" icon={<Calendar size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                type="date"
                id="from"
                name="from"
                label="Start Date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <FormInput
                type="date"
                id="to"
                name="to"
                label="End Date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </FormSection>

          <FormSection title="Settlement Rates" icon={<Wallet size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                type="number"
                id="ratePerKm"
                name="ratePerKm"
                label="Rate Per Km"
                value={ratePerKm}
                placeholder="e.g. 5.50"
                onChange={(e) => setRatePerKm(e.target.value)}
              />
              <FormInput
                type="number"
                id="dieselRate"
                name="dieselRate"
                label="Diesel Rate"
                value={dieselRate}
                placeholder="e.g. 90.00"
                onChange={(e) => setDieselRate(e.target.value)}
              />
              <FormInput
                type="number"
                id="extraExpense"
                name="extraExpense"
                label="Extra Deductions"
                value={extraExpense}
                placeholder="0.00"
                onChange={(e) => setExtraExpense(e.target.value)}
              />
            </div>
          </FormSection>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              onClick={handleClick}
              className="w-full lg:w-fit px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              <Search size={20} />
              Fetch Journeys & Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSettlement;
