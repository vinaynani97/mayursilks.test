"use client";

import { motion } from "framer-motion";
import { Scissors, Sparkles, Loader, CheckCircle, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: Scissors,
    title: "Yarn Selection",
    description: "The finest mulberry silk threads are carefully selected from premium suppliers in Karnataka.",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "Natural Dyeing",
    description: "Threads are dyed using traditional methods with vibrant, colourfast natural and quality dyes.",
    step: "02",
  },
  {
    icon: Loader,
    title: "Handloom Weaving",
    description: "Skilled artisans weave each saree thread by thread on traditional handlooms — a process taking 3–14 days.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Quality Check",
    description: "Every saree undergoes rigorous quality inspection to ensure it meets our premium standards.",
    step: "04",
  },
  {
    icon: PackageCheck,
    title: "Delivered to You",
    description: "Carefully packaged and delivered directly to your doorstep within 5–7 working days.",
    step: "05",
  },
];

export default function OurStory() {
  return (
    <section className="luxury-section bg-white overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-secondary-500" />
                <span className="font-jost text-secondary-600 text-sm tracking-[0.3em] uppercase">
                  Our Heritage
                </span>
              </div>
              <h2 className="heading-section text-gray-900 mb-6">
                The Story Behind Every Saree
              </h2>
              <p className="font-jost text-gray-600 leading-relaxed mb-6">
                The journey of a Mayur Silks saree begins with sourcing the finest
                silk threads from trusted farms. Our weavers — many from families
                who have been weaving for generations — dedicate their skill and
                passion to every centimetre of fabric.
              </p>
              <p className="font-jost text-gray-600 leading-relaxed mb-8">
                When you wear a Mayur Silks saree, you&apos;re not just wearing fabric
                — you&apos;re wearing a piece of India&apos;s irreplaceable heritage,
                preserved by hands that have dedicated their lives to this craft.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-100">
                {[
                  { number: "25+", label: "Years Experience" },
                  { number: "5000+", label: "Sarees Delivered" },
                  { number: "1000+", label: "Happy Customers" },
                ].map(({ number, label }) => (
                  <div key={label} className="text-center">
                    <div className="font-josefin text-2xl font-bold text-primary-500">
                      {number}
                    </div>
                    <div className="font-jost text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-secondary-300 via-primary-300 to-transparent" />

            <div className="space-y-8">
              {steps.map(({ icon: Icon, title, description, step }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 relative"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center flex-shrink-0 relative z-10 group-hover:bg-primary-100 transition-colors">
                    <Icon className="w-7 h-7 text-primary-500" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary-400 flex items-center justify-center">
                      <span className="font-josefin font-bold text-[9px] text-primary-900">
                        {step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <h3 className="font-josefin font-semibold text-gray-900 text-lg mb-1">
                      {title}
                    </h3>
                    <p className="font-jost text-gray-500 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
