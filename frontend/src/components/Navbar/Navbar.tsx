import styles from "./Navbar.module.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../app/store";
import api from "../../api/axios";
import { logout } from "../../features/auth";
import { addMessage } from "../../features/message";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NavButton from "../NavButton/NavButton";
import { FaChevronDown } from "react-icons/fa";
import DRL from '../../assets/drl.png';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShow(currentScroll < lastScroll || currentScroll < 50);
      setLastScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

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
            icon: <FaChevronDown />,
            subLinks: [
              {
                to: "/bill-entry/new-entry",
                label: "New Bill Entry",
                content:
                  "Click here to create new Billing Entry.",
              },
              {
                to: "/bill-entry/all-bill-entries",
                label: "All Bill Entries",
                content:
                  "Click here to view all Billing Entries.",
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
                content:
                  "Click here to add Billing Party.",
              },
            ],
          },
          {
            label: "Vehicle Entry",
            icon: <FaChevronDown />,
            subLinks: [
              {
                to: "/vehicle-entry/new-entry",
                label: "New Vehicle Entry",
                content: "Click here to create new Vehicle Entry",
              },
              {
                to: "/vehicle-entry/all-vehicle-entries",
                label: "All Vehicle Entries",
                content:
                  "Click here to view all Vehicle Entries.",
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
            icon: <FaChevronDown />,
            subLinks: [
              {
                to: "/journey/new-journey-entry",
                label: "New Journey Entry",
                content: "Click here to create new Journey Entry",
              },
              {
                to: "/journey/all-journey-entries",
                label: "All Journey Entries",
                content:
                  "Click here to view all Journey Entries.",
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
                to: "/journey/all-driver-entry",
                label: "All Drivers",
                content: "Click here to view all Drivers",
              },
            ],
          },
          { to: "/profile", label: "Profile" },
          ...(user.isAdmin ? [{ to: "/register", label: "Add User" }] : []),
          { to: "/logout", label: "Logout", onClick: handleLogout },
        ]
      : [{ to: "/login", label: "Login" }]),
  ];

  return (
    <div className={styles.navbar}>
      <motion.nav
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : -120 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className={styles.brand}>
          <img src={DRL} alt="DRL" />
        </div>
        <motion.ul
          className={styles.links}
          variants={{
            hidden: { opacity: isMobile ? 0 : 1, y: isMobile ? -500 : 0 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={isNavOpen ? "visible" : "hidden"}
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {links.map((link) => (
            <NavButton
              key={link.label}
              link={{
                ...link,
                icon: link.icon,
                onClick: link.onClick,
                setIsNavOpen: () => setIsNavOpen(false),
                subLinks: link.subLinks,
              }}
            />
          ))}
        </motion.ul>
        <div className={styles.burger} onClick={() => setIsNavOpen(!isNavOpen)}>
          <motion.span
            animate={isNavOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          ></motion.span>
          <motion.span
            animate={isNavOpen ? { opacity: 0 } : { opacity: 1 }}
          ></motion.span>
          <motion.span
            animate={isNavOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          ></motion.span>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
