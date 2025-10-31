import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import styles from "./AllTruckEntries.module.scss";
import { useSelector } from "react-redux";
import {
  fetchTrucksEntriesAsync,
  truckSelectors,
} from "../../../features/truck";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AllTruckEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const trucks = useSelector(truckSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchTrucksEntriesAsync());
  }, [dispatch]);

  const handleTruckClick = (truckId: string) => {
    navigate(`/journey/truck/${truckId}`);
  };

  return (
    <div className={styles.allTruckContainer}>
      <h1 className={styles.heading}>All Trucks</h1>
      <div className={styles.trucks}>
        {trucks.map((truck) => {
          return (
            <div
              className={styles.truckNo}
              key={truck._id}
              onClick={() => handleTruckClick(truck._id)}
            >
              {truck.truck_no}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllTruckEntries;
