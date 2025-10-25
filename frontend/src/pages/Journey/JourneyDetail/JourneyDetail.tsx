import { useParams } from "react-router-dom";
import styles from "./JourneyDetail.module.scss";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  fetchJourneyEntriesAsync,
  journeySelectors,
  selectJourneyLoading,
} from "../../../features/journey";
import { useEffect } from "react";
import Loading from "../../../components/Loading";

const JourneyDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectJourneyLoading);
  const journies = useSelector(journeySelectors.selectAll);

  useEffect(() => {
    dispatch(fetchJourneyEntriesAsync());
  }, [dispatch]);

  const journey = journies.find((j) => j._id === id);

  if (loading) <Loading />;

  return (
    <div className={styles.journeyDetailContainer}>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Truck Number: </span>
        <span className={styles.value}>{journey?.truck.truck_no}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Driver: </span>
        <span className={styles.value}>{journey?.driver.name}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>From: </span>
        <span className={styles.value}>{journey?.from}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>To:</span>
        <span className={styles.value}>{journey?.to}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Journey Start Date: </span>
        <span className={styles.value}>{journey?.journey_start_date}</span>
      </div>
    </div>
  );
};

export default JourneyDetail;
