import React, { useState } from "react";
import styles from "./ServiceCard.module.scss";
import Overlay from "../Overlay";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  detail,
}) => {
  const [isCardOpen, setIsCardOpen] = useState(false);

  return (
    <>
      <div className={styles.serviceCard} onClick={() => setIsCardOpen(true)}>
        <>
          <div className={styles.icon}>{icon}</div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </>
      </div>
      {isCardOpen && (
        <Overlay onCancel={() => setIsCardOpen(false)}>
          <p className={styles.paragraph}>{detail}</p>
        </Overlay>
      )}
    </>
  );
};

export default ServiceCard;
