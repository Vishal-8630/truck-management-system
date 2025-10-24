import type { FC } from 'react';
import type { DriverType } from '../../types/driver';
import styles from './DriverCard.module.scss';
import NoImg from '../../assets/no-img.jpg';

interface driverCardProps {
    driver: DriverType
}

const DriverCard: FC<driverCardProps> = ({ driver }) => {
  return (
    <div className={styles.driverCardContainer}>
        <img src={driver.driver_img || NoImg} alt="Driver Image" className={styles.driverImg}/>
        <div className={styles.name}>{ driver.name }</div>
    </div>
  )
}

export default DriverCard