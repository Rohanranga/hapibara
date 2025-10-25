"use client"
import { motion } from "framer-motion"
import type React from "react"

import { Video, ShoppingBag, Ticket, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const items = [
  { icon: <Video className="w-4 h-4" />, label: "Viral Recipe: Spicy Vegan Maggi in 2 mins!" },
  { icon: <ShoppingBag className="w-4 h-4" />, label: "Deal: 20% off on oat milk kits!" },
  { icon: <Ticket className="w-4 h-4" />, label: "Upcoming: Mumbai Vegan Potluck this Sunday!" },
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: "HapiTip: Did you know almond milk uses 10x less water than dairy?",
  },
]

const HighlightsStrip = ({ id, className }: SectionProps) => {
  return (
    <motion.section
      id={id}
      className={cn("py-6 px-4 bg-secondary/20", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      aria-label="What's Hot in the Garden?"
    >
      <div className="max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold text-primary mb-4">What&apos;s Hot in the Garden?</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 whitespace-nowrap bg-card border border-border text-foreground rounded-full px-4 py-2"
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <span className="text-primary">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default HighlightsStrip;
