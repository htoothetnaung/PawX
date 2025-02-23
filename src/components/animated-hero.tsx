"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const AnimatedHero = () => {
    return (
        <div className="flex flex-col items-center text-center space-y-8">
            <motion.h1 
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Find Your Perfect Pet Companion
            </motion.h1>
            <motion.p 
                className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-[42rem] leading-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                Connect with loving pets waiting for their forever homes. Our AI-powered matching helps you find your ideal furry friend.
            </motion.p>
            
            <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Link 
                    href="/sign-up" 
                    className={buttonVariants({
                        size: "lg",
                        className: "bg-orange-500 hover:bg-orange-600 text-white transition-transform hover:scale-105"
                    })}
                >
                    Find a Pet
                </Link>
                <Link 
                    href="/about" 
                    className={buttonVariants({
                        size: "lg",
                        variant: "outline",
                        className: "bg-white hover:bg-orange-50 border-orange-200 text-orange-600 dark:bg-zinc-900 dark:hover:bg-orange-900/50 dark:border-orange-800 dark:text-orange-400 transition-transform hover:scale-105"
                    })}
                >
                    Learn More
                </Link>
            </motion.div>
        </div>
    );
}; 