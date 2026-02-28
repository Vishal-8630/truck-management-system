import { Route, Routes, Navigate } from "react-router-dom";

// Auth
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/Login/ForgotPassword";
import ResetPassword from "@/pages/auth/Login/ResetPassword";
import Profile from "@/pages/auth/Profile";

// Shared
import Home from "@/pages/shared/Home";
import About from "@/pages/shared/About";
import Services from "@/pages/shared/Services/Services";
import Fleet from "@/pages/shared/Fleet/Fleet";
import Contact from "@/pages/shared/Contact/Contact";
import FAQ from "@/pages/shared/FAQ/FAQ";
import TermsConditions from "@/pages/shared/Legal/TermsConditions";
import PrivacyPolicy from "@/pages/shared/Legal/PrivacyPolicy";
import NotFound from "@/pages/shared/NotFound";
import PagesOutlet from "@/pages/shared/PagesOutlet";

// Dashboard Views
import UnsettledJourneys from "@/pages/shared/Home/views/UnsettledJourneys";
import PendingDriverSettlements from "@/pages/shared/Home/views/PendingDriverSettlements";
import PartyPaymentsWatchlist from "@/pages/shared/Home/views/PartyPaymentsWatchlist";
import ComplianceAlerts from "@/pages/shared/Home/views/ComplianceAlerts";
import OperationalActivity from "@/pages/shared/Home/views/OperationalActivity";

// Bills
import BillEntries from "@/pages/bills/BillEntries";
import LRCopy from "@/pages/bills/LRCopy";
import Bill from "@/pages/bills/Bill";
import BillingParty from "@/pages/bills/BillingParty";

// Vehicles
import VehicleEntries from "@/pages/vehicles/VehicleEntries";
import BalanceParties from "@/pages/vehicles/BalanceParties";
import PartyBalance from "@/pages/vehicles/PartyBalance";

// Journey
import AllJourneyEntries from "@/pages/Journey/AllJourneyEntries";
import AllTruckEntries from "@/pages/Journey/AllTruckEntries";
import AllDriverEntries from "@/pages/Journey/AllDriverEntries";
import AllSettlements from "@/pages/Journey/AllSettlements";
import TruckDetail from "@/pages/Journey/TruckDetail";
import JourneyDetail from "@/pages/Journey/JourneyDetail";
import DriverDetail from "@/pages/Journey/DriverDetail";
import DriverSettlement from "@/pages/Journey/Settlements/DriverSettlement";
import SettlementPreview from "@/pages/Journey/Settlements/SettlementPreview";
import SettlementDetail from "@/pages/Journey/Settlements/SettlementDetail";

// Ledger
import NewLedger from "@/pages/Ledger/NewLedger";
import AllLedgers from "@/pages/Ledger/AllLedgers";
import LedgerDetail from "@/pages/Ledger/LedgerDetail";

// Admin
import Inquiries from "@/pages/admin/Inquiries/Inquiries";
import Quotes from "@/pages/admin/Quotes/Quotes";

// Guards
import ProtectedRoute from "@/components/ProtectedRoute";

const billEntryRoutes = [
  { path: "all-bill-entries", element: <BillEntries /> },
  { path: "lrcopy", element: <LRCopy /> },
  { path: "bill", element: <Bill /> },
  { path: "billing-party", element: <BillingParty /> },
];

const vehicleEntryRoutes = [
  { path: "all-vehicle-entries", element: <VehicleEntries /> },
  { path: "balance-party", element: <BalanceParties /> },
  { path: "party-balance", element: <PartyBalance /> },
];

const journeyEntryRoutes = [
  { path: "all-journey-entries", element: <AllJourneyEntries /> },
  { path: "all-truck-entries", element: <AllTruckEntries /> },
  { path: "all-driver-entries", element: <AllDriverEntries /> },
  { path: "all-settlements", element: <AllSettlements /> },
  { path: "truck/:id", element: <TruckDetail /> },
  { path: "journey-detail/:id", element: <JourneyDetail /> },
  { path: "driver-detail/:id", element: <DriverDetail /> },
  { path: "driver-detail/:id/settlement", element: <DriverSettlement /> },
  { path: "driver-detail/:id/settlement/preview", element: <SettlementPreview /> },
  { path: "driver-detail/:id/settlement/:settlementId", element: <SettlementDetail /> },
];

const ledgerEntryRoutes = [
  { path: "new-ledger", element: <NewLedger /> },
  { path: "all-ledgers", element: <AllLedgers /> },
  { path: "ledger-detail/:id", element: <LedgerDetail /> },
];

const adminRoutes = [
  { path: "inquiries", element: <Inquiries /> },
  { path: "quotes", element: <Quotes /> },
];

const dashboardViewRoutes = [
  { path: "unsettled-journeys", element: <UnsettledJourneys /> },
  { path: "driver-settlements", element: <PendingDriverSettlements /> },
  { path: "party-payments", element: <PartyPaymentsWatchlist /> },
  { path: "compliance-alerts", element: <ComplianceAlerts /> },
  { path: "activity-log", element: <OperationalActivity /> },
];

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms-and-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />



      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bill-entry/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="all-bill-entries" replace />} />
        {billEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/vehicle-entry/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="all-vehicle-entries" replace />} />
        {vehicleEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/journey/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="all-journey-entries" replace />} />
        {journeyEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/ledger/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="new-ledger" replace />} />
        {ledgerEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="inquiries" replace />} />
        {adminRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <PagesOutlet />
          </ProtectedRoute>
        }
      >
        {dashboardViewRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
