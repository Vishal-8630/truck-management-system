import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
    const navigate = useNavigate();

  return (
    <div className={styles.notFoundContainer}>
        <h1 className={styles.heading}>Page Not Found</h1>
        <button className={styles.btn} onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}

export default NotFound