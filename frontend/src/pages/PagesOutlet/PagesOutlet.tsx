import { Outlet } from 'react-router-dom'
import styles from './PagesOutlet.module.scss';

const PagesOutlet = () => {
  return (
    <div className={styles.outletContainer}>
        <Outlet />
    </div>
  )
}

export default PagesOutlet