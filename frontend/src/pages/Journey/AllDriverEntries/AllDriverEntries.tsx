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
import { useNavigate } from "react-router-dom";

const AllDriverEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectDriverLoading);
  const drivers = useSelector(driverSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  const handleDriverClick = (id: string) => {
    navigate(`/journey/driver-detail/${id}`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className={styles.heading}>All Drivers</h1>
      <div className={styles.drivers}>
        {drivers.map((driver) => (
          <DriverCard
            key={driver._id}
            driver={driver}
            handleClick={handleDriverClick}
          />
        ))}
      </div>
    </div>
  );
};

export default AllDriverEntries;
