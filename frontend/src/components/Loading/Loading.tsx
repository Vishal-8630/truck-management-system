import styles from "./Loading.module.scss";

const Loading = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
