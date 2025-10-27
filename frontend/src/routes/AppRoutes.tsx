import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import NewBillingEntry from "../pages/NewBillingEntry";
import ProtectedRoute from "../components/ProtectedRoute";
import LRCopy from "../pages/LRCopy";
import Bill from "../pages/Bill";
import BillingParty from "../pages/BillingParty";
import NotFound from "../pages/NotFound";
import NewVehicleEntry from "../pages/NewVehicleEntry";
import VehicleEntries from "../pages/VehicleEntries";
import NewBalanceParty from "../pages/NewBalanceParty";
import BalanceParties from "../pages/BalanceParties";
import PartyBalance from "../pages/PartyBalance";
import BillEntries from "../pages/BillEntries";
import PagesOutlet from "../pages/PagesOutlet";
import AdminRoutes from "../components/AdminRoutes";
import About from "../pages/About";
import NewJourneyEntry from "../pages/Journey/NewJourneyEntry";
import AllJourneyEntries from "../pages/Journey/AllJourneyEntries";
import NewTruckEntry from "../pages/Journey/NewTruckEntry";
import AllTruckEntries from "../pages/Journey/AllTruckEntries";
import NewDriverEntry from "../pages/Journey/NewDriverEntry";
import AllDriverEntries from "../pages/Journey/AllDriverEntries";
import TruckDetail from "../pages/Journey/TruckDetail";
import JourneyDetail from "../pages/Journey/JourneyDetail";
import DriverDetail from "../pages/Journey/DriverDetail";

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
