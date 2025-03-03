import Icons from "@/components/global/icons";
import { Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="flex flex-col relative items-center justify-center border-t border-border pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">

            <div className="hidden lg:block absolute -top-1/3 -right-1/4 bg-orange-200/30 w-72 h-72 rounded-full -z-10 blur-[14rem]"></div>
            <div className="hidden lg:block absolute bottom-0 -left-1/4 bg-rose-200/30 w-72 h-72 rounded-full -z-10 blur-[14rem]"></div>

            <div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">

                <div className="flex flex-col items-start justify-start md:max-w-[300px]">
                    <div className="flex items-start">
                        {/* <Icons.logo className="w-7 h-7" /> */}
                        <img src="/icons/X.png" alt="PawX Logo" width={38} height={38} />
                    </div>
                    <p className="text-red mt-4 text-sm text-start">
                        🐾 Connecting Hearts, One Paw at a Time 🌟
                        <br />
                        <span className="text-xs mt-1 block">
                            Where Every Pet Finds Their Forever Family 🏠💕
                        </span>
                    </p>
                    <span className="mt-4 text-red-600 text-sm flex items-center">
                        Made By B9-UIT J2EE Group 3
                        <Heart className="w-3.5 h-3.5 ml-1 fill-primary text-primary" />
                    </span>
                </div>

                <div className="grid-cols-3 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
                    <div className="">
                        <h3 className="text-black font-medium">
                            Features
                        </h3>
                        <ul className="mt-4 text-sm text-black">
                            <li className="mt-2">
                                <Link href="/ai" className="text-black hover:text-blue-500 transition-all duration-300">
                                    AI Pet Recognition
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/map" className="text-black hover:text-blue-500 transition-all duration-300">
                                    Lost Pet Map
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/petSpa" className="text-black hover:text-blue-500 transition-all duration-300">
                                    Pet Spa Services
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/c2c" className="text-black hover:text-blue-500 transition-all duration-300">
                                    Pet Marketplace
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="">
                        <h3 className="text-black font-medium">
                            Socials
                        </h3>
                        <ul className="mt-4 text-sm text-black">
                            <li className="mt-2">
                                <Link href="https://github.com/htoothetnaung/PawX" target="_blank" className="text-black hover:text-blue-500 transition-all duration-300 flex items-center gap-2">
                                    GitHub
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="https://uit.edu.mm" target="_blank" className="text-black hover:text-blue-500 transition-all duration-300 flex items-center gap-2">
                                    UIT
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="https://pet-image-analyzer.streamlit.app/" target="_blank" className="text-black hover:text-blue-500 transition-all duration-300 flex items-center gap-2">
                                    AI App
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-base font-medium text-black">
                            Contact Us
                        </h3>
                        <ul className="mt-4 text-sm text-black">
                            <li className="">
                                <Link href="mailto:htoothetnaung@uit.edu.mm" className="hover:text-blue-500 transition-all duration-300">
                                    📧 htoothetnaung@uit.edu.mm
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="tel:+959123456789" className="hover:text-blue-500 transition-all duration-300">
                                    📞 +95 9123456789
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link href="https://maps.google.com" target="_blank" className="hover:text-blue-500 transition-all duration-300">
                                    📍 UIT, Parami Road
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            <div className="mt-8 border-t border-border/40 pt-4 md:pt-8 md:flex md:items-center md:justify-between w-full">
                <p className="text-sm text-black mt-8 md:mt-0">
                    &copy; {new Date().getFullYear()} UIT Batch-9 Java EE Group 3
                </p>
            </div>

        </footer>
    );
};

export default Footer;