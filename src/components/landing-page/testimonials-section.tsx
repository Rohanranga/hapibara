"use client"
import type React from "react"
import { motion } from "framer-motion"
import { Star, Sprout, FlaskConical, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionProps = React.HTMLAttributes<HTMLElement>

const TestimonialsSection = ({ id, className }: SectionProps) => {
  const testimonials = [
    {
      quote: "I finally got my meat-loving boyfriend hooked on HapiBara's Chik'n Shawarma!",
      author: "@PlantKween",
      Icon: Sprout,
    },
    {
      quote: "This is the only platform where I found vegan friends and shampoo in one place.",
      author: "Ankur S.",
      Icon: FlaskConical,
    },
    { quote: "Love the shopping feature. I build my week's meals in 5 mins flat.", author: "Neha P.", Icon: Zap },
  ]
  return (
    <motion.section
      id={id}
      className={cn("py-20 px-4 bg-secondary/10", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center text-primary mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          Community Voices
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(({ quote, author, Icon }, index) => (
            <motion.div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{author}</div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic">{quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default TestimonialsSection;
