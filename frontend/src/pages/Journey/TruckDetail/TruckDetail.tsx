import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchTrucksEntriesAsync,
  selectTruckLoading,
  truckSelectors,
} from "../../../features/truck";
import type { AppDispatch } from "../../../app/store";
import Loading from "../../../components/Loading";
import styles from "./TruckDetail.module.scss";
import {
  DOCUMENT_FIELDS,
  TRUCK_ENTRY_LABELS,
  type TruckType,
} from "../../../types/truck";
import { formatDate } from "../../../utils/formatDate";

const TruckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectTruckLoading);
  const trucks = useSelector(truckSelectors.selectAll);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (trucks.length === 0) dispatch(fetchTrucksEntriesAsync());
  }, [dispatch, trucks.length]);

  const truck = trucks.find((t) => t._id === id);

  if (loading || !truck) return <Loading />;

  const sortedDocuments = Object.entries(DOCUMENT_FIELDS).sort(([a], [b]) => {
    const aExpiry = truck[`${a}_expiry` as keyof TruckType];
    const bExpiry = truck[`${b}_expiry` as keyof TruckType];

    const aDate =
      typeof aExpiry === "string" && aExpiry.trim() !== ""
        ? new Date(aExpiry).getTime()
        : Infinity; // Push missing expiry to bottom
    const bDate =
      typeof bExpiry === "string" && bExpiry.trim() !== ""
        ? new Date(bExpiry).getTime()
        : Infinity;

    return aDate - bDate;
  });

  return (
    <div className={styles.truckDetailContainer}>
      <h1 className={styles.heading}>Truck Detail</h1>
      <div className={styles.truckDetail}>
        <div className={styles.truckNo}>
          <span className={styles.text}>Truck No:</span>{" "}
          <span className={styles.number}>{truck.truck_no}</span>
        </div>
        <div className={styles.documentContainer}>
          {sortedDocuments.map(([fieldKey, fieldLabel]) => {
            const label =
              TRUCK_ENTRY_LABELS[fieldKey as keyof typeof TRUCK_ENTRY_LABELS] ??
              fieldLabel;
            const value = truck[fieldKey as keyof TruckType] ?? "";
            const expiryValue =
              truck[`${fieldKey}_expiry` as keyof TruckType] ?? "";
            const expiryDate =
              typeof expiryValue === "string" && expiryValue.trim() !== ""
                ? new Date(expiryValue)
                : null;

            return (
              <div className={styles.document} key={fieldKey}>
                <div className={styles.documentLabel}>{label}</div>

                <div className={styles.documentDetail}>
                  {typeof value === "string" && value.startsWith("http") ? (
                    <img
                      src={value}
                      alt={label}
                      className={styles.documentImage}
                      onClick={() => setFullscreenImage(value)}
                    />
                  ) : (
                    <div className={styles.documentValue}>
                      {String(value || "-")}
                    </div>
                  )}

                  {expiryDate && !isNaN(expiryDate.getTime()) && (
                    <div className={styles.expiry}>
                      <span className={styles.text}>Expiry:</span>{" "}
                      <span className={styles.expiryDate}>
                        {formatDate(expiryDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
