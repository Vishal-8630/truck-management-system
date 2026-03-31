import { MotionConfig } from "framer-motion";
import BottomBar from "@/components/layout/BottomBar";
import MessageBar from "@/components/layout/MessageBar";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
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
      <div className="flex flex-col lg:flex-row min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <ScrollToTop />
        
        {/* Sidebar for Desktop */}
        <Sidebar />

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-[999] flex justify-center p-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pointer-events-auto">
          <div className="w-full">
            <Navbar />
          </div>
        </header>

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 flex flex-col pt-8 lg:pt-12 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
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
      </div>
    </MotionConfig>
  );
}

export default App;
