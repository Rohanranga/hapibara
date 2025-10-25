"use client"
import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, Sparkles, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const CTASection = ({ id, className }: SectionProps) => {
  return (
    <motion.section
      id={id}
      className={cn("py-20 px-4", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border rounded-3xl p-8 md:p-12"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="mb-6 flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <motion.div
            className="bg-card border border-border rounded-2xl p-4 mb-8 inline-block"
            whileHover={{ rotate: [0, -2, 2, 0] }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg font-semibold text-foreground">You in?</p>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Join the HapiFam</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your plant‑based journey with us — free, fun, and full of flavor.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            {["Save favorite recipes", "Track your eco impact", "Join events & groups", "Access PlantMatch (beta)"].map(
              (feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </motion.div>
              ),
            )}
          </div>

          <Link href="/auth/signin">
            <motion.button
              className="bg-primary text-primary-foreground px-10 py-4 rounded-full text-xl font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Let&apos;s Get Hapi
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default CTASection;
