import { useNavigate, useParams } from "react-router-dom";
import styles from "./DriverSettlement.module.scss";
import { useEffect, useState } from "react";
import FormSection from "../../../../components/FormSection";
import FormInput from "../../../../components/FormInput";
import type { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { fetchSettlementPreviewAsync } from "../../../../features/settlement";
import Loading from "../../../../components/Loading";
import { addMessage } from "../../../../features/message";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
} from "../../../../features/driver";
import { useSelector } from "react-redux";

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
          console.log("Error fetching journeys: ", error);
          dispatch(
            addMessage({ type: "error", text: "Failed to fetch journeys" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error fetching journeys: ", error);
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  return (
    <div className={styles.settlementContainer}>
      <h1 className={styles.heading}>Driver Settlement</h1>
      <div className={styles.settlementForm}>
        <FormSection title={`Settlement for ${driver?.name}`}>
          <FormInput
            type="date"
            id="from"
            name="from"
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <FormInput
            type="date"
            id="to"
            name="to"
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <FormInput
            type="number"
            id="ratePerKm"
            name="ratePerKm"
            label="Rate Per Km"
            value={ratePerKm}
            placeholder="Rate Per Km"
            onChange={(e) => setRatePerKm(e.target.value)}
          />
          <FormInput
            type="number"
            id="dieselRate"
            name="dieselRate"
            label="Diesel Rate"
            value={dieselRate}
            placeholder="Diesel Rate"
            onChange={(e) => setDieselRate(e.target.value)}
          />
          <FormInput
            type="number"
            id="extraExpense"
            name="extraExpense"
            label="Extra Expense"
            value={extraExpense}
            placeholder="Extra Expense"
            onChange={(e) => setExtraExpense(e.target.value)}
          />
          <button className={styles.settlementBtn} onClick={handleClick}>
            Fetch Journeys
          </button>
        </FormSection>
      </div>
    </div>
  );
};

export default DriverSettlement;
