"use client"
import type React from "react"
import { motion } from "framer-motion"
import { PawPrint, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const MascotSection = ({ id, className }: SectionProps) => {
  return (
    <motion.section
      id={id}
      className={cn("py-20 px-4", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-3xl p-8 md:p-12 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="mb-6 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center">
              <Sprout className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-primary mb-6">Meet Hapi — The Capybara Mascot</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            I&apos;m not just cute. I&apos;m your accountability buddy, recipe reminder, and mood‑booster. I pop up when
            you need me with tips, jokes, or hugs (digital only).
          </p>
          <motion.div
            className="bg-card border border-border rounded-2xl p-6 inline-flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <PawPrint className="w-5 h-5 text-primary" />
            <p className="text-xl font-semibold text-foreground">Save animals. Eat well. Flirt with tofu lovers.</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default MascotSection;
