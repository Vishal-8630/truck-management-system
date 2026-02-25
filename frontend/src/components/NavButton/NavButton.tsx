import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = () => {
    if (isMobile) setHovered((prev) => !prev);
  };

  const navItemClasses = ({ isActive }: { isActive: boolean }) => `
    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
    ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}
    ${isMobile ? 'text-lg w-full flex justify-between' : ''}
  `;

  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={toggleDropdown}
      className={`relative ${isMobile ? 'w-full' : ''}`}
    >
      <li className="list-none flex flex-col">
        {link.subLinks ? (
          <div className="flex flex-col">
            <button
              onClick={link.onClick}
              className={`flex items-center justify-between gap-1 px-4 py-2 rounded-xl text-sm lg:text-sm font-medium transition-all duration-200 w-full text-slate-600 hover:text-indigo-600 hover:bg-slate-50 ${isMobile ? 'text-lg' : ''}`}
            >
              <span className="flex-1 text-left">{link.label}</span>
              <motion.span
                animate={{ rotate: hovered ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                {link.icon}
              </motion.span>
            </button>

            <AnimatePresence>
              {hovered && (
                <motion.ul
                  initial={isMobile ? { height: 0, opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={isMobile ? { height: 'auto', opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={isMobile ? { height: 0, opacity: 0 } : { opacity: 0, y: 10 }}
                  className={`
                    ${isMobile
                      ? 'flex flex-col gap-2 pl-4 mt-2 overflow-hidden'
                      : 'absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-xl min-w-[240px] z-50'
                    }
                  `}
                >
                  {link.subLinks.map((sub) => (
                    <li key={sub.to} className="list-none">
                      <NavLink
                        to={sub.to!}
                        onClick={() => {
                          sub.onClick?.();
                          link.setIsNavOpen?.();
                          if (!isMobile) setHovered(false);
                        }}
                        className={({ isActive }) => `
                          flex flex-col p-3 rounded-xl transition-all duration-200 group
                          ${isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'}
                        `}
                      >
                        <div className="flex items-center justify-between font-semibold text-sm group-hover:text-indigo-600 transition-colors">
                          {sub.label}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        {sub.content && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sub.content}</p>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink
            to={link.to || "#"}
            onClick={() => {
              link.onClick?.();
              link.setIsNavOpen?.();
            }}
            className={navItemClasses}
          >
            {link.label}
            {isMobile && link.to === '/logout' && <ArrowRight className="w-5 h-5" />}
          </NavLink>
        )}
      </li>
    </div>
  );
};

export default NavButton;

