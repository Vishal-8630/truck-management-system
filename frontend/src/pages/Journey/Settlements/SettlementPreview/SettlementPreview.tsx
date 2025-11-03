import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SettlementPreview.module.scss";
import { formatDate } from "../../../../utils/formatDate";
import JourneySettlement from "./JourneySettlement";
import type { JourneyType } from "../../../../types/journey";
import type { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { confirmSettlementAsync } from "../../../../features/settlement";
import { addMessage } from "../../../../features/message";

const SettlementPreview = () => {
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { data, period, driver } = location.state || {};
  const emptyFieldValue = "---------";

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleConfirmSettlementClick = async () => {
    try {
      const resultAction = await dispatch(confirmSettlementAsync({ data, period, driver}));

      if (confirmSettlementAsync.fulfilled.match(resultAction)) {
        navigate(`/journey/driver-detail/${driver._id}`);
        dispatch(addMessage({ type: "success", text: "Settlement confirmed" }));
      } else if (confirmSettlementAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(addMessage({ type: "error", text: "Failed to confirm settlement" }));
        }
      }
    } catch (error: any) {
      console.log("Error while confirming settlement: ", error);
    }
  }

  return (
    <div className={styles.previewContainer}>
      <div className={styles.heading}>Driver Settlement Report</div>
      <div className={styles.detailBox}>
        <div className={styles.detailContainer}>
          <span className={styles.text}>Driver Name: - </span>
          <span className={styles.value}>{driver.name}</span>
        </div>
        <div className={styles.detailContainer}>
          <span className={styles.text}>Truck No: - </span>
          <span className={styles.value}>
            {data.journeys[0].truck.truck_no}
          </span>
        </div>
        <div className={styles.detailContainer}>
          <span className={styles.text}>Period: - </span>
          <span className={styles.value}>
            {safeDate(period.from) + " --> " + safeDate(period.to)}
          </span>
        </div>
        <div className={styles.detailContainer}>
          <span className={styles.text}>Generated: - </span>
          <span className={styles.value}>{safeDate(String(new Date()))}</span>
        </div>
      </div>
      <div className={styles.journeys}>
        {data.journeys.map((j: JourneyType, i: number) => (
          <JourneySettlement key={i} journey={j} count={i + 1} />
        ))}
      </div>
      <div className={styles.overallTotal}>
        <div className={styles.block}>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Journey Starting Cash: -</span>
            <span className={styles.value}>Rs. { data?.totals?.total_journey_starting_cash }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Driver Expense: -</span>
            <span className={styles.value}>Rs. { data?.totals?.total_driver_expense }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Diesel Expense: -</span>
            <span className={styles.value}>Rs. { data?.totals?.total_diesel_expense }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Distance: -</span>
            <span className={styles.value}>{ data?.totals?.total_distance } km</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Rate Per Km: -</span>
            <span className={styles.value}>Rs. { data?.totals?.total_rate_per_km }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Average Mileage: -</span>
            <span className={styles.value}>{ data?.totals?.avg_mileage } km/l</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Diesel Used: -</span>
            <span className={styles.value}>{ data?.totals?.total_diesel_used } L</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Total Diesel Given: -</span>
            <span className={styles.value}>{ data?.totals?.total_diesel_quantity } L</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Diesel Difference: -</span>
            <span className={styles.value}>{ data?.totals?.diesel_diff } L</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Driver Total: -</span>
            <span className={styles.value}>Rs. { data?.totals?.driver_total }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Owner Total: -</span>
            <span className={styles.value}>Rs. { data?.totals?.owner_total }</span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Overall Total: -</span>
            <span className={styles.value}>Rs. { data?.totals?.overall_total }</span>
          </div>
        </div>
      </div>
      <div className={styles.confirmBtnContainer}>
        <button className={styles.confirmBtn} onClick={handleConfirmSettlementClick}>Confirm Settlement</button>
      </div>
    </div>
  );
};

export default SettlementPreview;
