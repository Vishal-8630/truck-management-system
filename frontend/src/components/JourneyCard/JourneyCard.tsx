import React from "react";
import type { JourneyType } from "../../types/journey";
import styles from "./JourneyCard.module.scss";

interface JourneyCardProps {
  journey: JourneyType;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
  return (
    <div className={styles.journeyCardContainer}>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Truck Number: </span>
        <span className={styles.value}>{journey.truck.truck_no}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Driver: </span>
        <span className={styles.value}>{journey.driver.name}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>From: </span>
        <span className={styles.value}>{journey.from}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>To:</span>
        <span className={styles.value}>{journey.to}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Journey Start Date: </span>
        <span className={styles.value}>{journey.journey_start_date}</span>
      </div>
      <div className={styles.detailContainer}>
        <span className={styles.text}>Total Expense: </span>
        <span className={styles.value}>{journey.total_expense || "-"}</span>
      </div>
    </div>
  );
};

export default JourneyCard;
