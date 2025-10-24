import { useSelector } from "react-redux";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
  selectDriverLoading,
} from "../../../features/driver";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import type { AppDispatch } from "../../../app/store";
import styles from "./AllDriverEntries.module.scss";
import DriverCard from "../../../components/DriverCard";

const AllDriverEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectDriverLoading);
  const drivers = useSelector(driverSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  useEffect(() => {
    console.log("All drivers: ", drivers);
  }, [drivers]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className={styles.heading}>All Drivers</h1>
      {drivers.map((driver) => (
        <DriverCard key={driver._id} driver={driver} />
      ))}
    </div>
  );
};

export default AllDriverEntries;
