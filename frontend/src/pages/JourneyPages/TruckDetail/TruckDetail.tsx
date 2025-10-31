import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  deleteTruckEntryAsync,
  fetchTrucksEntriesAsync,
  selectTruckLoading,
  truckSelectors,
  updateTruckEntryAsync,
} from "../../../features/truck";
import type { AppDispatch } from "../../../app/store";
import Loading from "../../../components/Loading";
import styles from "./TruckDetail.module.scss";
import { type TruckType } from "../../../types/truck";
import { formatDate } from "../../../utils/formatDate";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../JourneyDetail/components/DetailBlock";
import FormInputImage from "../../../components/FormInputImage";
import { addMessage } from "../../../features/message";

const TruckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectTruckLoading);
  const trucks = useSelector(truckSelectors.selectAll);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [backupTruck, setBackupTruck] = useState<TruckType | null>(null);
  const [localTruck, setLocalTruck] = useState<TruckType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(
    new Set()
  );
  const emptyFieldValue = "----------";

  void isEditMode;

  useEffect(() => {
    if (trucks.length === 0) dispatch(fetchTrucksEntriesAsync());
  }, [dispatch, trucks.length]);

  const truck = trucks.find((t) => t._id === id);

  useEffect(() => {
    if (truck && !loading) setLocalTruck(truck);
  }, [truck, loading, id]);

  if (loading || !localTruck) return <Loading />;

  const isDirty = JSON.stringify(truck) !== JSON.stringify(localTruck);

  const handleFileSelect = (file: File | null, field: keyof TruckType) => {
    setLocalTruck((prev) => (prev ? { ...prev, [field]: file } : prev));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(localTruck).forEach(([key, value]) => {
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
        updateTruckEntryAsync({
          id: localTruck._id,
          updatedTruck: formData,
        })
      );
      if (updateTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck updated successfully" })
        );
      } else if (updateTruckEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to update truck" })
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

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteTruckEntryAsync(id));
      if (deleteTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck deleted successfully" })
        );
        navigate("/journey/all-truck-entries");
      } else if (deleteTruckEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to delete truck" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  return (
    <div className={styles.truckDetailContainer}>
      <EditHeader
        heading="Truck Details"
        isDirty={isDirty}
        onEditClick={() => {
          setBackupTruck(localTruck);
          setIsEditMode(true);
        }}
        onCancelClick={() => {
          setLocalTruck(backupTruck);
          setIsEditMode(false);
        }}
        onSaveClick={() => {
          setIsEditMode(false);
          handleSave();
        }}
        onDeleteClick={() => {
          handleDelete(localTruck?._id);
        }}
        onDiscardClick={() => {
          setLocalTruck(backupTruck);
          setIsEditMode(false);
        }}
      />
      <div className={styles.detailContainer}>
        <DetailBlock
          title="Details"
          isEditMode={isEditMode}
          onChange={(key, value) => {
            setLocalTruck((prev) => (prev ? { ...prev, [key]: value } : prev));
          }}
          fields={[
            {
              key: "truck_no",
              label: "Truck No",
              value: localTruck.truck_no,
              isEditable: true,
            },
            {
              key: "fitness_doc_expiry",
              label: "Fitness Document Expiry Date",
              value: safeDate(localTruck.fitness_doc_expiry),
              isEditable: true,
            },
            {
              key: "insurance_doc_expiry",
              label: "Insurance Document Expiry Date",
              value: safeDate(localTruck.insurance_doc_expiry),
              isEditable: true,
            },
            {
              key: "national_permit_doc_expiry",
              label: "National Permit Document Expiry Date",
              value: safeDate(localTruck.national_permit_doc_expiry),
              isEditable: true,
            },
            {
              key: "state_permit_doc_expiry",
              label: "State Permit Document Expiry Date",
              value: safeDate(localTruck.state_permit_doc_expiry),
              isEditable: true,
            },
            {
              key: "tax_doc_expiry",
              label: "Tax Document Expiry Date",
              value: safeDate(localTruck.tax_doc_expiry),
              isEditable: true,
            },
            {
              key: "pollution_doc_expiry",
              label: "Pollution Document Expiry Date",
              value: safeDate(localTruck.pollution_doc_expiry),
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Documents"
          fields={[]}
          isEditMode={isEditMode}
          childs={
            <div className={styles.childs}>
              <FormInputImage
                label="Fitness Document"
                id="fitness_doc"
                name="fitness_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.fitness_doc === "string"
                    ? localTruck.fitness_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "fitness_doc");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "fitness_doc"])
                  );
                }}
              />
              <FormInputImage
                label="Insurance Document"
                id="insurance_doc"
                name="insurance_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.insurance_doc === "string"
                    ? localTruck.insurance_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "insurance_doc");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "insurance_doc"])
                  );
                }}
              />
              <FormInputImage
                label="National Permit Document"
                id="national_permit_doc"
                name="national_permit_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.national_permit_doc === "string"
                    ? localTruck.national_permit_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "national_permit_doc");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "national_permit_doc"])
                  );
                }}
              />
              <FormInputImage
                label="State Permit Document"
                id="state_permit_doc"
                name="state_permit_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.state_permit_doc === "string"
                    ? localTruck.state_permit_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "state_permit_doc");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "state_permit_doc"])
                  );
                }}
              />
              <FormInputImage
                label="Tax Document"
                id="tax_doc"
                name="tax_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.tax_doc === "string"
                    ? localTruck.tax_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "tax_doc");
                  setChangedDocuments((prev) => new Set([...prev, "tax_doc"]));
                }}
              />
              <FormInputImage
                label="Pollution Document"
                id="pollution_doc"
                name="pollution_doc"
                isEditMode={isEditMode}
                value={
                  typeof localTruck.pollution_doc === "string"
                    ? localTruck.pollution_doc
                    : ""
                }
                onFileSelect={(file) => {
                  handleFileSelect(file, "pollution_doc");
                  setChangedDocuments(
                    (prev) => new Set([...prev, "pollution_doc"])
                  );
                }}
              />
            </div>
          }
        />
      </div>

      {fullscreenImage && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setFullscreenImage(null)}
        >
          <span
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            ✕
          </span>
          <img
            src={fullscreenImage}
            alt="Full view"
            className={styles.fullscreenImage}
          />
        </div>
      )}
    </div>
  );
};

export default TruckDetail;
