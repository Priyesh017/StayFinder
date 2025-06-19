"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

export default function About() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose StayFinder?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make it easy to find and book the perfect accommodation for your
            next adventure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Verified Properties",
              description:
                "All our properties are verified and reviewed by our team to ensure quality and safety.",
              icon: "🏠",
            },
            {
              title: "Best Price Guarantee",
              description:
                "We guarantee the best prices. If you find a lower price elsewhere, we'll match it.",
              icon: "💰",
            },
            {
              title: "24/7 Support",
              description:
                "Our customer support team is available 24/7 to help you with any questions or issues.",
              icon: "🛟",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
