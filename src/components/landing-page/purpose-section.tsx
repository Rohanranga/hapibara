"use client"
import { motion } from "framer-motion"
import type React from "react"

import { ChefHat, ShoppingBag, MessageCircle, Gauge, Cog as Cow, Droplets, TreePine } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const PurposeSection = ({ id, className }: SectionProps) => {
  const impactStats = [
    { Icon: Cow, number: "31,942", label: "Animals Saved" },
    { Icon: Droplets, number: "12M", label: "Litres Water Saved" },
    { Icon: TreePine, number: "5,670", label: "Trees Equivalent" },
  ]

  return (
    <motion.section
      id={id}
      className={cn("py-20 px-4 bg-secondary/20", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-primary mb-8 text-balance"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          One‑Stop Platform for Plant‑Based, Purposeful Living
        </motion.h2>

        <motion.p
          className="text-xl text-muted-foreground mb-8 md:mb-10 max-w-3xl mx-auto text-pretty"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          Whether you&apos;re plant‑curious or fully vegan, HapiBara is your happy place. From guilt‑free recipes and
          conscious shopping to fun meetups and dating for veggie hearts — we&apos;ve got it all.
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 justify-items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { Icon: ChefHat, text: "Eat Good" },
            { Icon: ShoppingBag, text: "Shop Kind" },
            { Icon: MessageCircle, text: "Connect Freely" },
            { Icon: Gauge, text: "Track Your Kind Impact" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              className="bg-card border border-border rounded-full px-4 py-2 text-sm text-foreground flex items-center gap-2"
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <item.Icon className="w-4 h-4 text-primary" />
              <span className="text-pretty">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          Since we started, the HapiFam has saved...
        </motion.p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {impactStats.map(({ Icon, number, label }, idx) => (
            <motion.div
              key={idx}
              className="bg-card/80 border border-border rounded-2xl p-6 min-w-[160px] shadow-md flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
              viewport={{ once: true }}
            >
              <Icon className="w-8 h-8 mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary mb-1">{number}</div>
              <div className="text-muted-foreground text-sm text-center">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default PurposeSection;
