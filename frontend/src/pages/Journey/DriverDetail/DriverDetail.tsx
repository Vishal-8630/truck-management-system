import { useNavigate, useParams } from "react-router-dom";
import styles from "./DriverDetail.module.scss";
import { useSelector } from "react-redux";
import {
  deleteDriverEntryAsync,
  driverSelectors,
  fetchDriverEntriesAsync,
  selectDriverLoading,
  updateDriverEntryAsync,
} from "../../../features/driver";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import type { DriverType } from "../../../types/driver";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../JourneyDetail/components/DetailBlock";
import FormInputImage from "../../../components/FormInputImage";
import { addMessage } from "../../../features/message";
import {
  fetchSettlementsAsync,
  settlementSelectors,
} from "../../../features/settlement";
import HeaderWithChild from "../../../components/HeaderWithChild";
import { formatDate } from "../../../utils/formatDate";

const DriverDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const drivers = useSelector(driverSelectors.selectAll);
  const settlements = useSelector(settlementSelectors.selectAll);
  const loading = useSelector(selectDriverLoading);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverType | null>(null);
  const [backupDriver, setBackupDriver] = useState<DriverType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(
    new Set()
  );
  const emptyFieldValue = "---------";

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
    dispatch(fetchSettlementsAsync());
  }, [dispatch]);

  const driver = drivers.find((driver) => driver._id === id);

  useEffect(() => {
    if (driver && !loading) setLocalDriver(driver);
  }, [driver, loading, id]);

  if (loading || !localDriver) return <Loading />;

  const driverSettlements = settlements.filter(
    (settlement) => settlement.driver._id === localDriver._id
  );

  const isDirty = JSON.stringify(localDriver) !== JSON.stringify(driver);

  const handleFileSelect = (file: File | null, field: keyof DriverType) => {
    setLocalDriver((prev) => (prev ? { ...prev, [field]: file } : prev));
  };

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteDriverEntryAsync(id));
      if (deleteDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(addMessage({ type: "success", text: "Driver deleted" }));
        navigate("/journey/all-driver-entries");
      } else if (deleteDriverEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to delete driver" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(localDriver).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        }
      });

      if (changedDocuments.size > 0) {
        formData.append(
          "changedDocuments",
          JSON.stringify([...changedDocuments])
        );
      }

      const resultAction = await dispatch(
        updateDriverEntryAsync({ id: localDriver._id, updateDriver: formData })
      );
      if (updateDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Driver updated successfully" })
        );
      } else if (updateDriverEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          console.log("Errors while adding new driver", errors);
          dispatch(
            addMessage({ type: "error", text: "Failed to update driver" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
      dispatch({
        type: "error",
        text: "Something went wrong",
      });
    }
  };

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
          isEditMode={isEditMode}
          onChange={(key, value) => {
            setLocalDriver((prev) => {
              if (!prev) return prev;
              if (key.includes("phone")) {
                return {
                  ...prev,
                  [key]: value.replace(/[^0-9]/g, "").slice(0, 10),
                };
              }
              return {
                ...prev,
                [key]: value,
              };
            });
          }}
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
          isEditMode={isEditMode}
          onChange={(key, value) => {
            setLocalDriver((prev) => {
              if (!prev) return prev;
              if (key.includes("dl")) {
                return {
                  ...prev,
                  [key]: value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 15)
                    .replace(
                      /^([A-Z]{2})([0-9]{2})([0-9]{4})([0-9]{0,7}).*$/,
                      "$1 $2 $3 $4"
                    )
                    .trim(),
                };
              }
              return {
                ...prev,
                [key]: value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 12)
                  .replace(/(\d{4})(?=\d)/g, "$1 "),
              };
            });
          }}
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
                isEditMode={isEditMode}
                value={
                  typeof localDriver.driver_img === "string"
                    ? localDriver.driver_img
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "driver_img");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "driver_img"])
                  );
                }}
              />
              <FormInputImage
                label="Adhaar Front Image"
                id="adhaar_front_img"
                name="adhaar_front_img"
                isEditMode={isEditMode}
                value={
                  typeof localDriver.adhaar_front_img === "string"
                    ? localDriver.adhaar_front_img
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "adhaar_front_img");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "adhaar_front_img"])
                  );
                }}
              />
              <FormInputImage
                label="Adhaar Back Image"
                id="adhaar_back_img"
                name="adhaar_back_img"
                isEditMode={isEditMode}
                value={
                  typeof localDriver.adhaar_back_img === "string"
                    ? localDriver.adhaar_back_img
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "adhaar_back_img");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "adhaar_back_img"])
                  );
                }}
              />
              <FormInputImage
                label="Driving License Image"
                id="dl_img"
                name="dl_img"
                isEditMode={isEditMode}
                value={
                  typeof localDriver.dl_img === "string"
                    ? localDriver.dl_img
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "dl_img");
                  setChangedDocuments((prev) => new Set([...prev, "dl_img"]));
                }}
              />
            </div>
          }
        />
      </div>

      <div className={styles.settlementsContainer}>
        <HeaderWithChild
          heading="All Settlements"
          child={
            <button
              className={styles.settlementBtn}
              onClick={() => {
                navigate(
                  `/journey/driver-detail/${localDriver._id}/settlement`
                );
              }}
            >
              Calculate Settlement
            </button>
          }
        />
        <div className={styles.settlements}>
          <table className={styles.settlementTable}>
            <thead>
              <tr>
                <th>S. No.</th>
                <th>From</th>
                <th>To</th>
                <th>Journeys Count</th>
                <th>Total Distance</th>
                <th>Overall Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {driverSettlements.map((settlement, index) => (
                <tr key={settlement._id} onClick={() => {
                  navigate(`settlement/${settlement._id}`);
                }}>
                  <td>{index + 1}</td>
                  <td>{safeDate(settlement.period.from)}</td>
                  <td>{safeDate(settlement.period.to)}</td>
                  <td>{settlement.journeys.length}</td>
                  <td>{settlement.total_distance}</td>
                  <td>{settlement.overall_total}</td>
                  <td>{settlement.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDetail;
