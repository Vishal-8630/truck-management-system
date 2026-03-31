import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import UniversalSearch from "../UniversalSearch/UniversalSearch";
import { 
  Home, Info, Truck, Phone,
  FileText, Users, LogOut, Sun, Moon, 
  User, Milestone, Receipt, Activity,
  LayoutDashboard, Menu, X, ChevronLeft
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
  const { isCollapsed, toggleSidebar, setCollapsed } = useSidebarStore();

  const getInitialLabel = (label: string) => {
    const words = label.trim().split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return (words[0][0] || "").toUpperCase();
  };

  // Shrink sidebar when a page is selected (path change)
  useEffect(() => {
    if (pathname !== '/' && window.innerWidth >= 1024) {
      setCollapsed(true);
    }
  }, [pathname, setCollapsed]);

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
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
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
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[1000] p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 pointer-events-auto"
      >
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998]"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`
          flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-[999]
          fixed lg:sticky lg:top-8 top-0 h-screen lg:h-[calc(100vh-80px)] lg:ml-4 lg:mb-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-none
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 w-0 lg:w-20' : 'translate-x-0 w-72'}
          flex
        `}
      >
        <div className={`flex-1 flex flex-col min-h-0 ${isCollapsed ? 'px-1' : 'p-8'} pb-4 pt-16 lg:pt-8`}>
          <div className={`flex items-center justify-between mb-8 shrink-0`}>
            <div className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? 'hidden' : ''}`} onClick={() => navigate("/")}>
              <img src={DRL} alt="DRL" className="h-10 w-auto shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="font-black text-lg text-slate-900 dark:text-white leading-none">DRL</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logistics</span>
                </div>
              )}
            </div>
            <button 
              onClick={toggleSidebar}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors flex items-center justify-center ${isCollapsed ? 'w-full px-0' : ''}`}
            >
              {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
            </button>
          </div>

          <div className="mb-8 px-1">
            <UniversalSearch isCollapsed={isCollapsed} />
          </div>

          <nav className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2 overflow-x-hidden">
            {sidebarLinks.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                {group.subLinks ? (
                  <>
                    <div className={`flex items-center gap-2 px-3 py-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ${isCollapsed ? 'justify-center px-0' : ''}`}>
                      <span className="shrink-0">{group.icon}</span>
                      {!isCollapsed && <span>{group.label}</span>}
                    </div>
                    <div className={`flex flex-col gap-1 border-slate-50 dark:border-slate-800 ${isCollapsed ? 'items-center' : 'pl-4 border-l-2 ml-5'}`}>
                      {group.subLinks.map((sub) => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
                          title={isCollapsed ? sub.label : ""}
                          className={({ isActive }) => `
                            px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap
                            ${isActive 
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" 
                              : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                              ${isCollapsed ? 'p-2 text-[10px] text-center w-full truncate border-none!' : ''}
                          `}
                        >
                          {isCollapsed ? getInitialLabel(sub.label) : sub.label}
                        </NavLink>
                      ))}
                    </div>
                  </>
                ) : (
                  <NavLink
                    to={group.to || "/"}
                    onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
                    title={isCollapsed ? group.label : ""}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 overflow-hidden
                      ${isActive 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" 
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                        ${isCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <span className="shrink-0">{group.icon}</span>
                    {!isCollapsed && <span className="whitespace-nowrap">{group.label}</span>}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className={`mt-auto flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'p-2 items-center' : 'p-6 pt-4'}`}>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === "light" ? "Dark Mode" : "Light Mode") : ""}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isCollapsed ? 'justify-center p-3' : ''}`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            {!isCollapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
          </button>

          {user ? (
            <>
              <button
                onClick={() => { navigate("/profile"); if (window.innerWidth < 1024) setCollapsed(true); }}
                title={isCollapsed ? "Profile" : ""}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${pathname === '/profile' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center p-3' : ''}`}
              >
                <User size={20} />
                {!isCollapsed && "Profile"}
              </button>
              <button
                onClick={handleLogout}
                title={isCollapsed ? "Logout" : ""}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all ${isCollapsed ? 'justify-center p-3' : ''}`}
              >
                <LogOut size={20} />
                {!isCollapsed && "Logout"}
              </button>
            </>
          ) : (
            <button
              onClick={() => { navigate("/login"); if (window.innerWidth < 1024) setCollapsed(true); }}
              title={isCollapsed ? "Staff Login" : ""}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all ${isCollapsed ? 'justify-center p-3' : ''}`}
            >
              <LogOut size={20} />
              {!isCollapsed && "Staff Login"}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
