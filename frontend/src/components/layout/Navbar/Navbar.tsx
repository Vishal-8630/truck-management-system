import { useNavigate, useLocation } from "react-router-dom";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useEffect, useState } from "react";
import NavButton from "@/components/NavButton/NavButton";
import { ChevronDown, Menu, X, Sun, Moon, LogIn, User } from "lucide-react";
import DRL from "@/assets/drl.png";
import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout: authLogout } = useAuthStore();
  const { addMessage } = useMessageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
    if (!isNavOpen) setExpandedLabel(null);
  }, [isNavOpen]);

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

  const links = [
    ...(!user
      ? [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/services", label: "Services" },
        { to: "/fleet", label: "Fleet" },
        { to: "/contact", label: "Contact" },
      ]
      : []),
    ...(user
      ? [
        {
          label: "Entries",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/bill-entry/all-bill-entries",
              label: "Bill Entries",
              content: "Manage and create bill entries.",
            },
            {
              to: "/bill-entry/billing-party",
              label: "Billing Party",
              content: "Click here to add Billing Party.",
            },
            {
              to: "/vehicle-entry/all-vehicle-entries",
              label: "Vehicle Logs",
              content: "Manage and create vehicle logs.",
            },
            {
              to: "/vehicle-entry/balance-party",
              label: "Balance Party",
              content: "Manage and track party balances.",
            },
          ],
        },
        {
          label: "Operations",
          icon: <ChevronDown size={14} />,
          subLinks: [
            {
              to: "/journey/all-journey-entries",
              label: "Journey Logs",
              content: "Manage and plan truck journeys.",
            },
            {
              to: "/journey/all-truck-entries",
              label: "Vehicle Fleet",
              content: "Manage and monitor your trucks.",
            },
            {
              to: "/journey/all-driver-entries",
              label: "Driver Profiles",
              content: "Manage and register driver records.",
            },
            {
              to: "/journey/all-settlements",
              label: "All Settlements",
              content: "View all driver payout settlements.",
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
        {
          label: "Admin",
          icon: <ChevronDown size={14} />,
          subLinks: [
            { to: "/admin/inquiries", label: "Inquiries", content: "View website messages" },
            { to: "/admin/quotes", label: "Quotes", content: "View freight requests" },
          ]
        },
      ]
      : []),
  ];

  return (
    <nav
      className="w-full h-16 lg:backdrop-blur-md lg:rounded-2xl shadow-premium px-4 lg:px-6 flex items-center justify-between pointer-events-auto transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <img src={DRL} alt="Divyanshi Road Lines" className="h-10 w-auto dark:brightness-110" />
      </div>

      <ul
        className={`fixed inset-0 z-[100] flex flex-col p-8 pt-24 gap-4 transition-transform duration-500 lg:static lg:bg-transparent! lg:p-0 lg:flex-row lg:items-center lg:gap-1 lg:translate-x-0 lg:overflow-visible overflow-y-auto custom-scrollbar
          ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={isNavOpen ? { backgroundColor: 'var(--color-bg-base)' } : {}}
      >
        {links.map((link) => (
          <NavButton
            key={link.label}
            link={{
              ...link,
              setIsNavOpen: () => setIsNavOpen(false),
            }}
            expanded={expandedLabel === link.label}
            onToggleExpanded={() => setExpandedLabel(expandedLabel === link.label ? null : link.label)}
          />
        ))}
        {/* Mobile only buttons */}
        <li className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8 lg:hidden flex flex-col gap-4">
          {!user ? (
            <button
              onClick={() => { navigate("/login"); setIsNavOpen(false); }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Login to Account
            </button>
          ) : (
            <button
              onClick={() => { handleLogout(); setIsNavOpen(false); }}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              Logout
            </button>
          )}
        </li>
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-all border shadow-sm relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-raised)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border-default)',
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="hidden lg:flex btn-primary !px-6 !py-2.5 items-center gap-2 text-sm"
          >
            <LogIn size={16} />
            Staff Login
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className={`hidden lg:flex p-2.5 rounded-xl border transition-all ${pathname === '/profile' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
              title="View Profile"
            >
              <User size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="hidden lg:flex btn-secondary !px-6 !py-2.5 text-sm"
            >
              Logout
            </button>
          </div>
        )}

        <button
          className="lg:hidden relative z-[110] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          {isNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
