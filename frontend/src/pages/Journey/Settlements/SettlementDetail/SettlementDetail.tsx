import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchSettlementsAsync,
  selectSettlementLoading,
  settlementSelectors,
} from "../../../../features/settlement";
import { useEffect, useRef } from "react";
import type { AppDispatch } from "../../../../app/store";
import Loading from "../../../../components/Loading";
import styles from "./SettlementDetail.module.scss";
import type { JourneyType } from "../../../../types/journey";
import { formatDate } from "../../../../utils/formatDate";
import { usePDFPrint } from "../../../../hooks/usePDFPrint";
import { usePDFDownload } from "../../../../hooks/usePDFDownload";

const SettlementDetail = () => {
  const { settlementId } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const settlements = useSelector(settlementSelectors.selectAll);
  const loading = useSelector(selectSettlementLoading);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchSettlementsAsync());
  }, [dispatch, settlementId]);

  const settlement = settlements.find(
    (settlement) => settlement._id === settlementId
  );

  const handlePrint = usePDFPrint({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlemen first",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  const handleDownloadPDF = usePDFDownload({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlemen first",
    filename: `Settlement-${settlement?.driver.name}-${
      new Date().toISOString().split("T")[0]
    }.pdf`,
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  if (loading && !settlement) return <Loading />;
  if (!settlement) return <p>No settlement found</p>;

  return (
    <div className={styles.settlementDetail}>
      <div className={styles.settlementHeader}>
        <h2>Driver Settlement Summary</h2>
        <div className={styles.actions}>
          <button
            onClick={handlePrint}
            className={`${styles.btn} ${styles.print}`}
          >
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className={`${styles.btn} ${styles.download}`}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className={styles.settlementContent} ref={printRef}>
        <div className={styles.header}>
          <div className={styles.smallText}>
            Subject to Mathura Jurisdiction Only
          </div>
          <div className={styles.mainTitle}>Divyanshi Road Lines</div>
          <div className={styles.subTitle}>
            FLEET OWNER • TRANSPORT CONTRACTORS • COMMISSION AGENT
          </div>
          <div className={styles.address}>
            <strong> Head Office:</strong> Near Essar Fuel Pump, Lohvan
            Bhagichi, Laxmi Nagar, Mathura - 281001
          </div>
          <div className={styles.address}>
            <strong>Branch Office:</strong> Near Kuber Jee Dharam Kanta,
            Shashtripuram, Agra - 281305
          </div>
          <div className={styles.contact}>
            Mob: 8630836045, 7983635608, 8449991690 &nbsp; | &nbsp; Email:{" "}
            <span className={styles.email}>drldivyashi@gmail.com</span>
          </div>
        </div>

        <div className={styles.settlementInfo}>
          <div className={styles.infoGroup}>
            <p>
              <strong>Driver:</strong> {settlement.driver?.name}
            </p>
            <p>
              <strong>Period:</strong>{" "}
              {formatDate(new Date(settlement.period.from))} →{" "}
              {formatDate(new Date(settlement.period.to))}
            </p>
            <p>
              <strong>Status:</strong> {settlement.status}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <p>
              <strong>Total Driver Expense:</strong> ₹
              {settlement.total_driver_expense}
            </p>
            <p>
              <strong>Total Diesel Expense:</strong> ₹
              {settlement.total_diesel_expense}
            </p>
            <p>
              <strong>Total Distance:</strong> {settlement.total_distance} km
            </p>
          </div>
          <div className={styles.infoGroup}>
            <p>
              <strong>Rate/km:</strong> ₹{settlement.rate_per_km}
            </p>
            <p>
              <strong>Diesel Rate:</strong> ₹{settlement.diesel_rate}
            </p>
            <p>
              <strong>Avg Mileage:</strong> {settlement.avg_mileage}
            </p>
          </div>
        </div>

        <div className={styles.journeySection}>
          <h3>Journeys</h3>
          <div className={styles.journeyTableWrapper}>
            <table className={styles.journeyTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Distance (km)</th>
                  <th>Diesel Taken (L)</th>
                  <th>Diesel Used (L)</th>
                  <th>Driver Expense</th>
                  <th>Expense</th>
                </tr>
              </thead>

              <tbody>
                {settlement.journeys.map((j: JourneyType, i: number) => {
                  const distance =
                    Number(j.ending_kms) - Number(j.starting_kms);
                  const dieselTaken =
                    j.diesel_expenses?.reduce(
                      (total: number, d: any) => total + Number(d.quantity),
                      0
                    ) || 0;
                  const dieselUsed = Math.floor(
                    distance / Number(settlement.avg_mileage || 1)
                  );
                  const expense = Number(j.journey_starting_cash || 0);

                  return (
                    <tr key={j._id || i}>
                      <td>{i + 1}</td>
                      <td>{j.from}</td>
                      <td>{j.to}</td>
                      <td>{Math.floor(distance)}</td>
                      <td>{Math.ceil(dieselTaken)}</td>
                      <td>{dieselUsed}</td>
                      <td>{j.total_driver_expense}</td>
                      <td>₹{Math.ceil(expense)}</td>
                    </tr>
                  );
                })}
              </tbody>

              {/* 🧾 Total Row */}
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total:
                  </td>
                  <td>
                    {Math.floor(
                      settlement.journeys.reduce(
                        (sum, j) =>
                          sum + (Number(j.ending_kms) - Number(j.starting_kms)),
                        0
                      )
                    )}
                  </td>
                  <td>
                    {Math.ceil(
                      settlement.journeys.reduce(
                        (sum, j) =>
                          sum +
                          (j.diesel_expenses?.reduce(
                            (t: number, d: any) => t + Number(d.quantity),
                            0
                          ) || 0),
                        0
                      )
                    )}
                  </td>
                  <td>
                    {Math.floor(
                      settlement.journeys.reduce(
                        (sum, j) =>
                          sum +
                          (Number(j.ending_kms) - Number(j.starting_kms)) /
                            Number(settlement.avg_mileage || 1),
                        0
                      )
                    )}
                  </td>
                  <td>
                    ₹
                    {Math.ceil(
                      settlement.journeys.reduce(
                        (sum, j) => sum + Number(j.total_driver_expense || 0),
                        0
                      )
                    )}
                  </td>
                  <td>
                    ₹
                    {Math.ceil(
                      settlement.journeys.reduce(
                        (sum, j) => sum + Number(j.journey_starting_cash || 0),
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className={styles.totalsSection}>
          <h3>Driver Calculation</h3>
          <div className={styles.totalsGrid}>
            <p>
              <strong>Diesel Difference: </strong> {settlement.diesel_diff} Ltr
            </p>
            <p>
              <strong>Kilometer Expense: </strong> ₹
              {settlement.journeys.reduce(
                (sum, j) =>
                  sum + (Number(j.ending_kms) - Number(j.starting_kms)),
                0
              ) * Number(settlement.rate_per_km || 0)}
            </p>
          </div>
        </div>

        <div className={styles.totalsSection}>
          <h3>Final Settlement</h3>
          <div className={styles.totalsGrid}>
            <p>
              <strong>Driver Total:</strong> ₹{settlement.driver_total}
            </p>
            <p>
              <strong>Owner Total:</strong> ₹{settlement.owner_total}
            </p>
            <p>
              <strong>Overall Total:</strong> ₹{settlement.overall_total}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetail;
