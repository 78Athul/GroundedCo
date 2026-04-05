"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Leaf, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Nav theme: 'light' = dark text on light bg, 'dark' = cream text on dark bg
type NavTheme = "dark" | "light";

function useNavTheme(): NavTheme {
  const [theme, setTheme] = React.useState<NavTheme>("dark");

  React.useEffect(() => {
    // Observe all sections tagged with data-nav-theme
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among all intersecting sections, pick the one whose top is closest to 0
        let best: { theme: NavTheme; top: number } | null = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const top = entry.boundingClientRect.top;
            if (!best || Math.abs(top) < Math.abs(best.top)) {
              best = {
                theme: (entry.target as HTMLElement).dataset.navTheme as NavTheme,
                top,
              };
            }
          }
        });
        // Re-scan ALL sections (not just changed ones) to find the topmost visible
        let topSection: { theme: NavTheme; top: number } | null = null;
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          // Section covers the nav area (top ~24px)
          if (rect.top <= 60 && rect.bottom > 0) {
            if (!topSection || rect.top > topSection.top) {
              topSection = {
                theme: section.dataset.navTheme as NavTheme,
                top: rect.top,
              };
            }
          }
        });
        if (topSection) {
          setTheme((topSection as { theme: NavTheme }).theme);
        }
      },
      {
        // Fire whenever a section enters/leaves the top portion of the viewport
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "0px 0px -40% 0px",
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Also update on scroll for precision — RAF-throttled to avoid layout thrashing
  React.useEffect(() => {
    let rafId: number | null = null;
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");

    function update() {
      let topSection: { theme: NavTheme; top: number } | null = null;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 60 && rect.bottom > 60) {
          if (!topSection || rect.top > topSection.top) {
            topSection = { theme: section.dataset.navTheme as NavTheme, top: rect.top };
          }
        }
      });
      if (topSection) setTheme((topSection as { theme: NavTheme }).theme);
      rafId = null;
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // run once on mount
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return theme;
}

const navItems = [
  { name: "Home", href: "/" },
  { name: "Enter the Quiet", href: "/enter-the-quiet" },
];

const EXPAND_SCROLL_THRESHOLD = 80;

const containerVariants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: "auto",
    transition: {
      y: { type: "spring" as const, damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "3rem",
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
      when: "afterChildren" as const,
      staggerChildren: 0.05,
      staggerDirection: -1 as const,
    },
  },
};

const logoVariants = {
  expanded: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring" as const, damping: 15 } },
  collapsed: { opacity: 0, x: -25, rotate: -180, transition: { duration: 0.3 } },
};

const itemVariants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: "spring" as const, damping: 15 } },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const collapsedIconVariants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 15, stiffness: 300, delay: 0.15 },
  },
};

export function AnimatedNav() {
  const [isExpanded, setExpanded] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const navTheme = useNavTheme();

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.1 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        onClick={handleNavClick}
        className={cn(
          "flex items-center overflow-hidden rounded-full shadow-sm h-12 transition-all duration-500",
          navTheme === "dark"
            ? "bg-black/10 border border-white/15 backdrop-blur-md"
            : "bg-white/20 border border-black/10 backdrop-blur-md",
          !isExpanded && "cursor-pointer justify-center"
        )}
      >
        {/* Logo icon */}
        <motion.div
          variants={logoVariants}
          className="flex-shrink-0 flex items-center pl-4 pr-2"
        >
          <Leaf
            className={cn(
              "h-5 w-5 transition-colors duration-500",
              navTheme === "dark" ? "text-sage" : "text-forest"
            )}
          />
        </motion.div>

        {/* Nav links */}
        <motion.div
          className={cn(
            "flex items-center gap-1 pr-4",
            !isExpanded && "pointer-events-none"
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.a
                key={item.name}
                href={item.href}
                variants={itemVariants}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(item.href);
                }}
                className={cn(
                  "text-sm font-sans font-bold tracking-wide px-3 py-1 rounded-full whitespace-nowrap",
                  "transition-colors duration-500",
                  navTheme === "dark"
                    ? isActive
                      ? "bg-sage/20 text-cream"
                      : "text-cream/70 hover:text-cream"
                    : isActive
                    ? "bg-forest/15 text-forest"
                    : "text-forest/60 hover:text-forest"
                )}
              >
                {item.name}
              </motion.a>
            );
          })}
        </motion.div>

        {/* Collapsed icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            variants={collapsedIconVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            <Menu
              className={cn(
                "h-5 w-5 transition-colors duration-500",
                navTheme === "dark" ? "text-sage" : "text-forest"
              )}
            />
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}
