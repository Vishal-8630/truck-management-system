import { useParams } from "react-router-dom";
import styles from "./DriverDetail.module.scss";
import { useSelector } from "react-redux";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
  selectDriverLoading,
} from "../../../features/driver";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import type { DriverType } from "../../../types/driver";
import EditHeader from "../../../components/EditHeader";

const DriverDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const drivers = useSelector(driverSelectors.selectAll);
  const loading = useSelector(selectDriverLoading);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverType | null>(null);
  const [backupDriver, setBackupDriver] = useState<DriverType | null>(null);

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  const driver = drivers.find((driver) => driver._id === id);

  useEffect(() => {
    if (driver && !loading) setLocalDriver(driver);
  }, [driver, loading, id]);

  if (loading || !localDriver) return <Loading />;

  const isDirty = JSON.stringify(localDriver) !== JSON.stringify(driver);

  const handleDelete = (id: string) => {};

  const handleSave = () => {};

  return (
    <div className={styles.driverDetailContainer}>
      <EditHeader
        heading="Driver Detail"
        isDirty={isDirty}
        onEditClick={() => {
          setIsEditMode(true);
          setBackupDriver(localDriver);
        }}
        onCancelClick={() => {
          setLocalDriver(backupDriver);
          setIsEditMode(false);
        }}
        onDeleteClick={() => {
          handleDelete(localDriver._id);
          setIsEditMode(false);
        }}
        onDiscardClick={() => {
          setLocalDriver(backupDriver);
          setIsEditMode(false);
        }}
        onSaveClick={() => {
          handleSave();
          setIsEditMode(false);
        }}
      />
      <div className={styles.driverDetail}>
        <div className={styles.block}>
          <h2 className={styles.subHeading}>General Detail</h2>
        </div>
      </div>
    </div>
  );
};

export default DriverDetail;
