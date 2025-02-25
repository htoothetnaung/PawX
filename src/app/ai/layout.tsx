import { Footer, Navbar } from "@/components";
import React from 'react'

interface Props {
    children: React.ReactNode;
}

const MarketingLayout = ({ children }: Props) => {
    return (
        <div className="flex flex-col min-h-screen">
            
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
};

export default MarketingLayout
