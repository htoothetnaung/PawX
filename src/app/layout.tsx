import { Footer } from "@/components";
import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner'
import Navbar from "@/components/home/navigation/navbar";

const font = Inter({ subsets: ["latin"] });

export const metadata = SITE_CONFIG;

export default function RootLayout({
    children,
    searchParams,
}: {
    children: React.ReactNode;
    searchParams: { message: string };
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen antialiased max-w-full overflow-x-hidden",
                    "bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800",
                    font.className
                )}
            >
                <Navbar />
                {searchParams?.message && (
                    <div className="fixed top-4 right-4 z-50">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{searchParams.message}</span>
                        </div>
                    </div>
                )}
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
};
