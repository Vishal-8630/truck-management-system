import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useThemeStore } from "@/store/useThemeStore";
import { 
  Home, Info, Truck, Phone,
  FileText, Users, LogOut, Sun, Moon, 
  User, Milestone, Receipt, Activity
} from "lucide-react";
import DRL from "@/assets/drl.png";

type NavLinkType = {
  to?: string;
  label: string;
  icon: React.ReactNode;
  subLinks?: { to: string; label: string }[];
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout: authLogout } = useAuthStore();
  const { addMessage } = useMessageStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/logout");
      authLogout();
      addMessage({ type: "success", text: response.data.message });
      navigate("/login");
    } catch {
      addMessage({ type: "error", text: "Logout failed. Please try again." });
    }
  };

  const publicLinks: NavLinkType[] = [
    { to: "/", label: "Home", icon: <Home size={20} /> },
    { to: "/about", label: "About", icon: <Info size={20} /> },
    { to: "/services", label: "Services", icon: <Activity size={20} /> },
    { to: "/fleet", label: "Fleet", icon: <Truck size={20} /> },
    { to: "/contact", label: "Contact", icon: <Phone size={20} /> },
  ];

  const adminLinks: NavLinkType[] = [
    {
      label: "Entries",
      icon: <FileText size={20} />,
      subLinks: [
        { to: "/bill-entry/all-bill-entries", label: "Bill Entries" },
        { to: "/bill-entry/billing-party", label: "Billing Party" },
        { to: "/bill-entry/lrcopy", label: "LR Copy" },
        { to: "/bill-entry/bill", label: "Invoice Search" },
        { to: "/vehicle-entry/all-vehicle-entries", label: "Vehicle Logs" },
        { to: "/vehicle-entry/balance-party", label: "Balance Party" },
        { to: "/vehicle-entry/party-balance", label: "Party Balance" },
      ],
    },
    {
      label: "Operations",
      icon: <Users size={20} />,
      subLinks: [
        { to: "/journey/all-journey-entries", label: "Journey Logs" },
        { to: "/journey/all-truck-entries", label: "Vehicle Fleet" },
        { to: "/journey/all-driver-entries", label: "Driver Profiles" },
        { to: "/journey/all-settlements", label: "All Settlements" },
      ],
    },
    {
      label: "Ledger",
      icon: <Receipt size={20} />,
      subLinks: [
        { to: "/ledger/new-ledger", label: "New Ledger" },
        { to: "/ledger/all-ledgers", label: "All Ledgers" },
      ],
    },
    {
      label: "Admin",
      icon: <Milestone size={20} />,
      subLinks: [
        { to: "/admin/inquiries", label: "Inquiries" },
        { to: "/admin/quotes", label: "Quotes" },
      ],
    },
  ];

  const sidebarLinks = user ? adminLinks : publicLinks;

  return (
    <aside className="w-72 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 hidden lg:flex overflow-hidden">
      <div className="p-8 pb-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-3 mb-8 cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src={DRL} alt="DRL" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 dark:text-white leading-none">DRL</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logistics</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
          {sidebarLinks.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              {group.subLinks ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-slate-50 dark:border-slate-800 ml-5">
                    {group.subLinks.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) => `
                          px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200
                          ${isActive 
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" 
                            : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                        `}
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  to={group.to || "/"}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200
                    ${isActive 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" 
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                  `}
                >
                  {group.icon}
                  {group.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 pt-4 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${pathname === '/profile' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <User size={20} />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all mt-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <LogOut size={20} />
            Staff Login
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
