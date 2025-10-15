import { MotionConfig } from "framer-motion";
import BottomBar from "./components/BottomBar";
import MessageBar from "./components/MessageBar";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import styles from "./App.module.scss";
import useAuthCheck from "./hooks/useAuthCheck";
import Loading from "./components/Loading";
import MoveToTopButton from "./components/MoveToTopButton";

import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-calendars/styles/material.css";
import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCd0x3R3xbf1x1ZFRGalxTTndYUiweQnxTdEBjUH9bcXRVRGFbVUVwV0leYg=="
);

function App() {
  const checking = useAuthCheck();

  console.log("App Env:", import.meta.env.VITE_APP_ENV);
  console.log("Base URL:", import.meta.env.VITE_PROD_BASE_URL);

  if (checking) return <Loading />;

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <div className={styles.appContainer}>
        <div className={styles.navbarContainer}>
          <Navbar />
        </div>
        <div className={styles.contentContainer}>
          <MessageBar />
          <AppRoutes />
          <MoveToTopButton />
        </div>
        <div className={styles.bottomBarContainer}>
          <BottomBar />
        </div>
      </div>
    </MotionConfig>
  );
}

export default App;
