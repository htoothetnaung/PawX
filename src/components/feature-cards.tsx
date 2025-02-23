"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Heart } from "lucide-react";

export const FeatureCards = () => {
    return (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
        >
            {features.map((feature, index) => (
                <motion.div
                    key={feature.title}
                    className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 * index }}
                >
                    <feature.Icon className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{feature.info}</p>
                </motion.div>
            ))}
        </motion.div>
    );
};

const features = [
    {
        title: "Smart Matching",
        info: "Our AI helps find the perfect pet based on your lifestyle and preferences.",
        Icon: Sparkles
    },
    {
        title: "Expert Support",
        info: "Get guidance from pet care professionals throughout your journey.",
        Icon: Shield
    },
    {
        title: "Easy Process",
        info: "Simple and streamlined adoption process to help you meet your new friend.",
        Icon: Heart
    }
]; 