import { Footer } from "@/components";
import { Navbar } from "@/components";
import React from 'react'
import ReportsList  from "@/components/ReportsList";

interface Props {
    children: React.ReactNode;
}

export default function MapLayout({ children }: Props) {
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-4 gap-4">
                    {/* Left side - Legend and Reports */}
                    <div className="col-span-1 space-y-4">
                        {/* Map Legend */}
                        <div className="bg-white p-4 rounded-lg shadow-md">
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

                        {/* Reports List */}
                        <ReportsList />
                    </div>

                    {/* Right side - Map */}
                    <div className="col-span-3">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
