"use client";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoMdHome } from "react-icons/io";
import { MdEvent } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { FaWpforms } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HomeIcon = () => <IoMdHome size={20} />;
const EventsIcon = () => <MdEvent size={20} />;
const AboutUsIcon = () => <FaUsers size={20} />;
const SignupIcon = () => <FaWpforms size={20} />;

interface Tab {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: never;
}
interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}
type TabItem = Tab | Separator;
interface ExpandedTabsProps {
  tabs: TabItem[];
  className?: string;
  onChange?: (index: number | null) => void;
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: {
    width: "auto",
    opacity: 1,
    transition: { delay: 0.05, duration: 0.2, ease: "easeOut" as const },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

function ExpandedTabs({ tabs, className }: ExpandedTabsProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive selected index from current pathname
  const selected = tabs.findIndex((tab) => {
    if (tab.type === "separator") return false;
    const href = tab.title === "Home" ? "/" : `/${tab.title.toLowerCase()}`;
    return pathname === href; /*
    || (href !== "/" && pathname.startsWith(href));
    NEED THIS IF WE START USING NESTED PARAMS
    */
  });

  const SeparatorComponent = () => (
    <div
      className="h-7 w-px bg-slate-200 dark:bg-slate-700"
      aria-hidden="true"
    />
  );

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 dark:bg-black dark:border-slate-700 p-1 shadow-md backdrop-blur-sm ${
        className || ""
      }`}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <SeparatorComponent key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;

        return (
          <Link
            href={`${tab.title === "Home" ? "/" : tab.title.toLowerCase()}`}
            key={tab.title}
          >
            <button
              className={`relative z-10 flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none 
              ${
                isSelected
                  ? "text-slate-900 dark:text-green-300"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
              }
            `}
            >
              {isSelected && (
                <motion.div
                  layoutId="pill"
                  className="absolute inset-0 z-0 rounded-full bg-white dark:bg-green-500/20 backdrop-blur-sm border border-green-400/30 shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence initial={false}>
                  {isSelected && (
                    <motion.span
                      variants={spanVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {tab.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}

export default function Tabs2() {
  const TABS: TabItem[] = [
    { title: "Home", icon: HomeIcon },
    { title: "Events", icon: EventsIcon },
    { title: "About", icon: AboutUsIcon },
    { type: "separator" },
    { title: "Signup", icon: SignupIcon },
  ];

  return <ExpandedTabs tabs={TABS} />;
}
