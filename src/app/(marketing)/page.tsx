import { Container, Icons, Wrapper } from "@/components";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LampContainer } from "@/components/ui/lamp";
import Marquee from "@/components/ui/marquee";
import SectionBadge from "@/components/ui/section-badge";
import SparklesText from "@/components/ui/sparklesText";
import { TypewriterEffect, TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { features, perks, pricingCards, reviews } from "@/constants";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight, UserIcon, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedHero } from "@/components/animated-hero";
import { FeatureCards } from "@/components/feature-cards";

// necessary declarations for ui components

const wordsForTypeEffect = [
    {
        text: "Building",
    },
      {
        text: "A World",
      },
      {
        text: "Where",
      },
    {
      text: "No Tail",
    },
    {
      text: "Wags",
    },
    
    {
      text: "Alone.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];


const HomePage = () => {

    const firstRow = reviews.slice(0, reviews.length / 2);
    const secondRow = reviews.slice(reviews.length / 2);

    return (
        <section className="w-full relative flex items-center justify-center flex-col px-4 md:px-0 py-8">
            {/* Decorative pet images in background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Top right image */}
                <div className="absolute top-10 right-10 w-48 h-48 opacity-30 rotate-12">
                    <Image
                        src="/pets/petFamily1.jpg"
                        alt="Decorative pet family"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* Bottom left image */}
                <div className="absolute bottom-20 left-10 w-56 h-56 opacity-30 -rotate-12">
                    <Image
                        src="/pets/panda.jpg"
                        alt="Decorative panda"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* Middle right image */}
                <div className="absolute top-1/2 right-20 w-52 h-52 opacity-30 rotate-6">
                    <Image
                        src="/pets/dog.jpg"
                        alt="Decorative pet family 2"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* Middle left image */}
                <div className="absolute top-1/3 left-20 w-44 h-44 opacity-30 -rotate-6">
                    <Image
                        src="/pets/cat2.jpg"
                        alt="Decorative cat"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* New: Bottom right image */}
                <div className="absolute bottom-40 right-24 w-48 h-48 opacity-30 rotate-12">
                    <Image
                        src="/pets/dog2.jpg"
                        alt="Decorative dog"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* New: Top left image */}
                <div className="absolute top-32 left-32 w-40 h-40 opacity-30 -rotate-6">
                    <Image
                        src="/pets/penguin.jpg"
                        alt="Decorative penguin"
                        fill
                        className="object-contain"
                    />
                </div>
                {/* Paw print pattern background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.08] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 28c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' fill='%23FDA4AF' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <Wrapper>
                <Container>
                    <AnimatedHero />
                    <FeatureCards />
                </Container>
            </Wrapper>

            {/* hero */}
            <Wrapper>
                {/* <div className="absolute inset-0 dark:bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10 h-[150vh]" /> */}

                <Container>
                    <div className="flex flex-col items-center justify-center py-20 h-full">
                        <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
                            <span>
                                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
                            </span>
                            <span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
                            <span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/40"></span>
                            <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1.5">
                                <Image src="/icons/sparkles-dark.svg" alt="✨" width={24} height={24} className="w-4 h-4" />
                                Introducing Our New AI Model
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        </button>

                        <div className="flex flex-col items-center mt-8 max-w-3xl w-11/12 md:w-full">
                        
                            <SparklesText text="Your Pet's Paradise All In One Place"
                            className="text-3xl md:text-4xl lg:text-4xl "
                            colors={
                                {
                                    first: "#000000",
                                    second: "#643B9F"
                                }
                            }
                            />
                            {/* <p className="text-base md:text-lg text-foreground/80 mt-6 text-center">
                                Zero code, maximum speed. Make professional sites easy, fast and fun while delivering best-in-class SEO, performance.
                            </p> */}    
                            <TypewriterEffectSmooth words={wordsForTypeEffect} 
                            className="text-sm md:text-2xl lg:text-sm"
                            />
                            <div className="hidden md:flex relative items-center justify-center mt-8 md:mt-12 w-full">
                                <Link href="/ai" className="flex items-center justify-center w-max rounded-full border-t border-foreground/30 bg-white/20 backdrop-blur-lg px-2 py-1 md:py-2 gap-2 md:gap-8 shadow-3xl shadow-background/40 cursor-pointer select-none">
                                    <p className="text-[#2C3227] text-sm text-center md:text-base font-medium pl-4 pr-4 lg:pr-0">
                                        ✨ {"  "} Start Searching For Your Lost Pets Now!
                                    </p>
                                    <Button size="sm" className="rounded-full hidden lg:flex border border-foreground/20">
                                        Get Started
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative flex items-center py-10 md:py-20 w-full">
                            <div className="absolute top-1/2 left-1/2 -z-10 gradient w-3/4 -translate-x-1/2 h-3/4 -translate-y-1/2 inset-0 blur-[10rem]"></div>
                             <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
                                <Image
                                    src="/assets/lost_and_found.jpg"
                                    alt="banner image"
                                    width={1200}
                                    height={1200}
                                    quality={100}   
                                    className="rounded-md lg:rounded-xl bg-foreground/10 shadow-2xl ring-1 ring-border"
                                />

                                <BorderBeam size={250} duration={12} delay={9} />


                            </div>

                            
                        </div>
                    </div>
                </Container>
            </Wrapper>



            {/* how it works */}
            <Wrapper className="flex flex-col items-center justify-center py-12 relative">
                <Container>
                    <div className="max-w-md mx-auto text-start md:text-center">
                        <SectionBadge title="The Process" />
                        <h2 className="text-3xl lg:text-4xl font-semibold mt-6">
                            Three steps to use PawX Ai
                        </h2>
                       
                    </div>
                </Container>
                <Container>
                    <div className="flex flex-col items-center justify-center py-10 md:py-20 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full divide-x-0 md:divide-x divide-y md:divide-y-0 divide-gray-900 first:border-l-2 lg:first:border-none first:border-gray-900">
                            {perks.map((perk) => (
                                <div key={perk.title} className="flex flex-col items-start px-4 md:px-6 lg:px-8 lg:py-6 py-4">
                                    <div className="flex items-center justify-center text-2xl">
                                        <span>{perk.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-medium mt-4">
                                        {perk.title}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 text-start lg:text-start">
                                        {perk.info}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </Wrapper>

            {/* features */}
            <Wrapper className="flex flex-col items-center justify-center py-12 relative">
                <div id="features" className="hidden md:block absolute top-0 -right-1/3 w-72 h-72 bg-orange-200/30 rounded-full blur-[10rem] -z-10"></div>
                <div id="features" className="hidden md:block absolute bottom-0 -left-1/3 w-72 h-72 bg-rose-200/30 rounded-full blur-[10rem] -z-10"></div>
                <Container>
                    <div className="max-w-md mx-auto text-start md:text-center">
                        <SectionBadge title="Features" />
                        <h2 className="text-3xl lg:text-4xl font-semibold mt-6">
                            Discover our powerful features
                        </h2>
                        <p className="text-muted-foreground mt-6">
                            We offers a range of features to help you cater your pet's needs
                        </p>
                    </div>
                </Container>
                <Container>
                    <div className="flex items-center justify-center mx-auto mt-8">
                        <Icons.feature className="w-auto h-80" />
                    </div>
                </Container>
                <Container>
                    <div className="flex flex-col items-center justify-center py-10 md:py-20 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8">
                            {features.map((feature) => (
                                <div key={feature.title} className="flex flex-col items-start lg:items-start px-0 md:px-0">
                                    <div className="flex items-center justify-center text-2xl">
                                        <span>{feature.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-medium mt-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">{feature.info}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </Wrapper>

            

            

        </section>
    )
};

export default HomePage
