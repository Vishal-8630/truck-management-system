import React from "react";
import type { JourneyType } from "../../../../types/journey";
import styles from "./SettlementPreview.module.scss";
import { formatDate } from "../../../../utils/formatDate";

interface JourneySettlementProps {
  journey: JourneyType;
  count: Number;
}

const JourneySettlement: React.FC<JourneySettlementProps> = ({
  journey,
  count,
}) => {
  const emptyFieldValue = "---------";

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  return (
    <div className={styles.journeySettlementContainer}>
      <div className={styles.journeyHeader}>
        <div className={styles.block}>
          <div className={styles.subBlock}>
            <span className={styles.text}>Journey {String(count)}: </span>
            <span className={styles.value}>
              {journey.from} - {journey.to}
            </span>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.subBlock}>
            <span className={styles.text}>Journey Start Date: -</span>
            <span className={styles.value}>
              {safeDate(journey.journey_start_date)}
            </span>
          </div>
          <div className={styles.subBlock}>
            <span className={styles.text}>Journey End Date: -</span>
            <span className={styles.value}>
              {safeDate(journey.journey_end_date)}
            </span>
          </div>
        </div>
        <div className={styles.block}>
           <div className={styles.subBlock}>
             {journey.settled ? (
                <span className={styles.value}>This journey is not settled yet.</span>
            ) : (
                <span className={styles.value}>This journey is settled and will not be included in this settlement.</span>
            )}
           </div>
        </div>
      </div>
      <div className={styles.journeyBody}>
        <h3 className={styles.heading3}>Driver Expense</h3>
        <div className={styles.workingExpense}>
          <table>
            <thead>
              <tr>
                <th>Reason</th>
                <th>Amount (Rs.)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {journey.driver_expenses.map((expense) => (
                <tr key={expense.reason}>
                  <td>{expense.reason}</td>
                  <td>{expense.amount}</td>
                  <td>{safeDate(expense.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.total}>
            <span className={styles.text}>Total Driver Expense: -</span>
            <span className={styles.value}>
              {journey.total_driver_expense}
            </span>
          </div>
        </div>
        <div className={styles.dieselExpense}>
          <h3 className={styles.heading3}>Diesel Expense</h3>
          <table>
            <thead>
              <tr>
                <th>Quantity (L)</th>
                <th>Amount (Rs.)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {journey.diesel_expenses.map((expense) => (
                <tr key={expense.filling_date}>
                  <td>{expense.quantity}</td>
                  <td>{expense.amount}</td>
                  <td>{safeDate(expense.filling_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.total}>
            <span className={styles.text}>Total Diesel Expense: -</span>
            <span className={styles.value}>{journey.total_diesel_expense}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneySettlement;
