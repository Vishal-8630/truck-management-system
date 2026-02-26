import { MotionConfig } from "framer-motion";
import BottomBar from "@/components/layout/BottomBar";
import MessageBar from "@/components/layout/MessageBar";
import Navbar from "@/components/layout/Navbar";
import AppRoutes from "@/routes/AppRoutes";

import useAuthCheck from "@/hooks/useAuthCheck";
import Loading from "@/components/ui/Loading";
import MoveToTopButton from "@/components/layout/MoveToTopButton";

import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-calendars/styles/material.css";
import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCd0x3R3xbf1x1ZFRGalxTTndYUiweQnxTdEBjUH9bcXRVRGFbVUVwV0leYg=="
);

function App() {
  const checking = useAuthCheck();

  if (checking) return <Loading />;

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 bg-transparent pointer-events-none">
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
