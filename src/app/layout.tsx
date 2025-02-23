import { Footer, Navbar } from "@/components";
import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";

const font = Inter({ subsets: ["latin"] });

export const metadata = SITE_CONFIG;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
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
                {children}
            </body>
        </html>
    );
};
