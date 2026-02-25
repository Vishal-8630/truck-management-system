import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../app/store";
import api from "../../api/axios";
import { logout } from "../../features/auth";
import { addMessage } from "../../features/message";
import { useEffect, useState } from "react";
import NavButton from "../NavButton/NavButton";
import { ChevronDown, Menu, X } from "lucide-react";
import DRL from "../../assets/drl.png";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
  }, [isNavOpen]);

  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/logout");
      dispatch(logout());
      dispatch(addMessage({ type: "success", text: response.data.message }));
      navigate("/login");
    } catch {
      dispatch(
        addMessage({ type: "error", text: "Logout failed. Please try again." })
      );
    }
  };

  const links = [
    { to: "/", label: "Home" },
    ...(user
      ? [
        {
          label: "Bill Entry",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/bill-entry/new-entry",
              label: "New Bill Entry",
              content: "Click here to create new Billing Entry.",
            },
            {
              to: "/bill-entry/all-bill-entries",
              label: "All Bill Entries",
              content: "Click here to view all Billing Entries.",
            },
            {
              to: "/bill-entry/lrcopy",
              label: "LR Copy",
              content: "Click here to generate LR Copy",
            },
            {
              to: "/bill-entry/bill",
              label: "Bill",
              content: "Click here to generate Bill",
            },
            {
              to: "/bill-entry/billing-party",
              label: "Billing Party",
              content: "Click here to add Billing Party.",
            },
          ],
        },
        {
          label: "Vehicle Entry",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/vehicle-entry/new-entry",
              label: "New Vehicle Entry",
              content: "Click here to create new Vehicle Entry",
            },
            {
              to: "/vehicle-entry/all-vehicle-entries",
              label: "All Vehicle Entries",
              content: "Click here to view all Vehicle Entries.",
            },
            {
              to: "/vehicle-entry/new-balance-party",
              label: "New Balance Party",
              content: "Click here to create new Balance Party",
            },
            {
              to: "/vehicle-entry/all-balance-parties",
              label: "All Balance Parties",
              content: "Click here to view all Balance Parties",
            },
            {
              to: "/vehicle-entry/party-balance",
              label: "Party Balance",
              content: "Click here to view Party Balance",
            },
          ],
        },
        {
          label: "Journey Entry",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/journey/new-journey-entry",
              label: "New Journey Entry",
              content: "Click here to create new Journey Entry",
            },
            {
              to: "/journey/all-journey-entries",
              label: "All Journey Entries",
              content: "Click here to view all Journey Entries.",
            },
            {
              to: "/journey/new-truck-entry",
              label: "New Truck",
              content: "Click here to add new Truck",
            },
            {
              to: "/journey/all-truck-entries",
              label: "All Trucks",
              content: "Click here to view all Trucks",
            },
            {
              to: "/journey/new-driver-entry",
              label: "New Driver",
              content: "Click here to add new Driver",
            },
            {
              to: "/journey/all-driver-entries",
              label: "All Drivers",
              content: "Click here to view all Drivers",
            },
          ],
        },
        {
          label: "Ledger",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/ledger/new-ledger",
              label: "New Ledger",
              content: "Click to create new Ledger Entry"
            },
            {
              to: "/ledger/all-ledgers",
              label: "All Ledgers",
              content: "Click to view all Ledger Entries"
            }
          ]
        },
        { to: "/profile", label: "Profile" },
        ...(user.isAdmin ? [{ to: "/register", label: "Add User" }] : []),
        { to: "/logout", label: "Logout", onClick: handleLogout },
      ]
      : [{ to: "/login", label: "Login" }]),
  ];

  return (
    <nav className="w-full h-16 bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-premium px-6 flex items-center justify-between pointer-events-auto">
      <div className="flex items-center gap-2">
        <img src={DRL} alt="Divyanshi Road Lines" className="h-10 w-auto" />
      </div>

      <ul className={`
        fixed inset-0 bg-white z-[100] flex flex-col p-8 pt-24 gap-4 transition-transform duration-500 lg:static lg:bg-transparent lg:p-0 lg:flex-row lg:items-center lg:gap-1 lg:translate-x-0
        ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {links.map((link) => (
          <NavButton
            key={link.label}
            link={{
              ...link,
              setIsNavOpen: () => setIsNavOpen(false),
            }}
          />
        ))}
      </ul>

      <button
        className="lg:hidden relative z-[110] p-2 text-slate-900"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        {isNavOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </nav>
  );
};

export default Navbar;
