import { Route, Routes, Navigate } from "react-router-dom";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Profile from "@/pages/auth/Profile";

// Shared
import Home from "@/pages/shared/Home";
import About from "@/pages/shared/About";
import NotFound from "@/pages/shared/NotFound";
import PagesOutlet from "@/pages/shared/PagesOutlet";

// Bills
import NewBillingEntry from "@/pages/bills/NewBillingEntry";
import BillEntries from "@/pages/bills/BillEntries";
import LRCopy from "@/pages/bills/LRCopy";
import Bill from "@/pages/bills/Bill";
import BillingParty from "@/pages/bills/BillingParty";

// Vehicles
import NewVehicleEntry from "@/pages/vehicles/NewVehicleEntry";
import VehicleEntries from "@/pages/vehicles/VehicleEntries";
import NewBalanceParty from "@/pages/vehicles/NewBalanceParty";
import BalanceParties from "@/pages/vehicles/BalanceParties";
import PartyBalance from "@/pages/vehicles/PartyBalance";

// Journey
import NewJourneyEntry from "@/pages/Journey/NewJourneyEntry";
import AllJourneyEntries from "@/pages/Journey/AllJourneyEntries";
import NewTruckEntry from "@/pages/Journey/NewTruckEntry";
import AllTruckEntries from "@/pages/Journey/AllTruckEntries";
import NewDriverEntry from "@/pages/Journey/NewDriverEntry";
import AllDriverEntries from "@/pages/Journey/AllDriverEntries";
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

// Guards
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoutes from "@/components/AdminRoutes";

const billEntryRoutes = [
  { path: "new-entry", element: <NewBillingEntry /> },
  { path: "all-bill-entries", element: <BillEntries /> },
  { path: "lrcopy", element: <LRCopy /> },
  { path: "bill", element: <Bill /> },
  { path: "billing-party", element: <BillingParty /> },
];

const vehicleEntryRoutes = [
  { path: "new-entry", element: <NewVehicleEntry /> },
  { path: "all-vehicle-entries", element: <VehicleEntries /> },
  { path: "new-balance-party", element: <NewBalanceParty /> },
  { path: "all-balance-parties", element: <BalanceParties /> },
  { path: "party-balance", element: <PartyBalance /> },
];

const journeyEntryRoutes = [
  { path: "new-journey-entry", element: <NewJourneyEntry /> },
  { path: "all-journey-entries", element: <AllJourneyEntries /> },
  { path: "new-truck-entry", element: <NewTruckEntry /> },
  { path: "all-truck-entries", element: <AllTruckEntries /> },
  { path: "new-driver-entry", element: <NewDriverEntry /> },
  { path: "all-driver-entries", element: <AllDriverEntries /> },
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />

      <Route
        path="/register"
        element={
          <AdminRoutes>
            <Register />
          </AdminRoutes>
        }
      />

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
        <Route index element={<Navigate to="new-entry" replace />} />
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
        <Route index element={<Navigate to="new-entry" replace />} />
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
        <Route index element={<Navigate to="new-journey-entry" replace />} />
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
