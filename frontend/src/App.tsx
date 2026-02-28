import { MotionConfig } from "framer-motion";
import BottomBar from "@/components/layout/BottomBar";
import MessageBar from "@/components/layout/MessageBar";
import Navbar from "@/components/layout/Navbar";
import AppRoutes from "@/routes/AppRoutes";

import useAuthCheck from "@/hooks/useAuthCheck";
import Loading from "@/components/ui/Loading";
import MoveToTopButton from "@/components/layout/MoveToTopButton";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-calendars/styles/material.css";
import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCd0x3R3xbf1x1ZFRGalxTTndYUiweQnxTdEBjUH9bcXRVRGFbVUVwV0leYg=="
);

function App() {
  const checking = useAuthCheck();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (checking) return <Loading />;

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <div className="flex flex-col min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <ScrollToTop />
        <header className="fixed top-0 left-0 right-0 z-[99999] flex justify-center p-0 sm:py-4 sm:px-4 bg-transparent pointer-events-none">
          <div className="pointer-events-auto w-full max-w-7xl">
            <Navbar />
          </div>
        </header>

        <main className="flex-1 flex flex-col pt-24 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MessageBar />
          <div className="flex-1">
            <AppRoutes />
          </div>
          <MoveToTopButton />
        </main>

        <footer className="mt-auto">
          <BottomBar />
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
