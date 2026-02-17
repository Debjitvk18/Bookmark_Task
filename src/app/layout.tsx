import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Smart Bookmark Manager",
    description: "Manage your bookmarks with real-time sync across devices",
    openGraph: {
        title: "Smart Bookmark Manager",
        description: "Manage your bookmarks with real-time sync across devices",
        images: [
            {
                url: "/Frontimage.jpeg",
                width: 1200,
                height: 630,
                alt: "Smart Bookmark Manager",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Smart Bookmark Manager",
        description: "Manage your bookmarks with real-time sync across devices",
        images: ["/Frontimage.jpeg"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geist.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}
            >
                {children}
            </body>
        </html>
    );
}
