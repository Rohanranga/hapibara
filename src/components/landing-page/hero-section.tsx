"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChefHat, ShoppingCart, Users, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const HeroSection = ({ id, className }: SectionProps) => {
  return (
    <motion.section
      id={id}
      className={cn(
        "min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex items-center justify-center px-4 pt-16",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          className="mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
            <Sprout className="w-14 h-14 text-primary" />
          </div>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-primary mb-4 text-balance"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            HapiBara
          </motion.h1>
          <p className="text-xl md:text-2xl text-muted-foreground">Plants. People. Purpose.</p>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Hi, I’m Hapi — your capybara buddy for a joyful plant‑based life.
          </p>
        </motion.div>

        <motion.div
          className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-8 mb-8 max-w-2xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg text-muted-foreground mb-6">
            Explore recipes that love you back, shop kind stuff, and meet plant‑powered people just like you.
          </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChefHat className="w-5 h-5" />
                Let&apos;s Cook
              </motion.button>
            </Link>
            <Link href="/auth/signin">
              <motion.button
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-5 h-5" />
                Shop Kind
              </motion.button>
            </Link>
            <Link href="/auth/signin">
              <motion.button
                className="bg-accent text-accent-foreground px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5" />
                Join the Fam
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default HeroSection;
