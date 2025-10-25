"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ChefHat, ShoppingBag, Users, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const cards = [
  {
    title: "Recipes & Groceries",
    description: "Cook plant‑based meals, watch 15‑sec videos, and shop ingredients in one tap.",
    Icon: ChefHat,
  },
  {
    title: "HapiHive",
    description: "Community events, plant‑based friendships, even dating — all in one wholesome space.",
    Icon: Users,
  },
  {
    title: "Conscious Store",
    description: "Everything you love — just kinder. Skincare, snacks, fashion & more.",
    Icon: ShoppingBag,
  },
  {
    title: "Your Kindness Meter",
    description: "See your impact in real‑time: animals, water, and planet saved.",
    Icon: Gauge,
  },
]

const ExploreSection = ({ id, className }: SectionProps) => {
  return (
    <motion.section
      id={id}
      className={cn("py-20 px-4", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-10"
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Explore HapiBara
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ title, description, Icon }, i) => (
            <motion.div
              key={title}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * i }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-secondary/60 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default ExploreSection;
