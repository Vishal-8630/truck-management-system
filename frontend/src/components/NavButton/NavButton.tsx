import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./NavButton.module.scss";
import { FaArrowRight } from "react-icons/fa";

export interface LinkType {
  to?: string;
  label: string;
  icon?: React.ReactNode;
  subLinks?: LinkType[];
  content?: string;
  onClick?: () => void;
  setIsNavOpen?: () => void;
}

interface NavButtonProps {
  link: LinkType;
}

const NavButton: React.FC<NavButtonProps> = ({ link }) => {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = () => {
    if (isMobile) setHovered((prev) => !prev);
  };

  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={toggleDropdown}
      className={styles.subLinkContainer}
    >
      <motion.li
        onClick={link.onClick}
      >
        {link.subLinks ? (
          <div className={styles.subLinkItem}>
            <div>
              <span className={styles.navLabel}>{link.label}</span>
              <motion.span
                animate={{ rotate: hovered ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {link.icon}
              </motion.span>
            </div>
            {/* Dropdown  */}
            {link.subLinks && isMobile && (
              <AnimatePresence>
                {hovered && (
                  <motion.ul
                    className={styles.dropdown}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {link.subLinks.map((sub) => (
                      <li key={sub.to} onClick={() => link.setIsNavOpen && link.setIsNavOpen()}>
                        <NavLink to={sub.to!} onClick={sub.onClick}>
                          <div>
                            {sub.label}
                            <span>
                              <FaArrowRight />
                            </span>
                          </div>
                          <p className={styles.linkContent}>{sub.content}</p>
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
          </div>
        ) : (
          <NavLink
            to={link.to || "#"}
            onClick={() => link.setIsNavOpen && link.setIsNavOpen()}
            className={styles.navLink}
          >
            {link.label}
          </NavLink>
        )}
      </motion.li>

      {/* Dropdown  */}
      {link.subLinks && !isMobile && (
        <AnimatePresence>
          {hovered && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.dropdown}
            >
              {link.subLinks.map((sub) => (
                <li key={sub.to} onClick={() => setHovered(false)}>
                  <NavLink to={sub.to!} onClick={sub.onClick}>
                    <div>
                      {sub.label}
                      <span>
                        <FaArrowRight />
                      </span>
                    </div>
                    <p className={styles.linkContent}>{sub.content}</p>
                  </NavLink>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default NavButton;
