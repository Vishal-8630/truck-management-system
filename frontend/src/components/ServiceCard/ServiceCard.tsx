import React from "react";
import styles from "./ServiceCard.module.scss";
import { motion } from "framer-motion";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <motion.div
      className={styles.serviceCard}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </motion.div>
  );
};

export default ServiceCard;
