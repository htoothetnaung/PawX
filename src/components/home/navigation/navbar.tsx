'use client';

import { buttonVariants } from "@/components/ui/button";
import Icons from "@/components/global/icons"

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="px-4 h-14 sticky top-0 inset-x-0 w-full bg-gradient-to-b from-orange-50/80 to-rose-50/80 dark:from-zinc-900/80 dark:to-zinc-900/80 backdrop-blur-sm border-b border-border z-50">
            <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl">
                <div className="flex items-start">
                    <Link href="/" className="flex items-center gap-2">
                        <Icons.logo className="w-7 h-7" />
                        <span className="text-lg font-medium">PetHub</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                    {isOpen ? '✕' : '☰'}
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <ul className="flex items-center justify-center gap-8">
                        <a href="/#/features" className="hover:text-foreground/80 text-sm">Features</a>
                        <Link href="/ai" className="hover:text-foreground/80 text-sm">AI Models</Link>
                        <Link href="/map" className="hover:text-foreground/80 text-sm">Map</Link>
                        <Link href="/petSpa" className="hover:text-foreground/80 text-sm">PetSpa</Link>
                        <Link href="/c2c" className="hover:text-foreground/80 text-sm">C2C Platform</Link>
                    </ul>
                </nav>

                {/* Mobile Navigation */}
                <div className={`
                    md:hidden 
                    fixed 
                    inset-y-0 
                    right-0 
                    z-50
                    w-64 
                    
                    transform 
                    transition-transform 
                    duration-300 
                    ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    shadow-lg
                    top-14
                    border-l border-border
                    backdrop-blur-sm
                `}>
                    <nav className="p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
                        <ul className="space-y-4">
                            <li>
                                <a href="/#/features" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <Link href="/ai" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    AI Models
                                </Link>
                            </li>
                            <li>
                                <Link href="/map" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    Map
                                </Link>
                            </li>
                            <li>
                                <Link href="/petSpa" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    PetSpa
                                </Link>
                            </li>
                            <li>
                                <Link href="/c2c" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    C2C Platform
                                </Link>
                            </li>
                            <li className="pt-4">
                                <Link href="/sign-in" className={buttonVariants({ size: "sm", variant: "ghost", className: "w-full justify-center" })}>
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/sign-up" className={buttonVariants({ size: "sm", className: "w-full justify-center" })}>
                                    Start free trial
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/sign-in" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                        Login
                    </Link>
                    <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                        Start free trial
                    </Link>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </header>
    );
};

export default Navbar;
