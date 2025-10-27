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
import DetailBlock from "../JourneyDetail/components/DetailBlock";
import FormInputImage from "../../../components/FormInputImage";

const DriverDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const drivers = useSelector(driverSelectors.selectAll);
  const loading = useSelector(selectDriverLoading);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverType | null>(null);
  const [backupDriver, setBackupDriver] = useState<DriverType | null>(null);

  void isEditMode;

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  const driver = drivers.find((driver) => driver._id === id);

  useEffect(() => {
    if (driver && !loading) setLocalDriver(driver);
  }, [driver, loading, id]);

  if (loading || !localDriver) return <Loading />;

  const isDirty = JSON.stringify(localDriver) !== JSON.stringify(driver);

  const handleDelete = (id: string) => {
    void id;
  };

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
        <DetailBlock
          title="Driver Information"
          fields={[
            {
              key: "name",
              label: "Name",
              value: localDriver.name,
              isEditable: true,
            },
            {
              key: "phone",
              label: "Phone Number",
              value: localDriver.phone,
              isEditable: true,
            },
            {
              key: "home_phone",
              label: "Home Phone Number",
              value: localDriver.home_phone,
              isEditable: true,
            },
            {
              key: "address",
              label: "Address",
              value: localDriver.address,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Driver Documents"
          fields={[
            {
              key: "adhaar_no",
              label: "Adhaar Number",
              value: localDriver.adhaar_no,
              isEditable: true,
            },
            {
              key: "dl",
              label: "Driving License",
              value: localDriver.dl,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Driver Images"
          fields={[]}
          childs={
            <div className={styles.childs}>
              <FormInputImage
                label="Photo"
                id="driver_img"
                name="driver_img"
                value={
                  typeof localDriver.driver_img === "string"
                    ? localDriver.driver_img
                    : ""
                }
                onFileSelect={() => {}}
              />
              <FormInputImage
                label="Adhaar Front Image"
                id="adhaar_front_img"
                name="adhaar_front_img"
                value={
                  typeof localDriver.adhaar_front_img === "string"
                    ? localDriver.adhaar_front_img
                    : ""
                }
                onFileSelect={() => {}}
              />
              <FormInputImage
                label="Adhaar Back Image"
                id="adhaar_back_img"
                name="adhaar_back_img"
                value={
                  typeof localDriver.adhaar_back_img === "string"
                    ? localDriver.adhaar_back_img
                    : ""
                }
                onFileSelect={() => {}}
              />
              <FormInputImage
                label="Driving License Image"
                id="dl_img"
                name="dl_img"
                value={
                  typeof localDriver.dl_img === "string"
                    ? localDriver.dl_img
                    : ""
                }
                onFileSelect={() => {}}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DriverDetail;
