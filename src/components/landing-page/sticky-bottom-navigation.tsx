"use client"
import Link from "next/link"
import { Home, Target, Compass, Users, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

const SectionNavigation = () => {
  const links = [
    { href: "#hero", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "#purpose", label: "Purpose", icon: <Target className="w-5 h-5" /> },
    { href: "#explore", label: "Explore", icon: <Compass className="w-5 h-5" /> },
    { href: "#testimonials", label: "Stories", icon: <Users className="w-5 h-5" /> },
    { href: "#join", label: "Join", icon: <UserPlus className="w-5 h-5" /> },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border"
      initial={{ y: 72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      aria-label="Section navigation"
    >
      <ul className="max-w-3xl mx-auto grid grid-cols-5 text-xs text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(l.href);
              }}
              className="flex flex-col items-center justify-center gap-1 py-3 hover:text-foreground transition-colors"
            >
              <span aria-hidden className="text-primary">
                {l.icon}
              </span>
              <span className="text-[10px] leading-tight">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </motion.nav>
  )
}

export default SectionNavigation;
