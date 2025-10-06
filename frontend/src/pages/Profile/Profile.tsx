import { useSelector } from "react-redux";
import styles from "./Profile.module.scss";
import type { RootState } from "../../app/store";

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className={styles.profile}>
      <h1>Profile</h1>
      <div className={styles.userInfo}>
        <p>
          <strong>Full Name:</strong> {user?.fullname}
        </p>
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Created At:</strong> {user?.createdAt}
        </p>
        <p>
          <strong>Is User Verified: </strong> {user?.isVerified ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is User Admin: </strong> {user?.isAdmin ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default Profile;