import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import PagesOutlet from "../pages/PagesOutlet";
import AdminRoutes from "../components/AdminRoutes";
import About from "../pages/About";

// Authentication pages import
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import Profile from "../pages/Authentication/Profile";

// Journey pages import
import NewJourneyEntry from "../pages/JourneyPages/NewJourneyEntry";
import AllJourneyEntries from "../pages/JourneyPages/AllJourneyEntries";
import NewTruckEntry from "../pages/JourneyPages/NewTruckEntry";
import AllTruckEntries from "../pages/JourneyPages/AllTruckEntries";
import NewDriverEntry from "../pages/JourneyPages/NewDriverEntry";
import AllDriverEntries from "../pages/JourneyPages/AllDriverEntries";
import TruckDetail from "../pages/JourneyPages/TruckDetail";
import JourneyDetail from "../pages/JourneyPages/JourneyDetail";
import DriverDetail from "../pages/JourneyPages/DriverDetail";

// Billing pages import
import BillEntries from "../pages/BillingPages/BillEntries";
import BillingParty from "../pages/BillingPages/BillingParty";
import Bill from "../pages/BillingPages/Bill";
import LRCopy from "../pages/BillingPages/LRCopy";
import NewBillingEntry from "../pages/BillingPages/NewBillingEntry";

// Vehicle pages import
import NewVehicleEntry from "../pages/VehiclePages/NewVehicleEntry";
import VehicleEntries from "../pages/VehiclePages/VehicleEntries";
import NewBalanceParty from "../pages/VehiclePages/NewBalanceParty";
import BalanceParties from "../pages/VehiclePages/BalanceParties";
import PartyBalance from "../pages/VehiclePages/PartyBalance";
import BillEntryDetail from "../pages/BillingPages/BillEntryDetail";

const billEntryRoutes = [
  { path: "new-entry", element: <NewBillingEntry /> },
  { path: "all-bill-entries", element: <BillEntries /> },
  { path: ":id", element: <BillEntryDetail /> },
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
]

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
