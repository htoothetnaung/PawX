import { Footer } from "@/components";
import { Navbar } from "@/components";
import React from 'react'

interface Props {
    children: React.ReactNode;
}

export default function MapLayout({ children }: Props) {
    return (
        <div className="flex flex-col min-h-screen">
           
            <main className="flex-grow relative">
                <div className="absolute top-4 left-4 z-50 bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-2">Map Legend</h3>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            <span>User Reports</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                            <span>Shelter Locations</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                            <span>Delivery Locations</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                            <span>Your Location</span>
                        </div>
                    </div>
                </div>
                {children}
            </main>
            <Footer />
        </div>
    )
}
